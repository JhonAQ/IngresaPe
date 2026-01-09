import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import { PrismaClient, Role } from '@prisma/client';
import type { AppRouterType } from './apps/api/src/app/app.router';

// --- CONFIGURACIÓN ---
const prisma = new PrismaClient();
const TIMESTAMP = Date.now();
const STUDENT_EMAIL = `cachimbo_${TIMESTAMP}@test.com`;
const ADMIN_EMAIL = `director_${TIMESTAMP}@test.com`;
const PASSWORD = 'password123';

// 👇 TRUCO MAESTRO: Forzamos el transformador manualmente
// Si 'superjson' se importó mal, esto explotará aquí mismo y nos dirá por qué.
const manualTransformer = {
  serialize: (object: any) => {
    // @ts-ignore
    const instance = superjson.default || superjson; 
    return instance.serialize(object);
  },
  deserialize: (object: any) => {
    // @ts-ignore
    const instance = superjson.default || superjson;
    return instance.deserialize(object);
  }
};

// Cliente base (sin auth)
const publicClient = createTRPCProxyClient<AppRouterType>({
  transformer: manualTransformer, // 👈 Usamos nuestro wrapper manual
  links: [httpLink({ url: 'http://localhost:3000/trpc', headers: async () => ({}) })],
});

async function main() {
  console.log(`\n🎬 --- INICIANDO TEST COMPLETO: "EL CAMINO DEL CACHIMBO" --- 🎬`);
  console.log(`   📅 Timestamp: ${TIMESTAMP}`);
  
  // =================================================================
  // 🎭 ACTO 1: EL NACIMIENTO (Registro y Setup)
  // =================================================================
  console.log('\n👶 [ACTO 1] REGISTRO Y SETUP');

  // 1. Registrar Admin
  console.log('   🛠️  Registrando Director...');
  try {
    const adminReg = await publicClient.auth.register.mutate({ 
      email: ADMIN_EMAIL, 
      password: PASSWORD, 
      name: 'Director Admin' 
    });
    // Promoción Divina
    await prisma.user.update({ where: { id: adminReg.user.id }, data: { role: Role.ADMIN } });
    console.log('   ✅ Admin registrado y promovido.');
  } catch (e: any) {
    console.log('   ⚠️  (Nota) Si falló registro, continuamos (quizás ya existía)...');
  }

  // 1.2 Login Admin
  const adminAuth = await publicClient.auth.login.mutate({ email: ADMIN_EMAIL, password: PASSWORD });
  const adminClient = createTRPCProxyClient<AppRouterType>({
    transformer: manualTransformer, // 👈 Aplicamos wrapper aquí también
    links: [httpLink({ url: 'http://localhost:3000/trpc', headers: () => ({ Authorization: `Bearer ${adminAuth.token}` }) })],
  });

  // 1.3 Registro Estudiante
  console.log('   🎓 Registrando Estudiante Nuevo...');
  const studentReg = await publicClient.auth.register.mutate({ 
    email: STUDENT_EMAIL, 
    password: PASSWORD, 
    name: 'Cachimbo 2026' 
  });
  
  // 1.4 Login Estudiante
  const studentAuth = await publicClient.auth.login.mutate({ email: STUDENT_EMAIL, password: PASSWORD });
  const studentClient = createTRPCProxyClient<AppRouterType>({
    transformer: manualTransformer, // 👈 Y aquí
    links: [httpLink({ url: 'http://localhost:3000/trpc', headers: () => ({ Authorization: `Bearer ${studentAuth.token}` }) })],
  });
  console.log('   ✅ Estudiante registrado y logueado.');


  // =================================================================
  // 📚 ACTO 2: LA ACADEMIA (Creación de Contenido)
  // =================================================================
  console.log('\n📚 [ACTO 2] CREANDO CONTENIDO (ADMIN)');

  // Setup Rápido de Curso/Tema en DB
  const course = await prisma.course.create({
    data: { name: `Curso Test ${TIMESTAMP}`, slug: `test-${TIMESTAMP}`, area: 'INGENIERIAS' }
  });
  const topic = await prisma.topic.create({
    data: { name: 'Tema Test', slug: `tema-${TIMESTAMP}`, order: 1, courseId: course.id }
  });

  console.log('   📝 Admin subiendo pregunta al sistema...');
  const question = await adminClient.admin.createQuestion.mutate({
    statement: '¿Cuál es la capital de Arequipa?',
    difficulty: 'EASY',
    topicId: topic.id,
    options: [
      { text: 'Lima', isCorrect: false },
      { text: 'Arequipa', isCorrect: true },
      { text: 'Cusco', isCorrect: false }
    ],
    explanation: 'Arequipa es la capital de la región Arequipa.',
  });
  console.log(`   ✅ Pregunta creada ID: ${question.id}`);


  // =================================================================
  // 🎮 ACTO 3: EL JUEGO (Ganar XP y Monedas)
  // =================================================================
  console.log('\n🎮 [ACTO 3] EL ESTUDIANTE JUEGA');

  const qData = await studentClient.learning.getRandomQuestion.query({ topicId: topic.id });
  console.log(`   ❓ Pregunta recibida: "${qData.statement}"`);

  // Buscamos la correcta
  const options = qData.options as any[];
  const correctIndex = options.findIndex((o: any) => o.text === 'Arequipa'); 
  
  const answerResult = await studentClient.learning.submitAnswer.mutate({
    questionId: qData.id,
    selectedOptionIndex: correctIndex
  });

  console.log(`   ✅ Respuesta enviada. Resultado: ${answerResult.correct ? 'CORRECTA' : 'INCORRECTA'}`);
  console.log(`   💰 Ganancias: +${answerResult.rewards.xp} XP | +${answerResult.rewards.coins} Monedas`);


  // =================================================================
  // 🛒 ACTO 4: LA TIENDA (Economía)
  // =================================================================
  console.log('\n🛒 [ACTO 4] GASTANDO EL DINERO');

  // Inyectamos dinero para testear compra
  await prisma.user.update({ where: { id: studentReg.user.id }, data: { coins: 500 } });
  
  const catalog = await studentClient.shop.getCatalog.query();
  const itemToBuy = catalog[0]; 
  console.log(`   🛍️ Comprando item: ${itemToBuy.name} (${itemToBuy.price} monedas)`);

  const purchase = await studentClient.shop.buyItem.mutate({ itemId: itemToBuy.id });
  console.log(`   ✅ Compra realizada. Saldo restante: ${purchase.user.coins}`);

  console.log('   👕 Equipando nuevo avatar...');
  const profileUpdated = await studentClient.profile.update.mutate({ image: itemToBuy.id });
  console.log(`   ✅ Avatar actual: ${profileUpdated.user.image}`);


  // =================================================================
  // 💎 ACTO 5: LA SUSCRIPCIÓN (Business)
  // =================================================================
  console.log('\n💎 [ACTO 5] PROCESO PREMIUM');

  console.log('   📄 Estudiante sube comprobante de pago...');
  const subRequest = await studentClient.subscription.requestSubscription.mutate({
    plan: 'MONTHLY',
    amount: 9.90,
    proofUrl: 'https://fake-bank.com/voucher.jpg'
  });
  console.log(`   ✅ Solicitud enviada (ID: ${subRequest.id}).`);

  // Admin revisa
  console.log('   🧐 Admin aprobando solicitud...');
  await adminClient.subscription.processRequest.mutate({
    subscriptionId: subRequest.id,
    action: 'APPROVE'
  });
  console.log('   ✅ Pago Aprobado');

  // Verificación
  const finalProfile = await studentClient.profile.getMe.query();
  console.log(`   🕵️‍♂️ Verificando estado final...`);
  console.log(`      Premium: ${finalProfile.isPremium ? 'SÍ 🌟' : 'NO'}`);

  if (finalProfile.isPremium) {
    console.log('\n🎉 --- TEST FINALIZADO: ÉXITO ROTUNDO --- 🎉');
  } else {
    throw new Error('❌ El usuario debería ser Premium pero no lo es.');
  }
}

main()
  .catch((e) => {
    console.error('\n💥 CRASH DEL TEST:', e);
    if (e.meta?.responseJSON) console.error('📦 Respuesta Servidor:', JSON.stringify(e.meta.responseJSON, null, 2));
  })
  .finally(async () => await prisma.$disconnect());