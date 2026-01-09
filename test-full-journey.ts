import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import { PrismaClient, Role } from '@prisma/client';
import type { AppRouterType } from './apps/api/src/app/app.router';

// --- CONFIGURACIÓN ---
const prisma = new PrismaClient();
const TIMESTAMP = Date.now();
const STUDENT_EMAIL = `student_${TIMESTAMP}@test.com`;
const ADMIN_EMAIL = `admin_${TIMESTAMP}@test.com`;
const PASSWORD = 'password123';

// Cliente base (sin auth)
const publicClient = createTRPCProxyClient<AppRouterType>({
  transformer: superjson,
  links: [httpLink({ url: 'http://localhost:3000/trpc', headers: async () => ({}) })],
});

async function main() {
  console.log(`\n🎬 --- INICIANDO TEST COMPLETO: "EL CAMINO DEL CACHIMBO" --- 🎬`);
  console.log(`   📅 Timestamp: ${TIMESTAMP}`);

  // =================================================================
  // 🎭 ACTO 1: EL NACIMIENTO (Registro y Setup)
  // =================================================================
  console.log('\n👶 [ACTO 1] REGISTRO Y SETUP');

  // 1. Crear Admin (Vía Prisma para asegurar permisos inmediatos)
  console.log('   🛠️  Creando Administrador del sistema...');
  await prisma.user.create({
    data: { 
      email: ADMIN_EMAIL, 
      password: PASSWORD, // En un caso real, esto debería estar hasheado, pero para test funcional sirve si el login no hashea en este entorno o usamos el endpoint de registro
      name: 'Director UNSA', 
      role: Role.ADMIN 
    }
  });

  // Nota: Si tu backend hashea passwords en el login, crear el usuario por Prisma directo sin hash fallará el login.
  // Lo mejor es registrarse por API y luego promoverlo.
  // CORRECCIÓN: Vamos a registrar al admin por API y luego promoverlo.
  
  // Limpiamos el intento anterior de creación directa
  await prisma.user.deleteMany({ where: { email: { in: [ADMIN_EMAIL, STUDENT_EMAIL] } } });

  // 1.1 Registro real Admin
  const adminReg = await publicClient.auth.register.mutate({ email: ADMIN_EMAIL, password: PASSWORD, name: 'Director Admin' });
  await prisma.user.update({ where: { id: adminReg.user.id }, data: { role: Role.ADMIN } }); // ¡Promoción divina!
  
  // 1.2 Login Admin
  const adminAuth = await publicClient.auth.login.mutate({ email: ADMIN_EMAIL, password: PASSWORD });
  const adminClient = createTRPCProxyClient<AppRouterType>({
    transformer: superjson,
    links: [httpLink({ url: 'http://localhost:3000/trpc', headers: () => ({ Authorization: `Bearer ${adminAuth.token}` }) })],
  });
  console.log('   ✅ Admin registrado, promovido y logueado.');

  // 1.3 Registro Estudiante
  console.log('   🎓 Registrando Estudiante Nuevo...');
  const studentReg = await publicClient.auth.register.mutate({ email: STUDENT_EMAIL, password: PASSWORD, name: 'Cachimbo 2026' });
  
  // 1.4 Login Estudiante
  const studentAuth = await publicClient.auth.login.mutate({ email: STUDENT_EMAIL, password: PASSWORD });
  const studentClient = createTRPCProxyClient<AppRouterType>({
    transformer: superjson,
    links: [httpLink({ url: 'http://localhost:3000/trpc', headers: () => ({ Authorization: `Bearer ${studentAuth.token}` }) })],
  });
  console.log('   ✅ Estudiante registrado y logueado.');


  // =================================================================
  // 📚 ACTO 2: LA ACADEMIA (Creación de Contenido)
  // =================================================================
  console.log('\n📚 [ACTO 2] CREANDO CONTENIDO (ADMIN)');

  // Admin crea un curso y temas para que el alumno tenga qué jugar
  // Usamos Prisma directo para setup rápido de infraestructura base, o endpoints si existen.
  // Usaremos Prisma para Course/Topic y endpoint para Pregunta (probar Admin Router).
  
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

  // Estudiante pide una pregunta
  const qData = await studentClient.learning.getRandomQuestion.query({ topicId: topic.id });
  console.log(`   ❓ Pregunta recibida: "${qData.statement}"`);

  // Estudiante responde (buscamos el índice correcto tramposamente para el test)
  const correctIndex = (qData.options as any[]).findIndex((o: any) => o.text === 'Arequipa'); // Sabemos que creamos esa
  
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

  // Truco: Damos más monedas al usuario por DB para que pueda comprar, 
  // ya que una sola pregunta da pocas monedas.
  await prisma.user.update({ where: { id: studentReg.user.id }, data: { coins: 500 } });
  console.log('   💳 (Sistema) Se inyectaron monedas extra al estudiante para test de compras.');

  const catalog = await studentClient.shop.getCatalog.query();
  const itemToBuy = catalog[0]; // Compramos el primero
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
  console.log(`   ✅ Solicitud enviada (ID: ${subRequest.id}). Estado: ${subRequest.status}`);

  // Admin revisa
  console.log('   🧐 Admin revisando solicitudes pendientes...');
  const pending = await adminClient.subscription.getPendingRequests.query();
  console.log(`   📋 Encontradas: ${pending.length} solicitud(es).`);

  const targetReq = pending.find(p => p.id === subRequest.id);
  if (targetReq) {
    console.log('   ✅ Aprobando solicitud del estudiante...');
    await adminClient.subscription.processRequest.mutate({
      subscriptionId: targetReq.id,
      action: 'APPROVE'
    });
  } else {
    throw new Error('❌ El Admin no encontró la solicitud de pago.');
  }

  // Verificación final del estudiante
  const finalProfile = await studentClient.profile.getMe.query();
  console.log(`   🕵️‍♂️ Verificando estado final del estudiante...`);
  console.log(`      Premium: ${finalProfile.isPremium ? 'SÍ 🌟' : 'NO'}`);
  console.log(`      Vence: ${finalProfile.subExpiresAt}`);

  if (finalProfile.isPremium) {
    console.log('\n🎉 --- TEST FINALIZADO: ÉXITO ROTUNDO --- 🎉');
  } else {
    console.error('\n❌ ERROR: El usuario debería ser Premium pero no lo es.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('\n💥 CRASH DEL TEST:', e);
    // Si hay respuesta del servidor, mostrarla
    if (e.meta?.responseJSON) {
        console.error('📦 Respuesta Servidor:', JSON.stringify(e.meta.responseJSON, null, 2));
    }
  })
  .finally(async () => await prisma.$disconnect());