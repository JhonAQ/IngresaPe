import { PrismaClient, ExamMode, ExamStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Ana', 'Beto', 'Carla', 'Diego', 'Elena', 'Fernando', 'Gaby', 'Hugo',
  'Inés', 'Juan', 'Kevin', 'Laura', 'Mario', 'Natalia', 'Oscar', 'Paula',
  'Quique', 'Rosa', 'Sergio', 'Tania', 'Víctor', 'Wendy', 'Ximena', 'Yolo', 'Zack',
  'Valentina', 'Mateo', 'Camila', 'Lucas', 'Isabella', 'Sebastián', 'Mariana',
  'Daniel', 'Sofía', 'Alejandro', 'Jimena', 'Tomás', 'Renata', 'Emilio', 'Antonella',
  'Joaquín', 'Martina', 'Leonardo', 'Paulina', 'Ricardo', 'Fernanda', 'Andrés', 'Catalina',
  'Diego', 'Victoria', 'Gabriel', 'Daniela', 'Samuel', 'Natalie', 'Adrián', 'Juliana',
  'Bruno', 'Emma', 'Maximiliano', 'Olivia', 'Thiago', 'Luciana', 'Iker', 'María',
  'Hugo', 'Aitana', 'Dylan', 'Sara', 'Ian', 'Eva', 'Julián', 'Alma',
];

const LAST_NAMES = [
  'Quispe', 'Mamani', 'Rojas', 'García', 'Flores', 'López', 'Torres', 'Vargas',
  'Mendoza', 'Castillo', 'Chávez', 'Vega', 'Espinoza', 'Paredes', 'Cruz', 'Morales',
  'Reyes', 'Herrera', 'Medina', 'Aguilar', 'Soto', 'Silva', 'Ruiz', 'Contreras',
  'Sandoval', 'Iglesias', 'Palacios', 'Vásquez', 'Salazar', 'Navarro', 'Valencia',
  'Guerrero', 'Córdova', 'Bautista', 'Carrasco', 'Villanueva', 'Ramos', 'Campos',
  'Santos', 'Domínguez', 'Delgado', 'Guzmán', 'Vilca', 'Tapia', 'Ponce', 'Ventura',
];

// Rangos de puntaje semanal que determinan la liga.
const LEAGUE_SCORE_RANGES = [
  { leagueIndex: 0, min: 15, max: 39 },   // Huevito
  { leagueIndex: 1, min: 40, max: 54 },   // Pollito
  { leagueIndex: 2, min: 55, max: 69 },   // Dinosaurio
  { leagueIndex: 3, min: 70, max: 84 },   // Fósil
  { leagueIndex: 4, min: 85, max: 100 },  // Cachimbo
];

// Peso para asegurar distribución visible en todas las ligas.
const LEAGUE_WEIGHTS = [0.25, 0.25, 0.25, 0.15, 0.1];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickLeagueIndex(): number {
  const roll = Math.random();
  let cumulative = 0;
  for (let i = 0; i < LEAGUE_WEIGHTS.length; i++) {
    cumulative += LEAGUE_WEIGHTS[i];
    if (roll <= cumulative) return i;
  }
  return LEAGUE_WEIGHTS.length - 1;
}

function generateName(): string {
  const first = pickRandom(FIRST_NAMES);
  const last = pickRandom(LAST_NAMES);
  return `${first} ${last}`;
}

function getRandomDateThisWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diffToMonday);

  const offsetMs = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
  return new Date(monday.getTime() + offsetMs);
}

async function main() {
  console.log('🌱 Sembrando competidores...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Eliminar competidores previos y sus intentos asociados.
  const deleted = await prisma.user.deleteMany({
    where: { email: { startsWith: 'competidor' } },
  });
  console.log(`🗑️  Eliminados ${deleted.count} competidores anteriores`);

  const careers = await prisma.career.findMany({
    select: { id: true, area: true },
  });

  if (careers.length === 0) {
    console.warn('⚠️ No hay carreras en la base de datos. Ejecuta primero prisma db seed.');
  }

  const TOTAL_COMPETITORS = 150;
  const createdUsers: { id: string }[] = [];

  for (let i = 0; i < TOTAL_COMPETITORS; i++) {
    const career = careers.length > 0 ? pickRandom(careers) : undefined;
    const leagueIndex = pickLeagueIndex();
    const range = LEAGUE_SCORE_RANGES[leagueIndex];

    const user = await prisma.user.create({
      data: {
        email: `competidor${i}@test.com`,
        password: hashedPassword,
        name: generateName(),
        totalXp: randomInt(0, 15000),
        role: 'USER',
        careerId: career?.id,
      },
      select: { id: true },
    });

    createdUsers.push(user);

    // Cada competidor completa 1-3 simulacros esta semana.
    const attemptsCount = randomInt(1, 3);
    for (let j = 0; j < attemptsCount; j++) {
      const score = randomInt(range.min, range.max);
      const questionCount = 80;
      const correctCount = Math.round((score / 100) * questionCount);
      const incorrectCount = questionCount - correctCount;

      await prisma.examAttempt.create({
        data: {
          userId: user.id,
          mode: ExamMode.GENERATED,
          questionCount,
          timeLimitSeconds: 7200,
          questionIds: [],
          answers: {},
          status: ExamStatus.COMPLETED,
          submittedAt: getRandomDateThisWeek(),
          correctCount,
          incorrectCount,
          blankCount: 0,
          score,
          totalXpEarned: correctCount * 10,
          totalCoinsEarned: correctCount * 5,
        },
      });
    }
  }

  console.log(`✅ ¡${TOTAL_COMPETITORS} competidores creados con simulacros de esta semana!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
