import { PrismaClient, Division, ExamMode, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = 'Demo1234!';
const TOTAL_USERS = 40;

const FIRST_NAMES = [
  'Ana', 'Beto', 'Carla', 'Diego', 'Elena', 'Fernando', 'Gaby', 'Hugo',
  'Inés', 'Juan', 'Kevin', 'Laura', 'Mario', 'Natalia', 'Oscar', 'Paula',
  'Quique', 'Rosa', 'Sergio', 'Tania', 'Víctor', 'Wendy', 'Ximena', 'Yolo',
  'Zack', 'Valentina', 'Mateo', 'Camila', 'Lucas', 'Isabella', 'Sebastián',
  'Mariana', 'Daniel', 'Sofía', 'Alejandro', 'Jimena', 'Tomás', 'Renata',
  'Emilio', 'Antonella',
];

const LAST_NAMES = [
  'Quispe', 'Mamani', 'Rojas', 'García', 'Flores', 'López', 'Torres', 'Vargas',
  'Mendoza', 'Castillo', 'Chávez', 'Vega', 'Espinoza', 'Paredes', 'Cruz', 'Morales',
  'Reyes', 'Herrera', 'Medina', 'Aguilar', 'Soto', 'Silva', 'Ruiz', 'Contreras',
  'Sandoval', 'Iglesias', 'Palacios', 'Vásquez', 'Salazar', 'Navarro', 'Valencia',
  'Guerrero', 'Córdova', 'Bautista', 'Carrasco', 'Villanueva', 'Ramos', 'Campos',
  'Santos', 'Domínguez',
];

const DIVISIONS: {
  division: Division;
  minRating: number;
  maxRating: number;
  activityProbability: number;
}[] = [
  { division: 'HUEVITO', minRating: 400, maxRating: 920, activityProbability: 0.35 },
  { division: 'POLLITO', minRating: 920, maxRating: 1440, activityProbability: 0.45 },
  { division: 'DINOSAURIO', minRating: 1440, maxRating: 1960, activityProbability: 0.55 },
  { division: 'FOSIL', minRating: 1960, maxRating: 2480, activityProbability: 0.65 },
  { division: 'CACHIMBO', minRating: 2480, maxRating: 3000, activityProbability: 0.75 },
];

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startOfDayLocal(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function today(): Date {
  return startOfDayLocal(new Date());
}

function getIsoWeekMonday(date: Date): Date {
  const d = new Date(date.getTime());
  const day = d.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + delta);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getIsoWeekNumber(date: Date): number {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7
  );
  return weekNo;
}

function weekIndex(date: Date): number {
  return date.getFullYear() * 100 + getIsoWeekNumber(date);
}

function ratingToScore(rating: number): number {
  return clamp(0, Math.round(((rating - 400) / 2600) * 1000) / 10, 100);
}

function getDivisionByRating(rating: number): Division {
  const score = ratingToScore(rating);
  const threshold = DIVISIONS.find(
    (t) =>
      score >=
        (DIVISIONS.findIndex((d) => d.division === t.division) /
          DIVISIONS.length) *
          100 &&
      score <
        ((DIVISIONS.findIndex((d) => d.division === t.division) + 1) /
          DIVISIONS.length) *
          100
  );
  return threshold?.division ?? 'CACHIMBO';
}

function kFactorByDivision(division: Division): number {
  switch (division) {
    case 'HUEVITO':
      return 80;
    case 'POLLITO':
      return 64;
    case 'DINOSAURIO':
      return 48;
    case 'FOSIL':
      return 36;
    case 'CACHIMBO':
      return 24;
    default:
      return 80;
  }
}

async function ensureSeasons(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const base = today();
  for (let i = -7; i <= 0; i++) {
    const monday = getIsoWeekMonday(addDays(base, i * 7));
    const idx = weekIndex(monday);
    const eventStartsAt = addDays(monday, -2); // sábado
    const eventEndsAt = addDays(monday, 1); // domingo
    eventEndsAt.setHours(23, 59, 59, 999);

    const season = await prisma.season.upsert({
      where: { weekIndex: idx },
      create: {
        weekIndex: idx,
        eventStartsAt,
        eventEndsAt,
        revealedAt: addDays(monday, 1),
        isActive: i === 0,
        isRevealed: true,
      },
      update: {},
    });
    map.set(i, season.id);
  }
  return map;
}

async function main() {
  const careers = await prisma.career.findMany({ select: { id: true, area: true } });
  if (careers.length === 0) {
    throw new Error('No hay carreras en la base de datos. Ejecuta prisma db seed primero.');
  }

  // Verificar que no existan usuarios reales con emails de demo.
  const collision = await prisma.user.findFirst({
    where: { email: { startsWith: 'demo.user' } },
  });
  if (collision && !collision.email.startsWith('demo.user')) {
    // En teoría imposible por el filtro, pero por seguridad.
    throw new Error(`Email collision detectado: ${collision.email}`);
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 12);
  const seasons = await ensureSeasons();
  const now = new Date();

  const created: { email: string; division: Division; rating: number }[] = [];

  for (let i = 1; i <= TOTAL_USERS; i++) {
    const email = `demo.user${String(i).padStart(2, '0')}@ingresa.pe`;
    const firstName = pickRandom(FIRST_NAMES);
    const lastName = pickRandom(LAST_NAMES);
    const name = `[Demo] ${firstName} ${lastName}`;

    // Distribución uniforme por división.
    const divisionConfig = DIVISIONS[(i - 1) % DIVISIONS.length];
    const rating = randomInt(divisionConfig.minRating, divisionConfig.maxRating);
    const division = divisionConfig.division;
    const highestRating = randomInt(rating, Math.min(rating + 200, divisionConfig.maxRating));
    const highestDivision = getDivisionByRating(highestRating);

    const career = pickRandom(careers);

    // Datos de gamificación variados.
    const totalXp = randomInt(0, 15000);
    const coins = randomInt(100, 3000);
    const gems = randomInt(0, 100);
    const streak = randomInt(0, 30);

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        password: hashedPassword,
        provider: 'credentials',
        role: 'USER',
        careerId: career.id,
        energy: 25,
        coins,
        gems,
        totalXp,
        streak,
        lastInteraction: now,
        lastRefill: now,
        rating,
        highestRating,
        division,
        highestDivision,
        seasonHighestRating: rating,
        seasonBestDivision: division,
        isPremium: false,
      },
      update: {
        name,
        password: hashedPassword,
        careerId: career.id,
        coins,
        gems,
        totalXp,
        streak,
        lastInteraction: now,
        lastRefill: now,
        rating,
        highestRating,
        division,
        highestDivision,
        seasonHighestRating: rating,
        seasonBestDivision: division,
        isPremium: false,
      },
    });

    // Limpiar datos previos del usuario demo para idempotencia.
    await prisma.activityLog.deleteMany({ where: { userId: user.id } });
    await prisma.ratingHistory.deleteMany({ where: { userId: user.id } });

    // Generar actividad de los últimos 84 días.
    const activityData: Prisma.ActivityLogCreateManyInput[] = [];
    for (let offset = -83; offset <= 0; offset++) {
      const roll = Math.random();
      if (roll > divisionConfig.activityProbability) continue;

      const nodes = randomInt(0, 3);
      const simulacros = Math.random() > 0.85 ? 1 : 0;
      if (nodes === 0 && simulacros === 0) continue;

      const questions = nodes * 7 + simulacros * 100;
      activityData.push({
        userId: user.id,
        date: startOfDayLocal(addDays(today(), offset)),
        nodesCompleted: nodes,
        simulacrosCompleted: simulacros,
        questionsAnswered: questions,
        questionsCorrect: Math.round(questions * clamp(0.4, 0.5 + Math.random() * 0.3, 0.95)),
        xpEarned: nodes * 20 + simulacros * 150,
        gemsEarned: simulacros * 3,
      });
    }
    if (activityData.length > 0) {
      await prisma.activityLog.createMany({ data: activityData });
    }

    // Generar historial de rating de las últimas 8 semanas.
    let currentRating = rating;
    const historyRows: Prisma.RatingHistoryCreateManyInput[] = [];
    for (let w = -7; w <= 0; w++) {
      const seasonId = seasons.get(w);
      if (!seasonId) continue;

      // Delta aleatorio; en división baja pueden subir más.
      const maxDelta = divisionConfig.division === 'HUEVITO' ? 120 : 60;
      const minDelta = divisionConfig.division === 'CACHIMBO' ? -40 : -80;
      const delta = randomInt(minDelta, maxDelta);
      const oldRating = clamp(400, currentRating - delta, 3000);
      const newRating = currentRating;
      currentRating = oldRating;

      const score = clamp(0, ratingToScore(newRating) + randomInt(-10, 10), 100);

      historyRows.push({
        userId: user.id,
        seasonId,
        mode: 'GENERATED' as ExamMode,
        score,
        oldRating,
        newRating,
        delta,
        divisionAtTime: division,
        kFactorUsed: kFactorByDivision(division),
        avgOpponentRating: 1500,
        protectorsUsed: [],
        appliedAt: addDays(getIsoWeekMonday(addDays(today(), w * 7)), 1),
        createdAt: addDays(getIsoWeekMonday(addDays(today(), w * 7)), 1),
      });
    }
    if (historyRows.length > 0) {
      await prisma.ratingHistory.createMany({ data: historyRows });
    }

    created.push({ email, division, rating });
    console.log(`Creado/actualizado: ${email} -> ${name} (${division}, ${rating})`);
  }

  console.log('\n=== Resumen de usuarios demo ===');
  for (const c of created) {
    console.log(`${c.email.padEnd(36)} ${c.division.padEnd(12)} ${c.rating}`);
  }
  console.log(`\nContraseña para todos los demos: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
