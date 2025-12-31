// test-game-flow.ts
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouterType } from './apps/api/src/app/app.router'; // Asegúrate que la ruta sea correcta

const client = createTRPCProxyClient<AppRouterType>({
  links: [
    httpLink({ // Cambiado de httpBatchLink a httpLink para evitar problemas de serialización
      url: 'http://localhost:3000/trpc',
      transformer: superjson,
      // Headers dinámicos para inyectar el token
      headers: () => {
        if (token) return { Authorization: `Bearer ${token}` };
        return {};
      },
    }),
  ],
});

let token = '';

async function main() {
  console.log('🦖 INICIANDO PRUEBA INTEGRAL DEL SISTEMA INGRESA.PE 🦖\n');

  try {
    // ----------------------------------------------------
    // PASO 1: AUTENTICACIÓN
    // ----------------------------------------------------
    console.log('1️⃣  Autenticando Usuario...');
    const email = `testuser_${Date.now()}@ingresa.pe`; // Email único
    const password = 'password123';
    
    // Registramos un usuario nuevo para la prueba
    try {
      const authResponse = await client.auth.register.mutate({
        email,
        password,
        name: 'Tester Ingresa',
      });
      
      token = authResponse.token;
      console.log(`   ✅ Usuario registrado: ${authResponse.user.name}`);
      console.log(`   🔑 Token obtenido: ${token.substring(0, 15)}...`);
    } catch (error: unknown) {
      console.error('   ❌ Error en registro:', error instanceof Error ? error.message : 'Error desconocido');
      if (error && typeof error === 'object' && 'shape' in error) {
        console.error('   Shape:', error.shape);
      }
      if (error && typeof error === 'object' && 'data' in error) {
        console.error('   Data:', error.data);
      }
      throw error;
    }

    // ----------------------------------------------------
    // PASO 2: EXPLORAR CONTENIDO (Lector)
    // ----------------------------------------------------
    console.log('\n2️⃣  Explorando Cursos...');
    const courses = await client.content.getCourses.query();
    
    if (courses.length === 0) {
      console.error('   ❌ ERROR: No hay cursos en la base de datos. ¡Crea uno manual primero!');
      return;
    }
    const courseId = courses[0].id;
    console.log(`   ✅ Curso encontrado: ${courses[0].name} (ID: ${courseId})`);

    console.log('\n   Obteniendo Temas y Progreso Inicial...');
    const topics = await client.content.getTopics.query({ courseId });
    if (topics.length === 0) {
      console.error('   ❌ ERROR: El curso no tiene temas.');
      return;
    }
    const topic = topics[0];
    console.log(`   ✅ Tema seleccionado: ${topic.name}`);
    console.log(`   📊 Progreso actual: ${topic.userProgress.correctCount} / ${topic.userProgress.goal} correctas`);

    // ----------------------------------------------------
    // PASO 3: PEDIR PREGUNTAS (Motor Dinámico)
    // ----------------------------------------------------
    console.log('\n3️⃣  Pidiendo Preguntas (Quiz)...');
    const questions = await client.content.getQuestions.query({
      topicId: topic.id,
      limit: 1, // Solo pedimos 1 para la prueba rápida
      excludeAnswered: true // ¡IMPORTANTE! Probar el filtro
    });

    if (questions.length === 0) {
      console.warn('   ⚠️  No hay preguntas disponibles (¿Quizás ya respondiste todas?). Crea preguntas en la DB.');
      return;
    }
    const question = questions[0];
    console.log(`   ✅ Pregunta recibida: "${question.statement.substring(0, 40)}..."`);
    console.log(`   🆔 ID: ${question.id}`);

    // ----------------------------------------------------
    // PASO 4: JUGAR (Escritor - GameRouter)
    // ----------------------------------------------------
    console.log('\n4️⃣  Enviando Respuesta...');
    // Simulamos marcar la opción 0 (la primera)
    const gameResult = await client.game.submitAnswer.mutate({
      questionId: question.id,
      selectedOptionIndex: 0 
    });

    console.log(`   ✅ Respuesta procesada con éxito!`);
    console.log(`      Resultado: ${gameResult.isCorrect ? '✅ CORRECTA' : '❌ INCORRECTA'}`);
    console.log(`      XP Actual: ${gameResult.userStats.xp}`);
    console.log(`      Energía: ${gameResult.userStats.energy}`);

    // ----------------------------------------------------
    // PASO 5: VERIFICACIÓN FINAL (Anti-Repetición)
    // ----------------------------------------------------
    console.log('\n5️⃣  Verificando lógica "Anti-Repetición"...');
    // Pedimos preguntas de nuevo. La pregunta anterior NO debería salir.
    const newQuestions = await client.content.getQuestions.query({
      topicId: topic.id,
      limit: 5,
      excludeAnswered: true
    });
    
    const isRepeated = newQuestions.some(q => q.id === question.id);
    if (isRepeated) {
      console.error('   ❌ FALLO CRÍTICO: La pregunta respondida volvió a salir.');
    } else {
      console.log('   ✅ ÉXITO TOTAL: La pregunta respondida desapareció del pool.');
    }

    // Verificamos si el progreso del tema subió (solo si acertamos)
    if (gameResult.isCorrect) {
        const updatedTopics = await client.content.getTopics.query({ courseId });
        const updatedTopic = updatedTopics.find(t => t.id === topic.id);
        console.log(`   📊 Nuevo Progreso: ${updatedTopic?.userProgress.correctCount} correctas (Antes: ${topic.userProgress.correctCount})`);
    }

    console.log('\n🎉 PRUEBA COMPLETADA SATISFACTORIAMENTE 🎉');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA PRUEBA:', error);
  }
}

main();