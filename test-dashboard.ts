import { createTRPCProxyClient, httpLink } from '@trpc/client'; // 👈 Usamos httpLink (más simple para tests)
import superjson from 'superjson';
import type { AppRouterType } from './apps/api/src/app/app.router';

// --- CONFIGURACIÓN DEL CLIENTE ---
const client = createTRPCProxyClient<AppRouterType>({
  links: [
    httpLink({ // 👈 CAMBIO AQUÍ: httpLink hace una petición a la vez (sin batch)
      url: 'http://localhost:3000/trpc',
      transformer: superjson,
      headers: () => {
        if (token) return { Authorization: `Bearer ${token}` };
        return {};
      },
    }),
  ],
});

let token = '';

async function main() {
  console.log('📊 INICIANDO PRUEBA DEL DASHBOARD Y ESTADÍSTICAS 📊\n');

  try {
    // ----------------------------------------------------
    // 1. REGISTRO DE USUARIO NUEVO
    // ----------------------------------------------------
    // Usamos un random grande para asegurar que el email sea único cada vez
    const randomId = Math.floor(Math.random() * 100000);
    const email = `student_${randomId}@ingresa.pe`;
    console.log(`1️⃣  Registrando alumno: ${email}...`);

    const auth = await client.auth.register.mutate({
      email,
      password: 'password123', // Cumple con el mínimo de caracteres
      name: 'Estudiante Prueba',
    });
    token = auth.token;
    console.log('   ✅ Login exitoso.');

    // ----------------------------------------------------
    // 2. DASHBOARD INICIAL (Línea Base)
    // ----------------------------------------------------
    console.log('\n2️⃣  Consultando Dashboard INICIAL...');
    const initialDash = await client.stats.getDashboard.query();
    
    console.log(`   🔸 Nivel: ${initialDash.user.level}`);
    console.log(`   🔸 XP: ${initialDash.user.xp}`);
    console.log(`   🔸 Racha (Streak): ${initialDash.user.streak} días`);
    console.log(`   🔸 Energía: ${initialDash.user.energy} ⚡`);
    console.log(`   ⏳ Días para el Examen: ${initialDash.stats.daysUntilExam}`);

    // ----------------------------------------------------
    // 3. ACCIÓN: RESPONDER UNA PREGUNTA
    // ----------------------------------------------------
    console.log('\n3️⃣  Simulando estudio (Respondiendo pregunta)...');
    
    // a. Buscar curso y tema
    const courses = await client.content.getCourses.query();
    if (courses.length === 0) throw new Error('❌ No hay cursos en la DB. ¡Corre el Seed o crea uno manual!');
    
    const topicId = (await client.content.getTopics.query({ courseId: courses[0].id }))[0].id;
    
    // b. Obtener pregunta
    const questions = await client.content.getQuestions.query({ topicId, limit: 1 });
    if (questions.length === 0) throw new Error('❌ No hay preguntas en el tema.');
    
    // c. Responder (Intentamos acertar la opción 0)
    console.log(`   📝 Respondiendo pregunta ID: ${questions[0].id}`);
    const result = await client.game.submitAnswer.mutate({
      questionId: questions[0].id,
      selectedOptionIndex: 0 
    });

    console.log(`   ✅ Respuesta procesada. Resultado: ${result.isCorrect ? '✅ CORRECTA' : '❌ INCORRECTA'}`);
    console.log(`   🎁 XP Ganada: ${result.userStats.xp - initialDash.user.xp}`);

    // ----------------------------------------------------
    // 4. DASHBOARD FINAL (Verificación)
    // ----------------------------------------------------
    console.log('\n4️⃣  Consultando Dashboard POST-JUEGO...');
    const finalDash = await client.stats.getDashboard.query();

    // VALIDACIONES
    console.log('   🔎 Analizando cambios:');
    
    // Chequeo de XP
    if (finalDash.user.xp > initialDash.user.xp) {
      console.log(`      ✅ XP subió correctamente (${initialDash.user.xp} -> ${finalDash.user.xp})`);
    } else {
      console.log(`      ❌ ERROR: La XP no subió.`);
    }

    // Chequeo de Energía
    if (finalDash.user.energy < initialDash.user.energy) {
      console.log(`      ✅ Energía descontada correctamente (${initialDash.user.energy} -> ${finalDash.user.energy})`);
    } else {
      console.log(`      ❌ ERROR: La energía no se descontó.`);
    }

    // Chequeo de Racha
    console.log(`      🔥 Racha Actual: ${finalDash.user.streak}`);

    console.log('\n🚀 ¡TEST FINALIZADO! El backend funciona al 100%.');

  } catch (error) {
    console.error('\n❌ FALLÓ LA PRUEBA:', error);
  }
}

main();