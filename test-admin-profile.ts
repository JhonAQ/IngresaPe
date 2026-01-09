import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import { PrismaClient, Role } from '@prisma/client'; 
import type { AppRouterType } from './apps/api/src/app/app.router';

const prisma = new PrismaClient();

// 🗑️ BORRADO: const commonHeaders ... (tRPC lo hace solo)

const client = createTRPCProxyClient<AppRouterType>({
  transformer: superjson, // ✅ ESTO SÍ SE QUEDA
  links: [
    httpLink({
      url: 'http://localhost:3000/trpc',
      // 🗑️ BORRADO: headers: async () => commonHeaders
      // No necesitamos headers aquí para el login
      headers: async () => ({}), 
    }),
  ],
});

async function main() {
  const EMAIL_TEST = 'competidor27@test.com'; 
  
  console.log('🛠️  PREPARANDO ENTORNO DE PRUEBA...');
  // 1. Asegurar Admin
  const user = await prisma.user.findUnique({ where: { email: EMAIL_TEST } });
  if (!user) throw new Error(`Usuario ${EMAIL_TEST} no encontrado.`);

  await prisma.user.update({
    where: { id: user.id },
    data: { role: Role.ADMIN } 
  });
  console.log(`✅ Usuario ${user.name} ahora es ADMIN.`);

  // 2. Crear Topic Dummy
  let topic = await prisma.topic.findFirst();
  if (!topic) {
     const course = await prisma.course.create({
       data: { name: 'Curso Test Admin', slug: 'test-admin', area: 'INGENIERIAS' }
     });
     topic = await prisma.topic.create({
       data: { name: 'Tema Test', slug: 'tema-test', order: 1, courseId: course.id }
     });
  }

  console.log('\n🚀 INICIANDO LOGIN...');
  // 3. Login
  const auth = await client.auth.login.mutate({
    email: EMAIL_TEST,
    password: 'password123'
  });
  console.log('✅ Login exitoso.');

  // 4. Cliente Autenticado
  const authedClient = createTRPCProxyClient<AppRouterType>({
    transformer: superjson,
    links: [
      httpLink({
        url: 'http://localhost:3000/trpc',
        headers: () => ({ 
          // ✅ Solo enviamos el Token. El Content-Type lo pone tRPC solo.
          Authorization: `Bearer ${auth.token}`,
        }),
      }),
    ],
  });

  // 5. Pruebas
  console.log('\n👤 [1/2] Probando Perfil...');
  const updated = await authedClient.profile.update.mutate({
    name: 'Admin Supremo',
    image: 'avatar_admin_final'
  });
  console.log(`   ✅ Nombre cambiado a: ${updated.user.name}`);

  console.log('\n👮 [2/2] Creando Pregunta...');
  const question = await authedClient.admin.createQuestion.mutate({
    statement: '¿Cuánto es 2 + 2?',
    difficulty: 'EASY',
    topicId: topic.id,
    options: [
      { text: '4', isCorrect: true },
      { text: 'Pez', isCorrect: false }
    ],
    explanation: 'Matemática básica',
  });
  console.log(`   ✅ Pregunta creada ID: ${question.id}`);
}

main()
  .catch((e) => {
    console.error('❌ ERROR:', e);
  })
  .finally(async () => await prisma.$disconnect());