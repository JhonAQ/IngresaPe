import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/trpc';

// --- HERRAMIENTA: Cliente HTTP Manual (Bypass tRPC Client) ---
async function trpcRequest(endpoint: string, payload: any, token?: string) {
  // 1. Envolvemos el payload como lo espera el servidor (SuperJSON format)
  const body = { json: payload };

  // 2. Hacemos la petición
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST', // tRPC usa POST para mutaciones y queries complejos
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  // 3. Procesamos respuesta
  const jsonResponse = await res.json();
  
  if (!res.ok || jsonResponse.error) {
    throw new Error(`Error en ${endpoint}: ${JSON.stringify(jsonResponse.error, null, 2)}`);
  }

  // 4. Desempaquetamos la respuesta de SuperJSON
  // Formato: { result: { data: { json: ... } } }
  return jsonResponse.result.data.json;
}

// --- HERRAMIENTA: GET para Queries (tRPC usa GET para queries por defecto) ---
async function trpcQuery(endpoint: string, params: any, token?: string) {
  // Para queries GET, tRPC espera el input en el query string codificado
  const input = JSON.stringify({ json: params });
  const url = `${API_URL}/${endpoint}?batch=1&input=${encodeURIComponent(input)}`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const jsonResponse = await res.json();
  // Los queries batch devuelven array, tomamos el primero
  const result = jsonResponse[0]; 

  if (!res.ok || result.error) {
     throw new Error(`Error en ${endpoint}: ${JSON.stringify(result.error || result, null, 2)}`);
  }
  return result.result.data.json;
}


async function main() {
  const TIMESTAMP = Date.now();
  const STUDENT_EMAIL = `cachimbo_${TIMESTAMP}@test.com`;
  const ADMIN_EMAIL = `director_${TIMESTAMP}@test.com`;
  const PASSWORD = 'password123';

  console.log(`\n🔥 --- INICIANDO TEST FINAL (MODO HTTP PURO) --- 🔥`);
  console.log(`   📅 Timestamp: ${TIMESTAMP}`);

  // =================================================================
  // 🎭 ACTO 1: REGISTRO Y SETUP
  // =================================================================
  console.log('\n👶 [1] REGISTRO Y SETUP');

  // 1. Registrar Admin
  console.log('   🛠️  Registrando Director...');
  try {
    const adminReg = await trpcRequest('auth.register', { 
      email: ADMIN_EMAIL, password: PASSWORD, name: 'Director Admin' 
    });
    // Promoción directa en DB
    await prisma.user.update({ where: { id: adminReg.user.id }, data: { role: Role.ADMIN } });
  } catch (e) { console.log('   ⚠️ Admin quizás ya existía'); }

  // 2. Login Admin
  const adminLogin = await trpcRequest('auth.login', { email: ADMIN_EMAIL, password: PASSWORD });
  const adminToken = adminLogin.token;
  console.log('   ✅ Admin logueado.');

  // 3. Registrar y Login Estudiante
  console.log('   🎓 Registrando Estudiante...');
  await trpcRequest('auth.register', { email: STUDENT_EMAIL, password: PASSWORD, name: 'Cachimbo 2026' });
  const studentLogin = await trpcRequest('auth.login', { email: STUDENT_EMAIL, password: PASSWORD });
  const studentToken = studentLogin.token;
  console.log('   ✅ Estudiante listo.');


  // =================================================================
  // 📚 ACTO 2: CONTENIDO
  // =================================================================
  console.log('\n📚 [2] CONTENIDO');
  
  // Setup DB directo
  const course = await prisma.course.create({ data: { name: `Curso ${TIMESTAMP}`, slug: `c-${TIMESTAMP}`, area: 'INGENIERIAS' }});
  const topic = await prisma.topic.create({ data: { name: 'Tema 1', slug: `t-${TIMESTAMP}`, order: 1, courseId: course.id }});

  console.log('   📝 Creando pregunta...');
  const question = await trpcRequest('admin.createQuestion', {
    statement: '¿2 + 2?', difficulty: 'EASY', topicId: topic.id,
    options: [{ text: '4', isCorrect: true }, { text: '5', isCorrect: false }],
    explanation: 'Suma básica'
  }, adminToken);
  console.log(`   ✅ Pregunta ID: ${question.id}`);


  // =================================================================
  // 🎮 ACTO 3: JUEGO
  // =================================================================
  console.log('\n🎮 [3] JUEGO');
  
  // Usamos request normal simulando query para simplificar el test script manual
  // Nota: getRandomQuestion es un Query, pero para probar usaremos request manual si es POST, 
  // si es GET strict, usaremos trpcQuery.
  const qData = await trpcQuery('learning.getRandomQuestion', { topicId: topic.id }, studentToken);
  console.log(`   ❓ Pregunta: ${qData.statement}`);

  const answer = await trpcRequest('learning.submitAnswer', {
    questionId: qData.id, selectedOptionIndex: 0 // Index 0 es "4" (Correcto)
  }, studentToken);
  
  console.log(`   ✅ Resultado: ${answer.correct ? 'CORRECTO' : 'FALLO'}`);
  console.log(`   💰 Ganaste: ${answer.rewards.coins} monedas.`);


  // =================================================================
  // 🛒 ACTO 4: TIENDA
  // =================================================================
  console.log('\n🛒 [4] TIENDA');
  
  // Inyectar dinero
  await prisma.user.update({ where: { email: STUDENT_EMAIL }, data: { coins: 500 } });
  
  const catalog = await trpcQuery('shop.getCatalog', {}, studentToken);
  const item = catalog[0];
  console.log(`   🛍️ Comprando: ${item.name}`);

  const purchase = await trpcRequest('shop.buyItem', { itemId: item.id }, studentToken);
  console.log(`   ✅ Saldo restante: ${purchase.user.coins}`);

  await trpcRequest('profile.update', { image: item.id }, studentToken);
  console.log('   ✅ Avatar equipado.');


  // =================================================================
  // 💎 ACTO 5: SUSCRIPCIÓN
  // =================================================================
  console.log('\n💎 [5] SUSCRIPCIÓN');

  const sub = await trpcRequest('subscription.requestSubscription', {
    plan: 'MONTHLY', amount: 9.90, proofUrl: 'https://img.com/voucher'
  }, studentToken);
  console.log('   ✅ Solicitud enviada.');

  await trpcRequest('subscription.processRequest', {
    subscriptionId: sub.id, action: 'APPROVE'
  }, adminToken);
  console.log('   ✅ Admin aprobó solicitud.');

  const profile = await trpcQuery('profile.getMe', {}, studentToken);
  console.log(`   🕵️‍♂️ Estado Final: Premium = ${profile.isPremium}`);

  if (profile.isPremium) {
    console.log('\n🏆 ¡SISTEMA OPERATIVO Y VERIFICADO! 🏆');
  } else {
    throw new Error('Fallo en premium');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());