import { PrismaClient, Division, ExamMode, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = 'Test1234!';

const DIVISION_THRESHOLDS: {
  division: Division;
  minScore: number;
  maxScore: number;
  minRating: number;
  maxRating: number;
}[] = [
  {
    division: 'HUEVITO',
    minScore: 0,
    maxScore: 20,
    minRating: 400,
    maxRating: 920,
  },
  {
    division: 'POLLITO',
    minScore: 20,
    maxScore: 40,
    minRating: 920,
    maxRating: 1440,
  },
  {
    division: 'DINOSAURIO',
    minScore: 40,
    maxScore: 60,
    minRating: 1440,
    maxRating: 1960,
  },
  {
    division: 'FOSIL',
    minScore: 60,
    maxScore: 80,
    minRating: 1960,
    maxRating: 2480,
  },
  {
    division: 'CACHIMBO',
    minScore: 80,
    maxScore: 100,
    minRating: 2480,
    maxRating: 3000,
  },
];

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function ratingToScore(rating: number): number {
  return clamp(0, Math.round(((rating - 400) / 2600) * 1000) / 10, 100);
}

function getDivisionByRating(rating: number): Division {
  const score = ratingToScore(rating);
  return (
    DIVISION_THRESHOLDS.find((t) => score >= t.minScore && score < t.maxScore)
      ?.division ?? 'CACHIMBO'
  );
}

function startOfDayLocal(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
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

interface TestUser {
  email: string;
  name: string;
  rating: number;
  highestRating: number;
  streak: number;
  coins: number;
  gems: number;
  totalXp: number;
  isPremium: boolean;
  lastExamScore: number | null;
  activity: { dateOffset: number; nodes: number; simulacros: number }[];
  history: { weekOffset: number; score: number; delta: number }[];
}

function baseUser(
  overrides: Partial<TestUser> & Pick<TestUser, 'email' | 'name' | 'rating'>
): TestUser {
  return {
    highestRating: overrides.rating,
    streak: 0,
    coins: 100,
    gems: 0,
    totalXp: 0,
    isPremium: false,
    lastExamScore: null,
    activity: [],
    history: [],
    ...overrides,
  } as TestUser;
}

const users: TestUser[] = [
  // 1. Sin simulacros, poca actividad, racha modesta
  baseUser({
    email: 'test.novicio@ingresa.pe',
    name: 'Novicio Sin Simulacro',
    rating: 400,
    streak: 5,
    totalXp: 180,
    activity: [
      { dateOffset: 0, nodes: 1, simulacros: 0 },
      { dateOffset: -1, nodes: 1, simulacros: 0 },
      { dateOffset: -4, nodes: 1, simulacros: 0 },
      { dateOffset: -8, nodes: 1, simulacros: 0 },
      { dateOffset: -12, nodes: 1, simulacros: 0 },
    ],
  }),

  // 2. Subida muy rapida
  baseUser({
    email: 'test.velocista@ingresa.pe',
    name: 'Velocista Subidor',
    rating: 1600,
    highestRating: 1600,
    streak: 12,
    coins: 800,
    gems: 25,
    totalXp: 4200,
    lastExamScore: 78,
    activity: [
      { dateOffset: 0, nodes: 1, simulacros: 1 },
      { dateOffset: -2, nodes: 2, simulacros: 0 },
      { dateOffset: -4, nodes: 1, simulacros: 1 },
      { dateOffset: -6, nodes: 3, simulacros: 0 },
      { dateOffset: -9, nodes: 2, simulacros: 1 },
      { dateOffset: -13, nodes: 1, simulacros: 0 },
      { dateOffset: -18, nodes: 2, simulacros: 1 },
    ],
    history: [
      { weekOffset: -7, score: 45, delta: 120 },
      { weekOffset: -6, score: 52, delta: 140 },
      { weekOffset: -5, score: 61, delta: 160 },
      { weekOffset: -4, score: 68, delta: 150 },
      { weekOffset: -3, score: 73, delta: 150 },
      { weekOffset: -2, score: 78, delta: 160 },
      { weekOffset: -1, score: 82, delta: 160 },
      { weekOffset: 0, score: 85, delta: 160 },
    ],
  }),

  // 3. Bajada progresiva
  baseUser({
    email: 'test.declive@ingresa.pe',
    name: 'Usuario en Declive',
    rating: 1060,
    highestRating: 1500,
    streak: 3,
    coins: 250,
    gems: 5,
    totalXp: 2100,
    lastExamScore: 28,
    activity: [
      { dateOffset: 0, nodes: 1, simulacros: 0 },
      { dateOffset: -2, nodes: 0, simulacros: 1 },
      { dateOffset: -5, nodes: 2, simulacros: 0 },
      { dateOffset: -9, nodes: 0, simulacros: 1 },
      { dateOffset: -14, nodes: 1, simulacros: 0 },
      { dateOffset: -20, nodes: 0, simulacros: 1 },
    ],
    history: [
      { weekOffset: -7, score: 58, delta: -20 },
      { weekOffset: -6, score: 55, delta: -30 },
      { weekOffset: -5, score: 50, delta: -40 },
      { weekOffset: -4, score: 46, delta: -50 },
      { weekOffset: -3, score: 42, delta: -60 },
      { weekOffset: -2, score: 37, delta: -70 },
      { weekOffset: -1, score: 32, delta: -80 },
      { weekOffset: 0, score: 25, delta: -90 },
    ],
  }),

  // 4. Caida rapida
  baseUser({
    email: 'test.caida@ingresa.pe',
    name: 'Caida Libre',
    rating: 800,
    highestRating: 1700,
    streak: 1,
    coins: 120,
    gems: 0,
    totalXp: 900,
    lastExamScore: 18,
    activity: [
      { dateOffset: 0, nodes: 0, simulacros: 1 },
      { dateOffset: -3, nodes: 0, simulacros: 1 },
      { dateOffset: -7, nodes: 1, simulacros: 1 },
      { dateOffset: -12, nodes: 0, simulacros: 1 },
      { dateOffset: -19, nodes: 2, simulacros: 0 },
    ],
    history: [
      { weekOffset: -7, score: 66, delta: -120 },
      { weekOffset: -6, score: 57, delta: -150 },
      { weekOffset: -5, score: 49, delta: -140 },
      { weekOffset: -4, score: 42, delta: -130 },
      { weekOffset: -3, score: 35, delta: -120 },
      { weekOffset: -2, score: 29, delta: -100 },
      { weekOffset: -1, score: 23, delta: -80 },
      { weekOffset: 0, score: 15, delta: -60 },
    ],
  }),

  // 5. Top Cachimbo estable
  baseUser({
    email: 'test.top@ingresa.pe',
    name: 'Top Cachimbo',
    rating: 2600,
    highestRating: 2700,
    streak: 45,
    coins: 2500,
    gems: 80,
    totalXp: 12000,
    isPremium: true,
    lastExamScore: 88,
    activity: [
      { dateOffset: 0, nodes: 2, simulacros: 1 },
      { dateOffset: -1, nodes: 1, simulacros: 0 },
      { dateOffset: -2, nodes: 2, simulacros: 0 },
      { dateOffset: -3, nodes: 1, simulacros: 1 },
      { dateOffset: -4, nodes: 2, simulacros: 0 },
      { dateOffset: -5, nodes: 1, simulacros: 0 },
      { dateOffset: -6, nodes: 3, simulacros: 0 },
      { dateOffset: -8, nodes: 2, simulacros: 1 },
      { dateOffset: -10, nodes: 1, simulacros: 0 },
      { dateOffset: -12, nodes: 2, simulacros: 1 },
    ],
    history: [
      { weekOffset: -7, score: 69, delta: 80 },
      { weekOffset: -6, score: 73, delta: 70 },
      { weekOffset: -5, score: 77, delta: 50 },
      { weekOffset: -4, score: 80, delta: 40 },
      { weekOffset: -3, score: 82, delta: 30 },
      { weekOffset: -2, score: 81, delta: -20 },
      { weekOffset: -1, score: 83, delta: 30 },
      { weekOffset: 0, score: 85, delta: 40 },
    ],
  }),

  // 6. Cerca de ascenso a Cachimbo
  baseUser({
    email: 'test.ascenso@ingresa.pe',
    name: 'A Punto de Ascender',
    rating: 2380,
    highestRating: 2380,
    streak: 20,
    coins: 1200,
    gems: 30,
    totalXp: 6500,
    lastExamScore: 80,
    activity: [
      { dateOffset: 0, nodes: 2, simulacros: 1 },
      { dateOffset: -1, nodes: 1, simulacros: 0 },
      { dateOffset: -2, nodes: 2, simulacros: 0 },
      { dateOffset: -3, nodes: 1, simulacros: 1 },
      { dateOffset: -5, nodes: 2, simulacros: 0 },
      { dateOffset: -7, nodes: 1, simulacros: 1 },
      { dateOffset: -9, nodes: 3, simulacros: 0 },
    ],
    history: [
      { weekOffset: -7, score: 54, delta: 80 },
      { weekOffset: -6, score: 58, delta: 90 },
      { weekOffset: -5, score: 63, delta: 100 },
      { weekOffset: -4, score: 67, delta: 90 },
      { weekOffset: -3, score: 71, delta: 80 },
      { weekOffset: -2, score: 74, delta: 70 },
      { weekOffset: -1, score: 76, delta: 60 },
      { weekOffset: 0, score: 77, delta: 10 },
    ],
  }),

  // 7. Solo nodos, nunca simulacro
  baseUser({
    email: 'test.soloNodos@ingresa.pe',
    name: 'Solo Practica',
    rating: 400,
    highestRating: 400,
    streak: 8,
    coins: 400,
    totalXp: 900,
    activity: [
      { dateOffset: 0, nodes: 2, simulacros: 0 },
      { dateOffset: -1, nodes: 1, simulacros: 0 },
      { dateOffset: -2, nodes: 2, simulacros: 0 },
      { dateOffset: -3, nodes: 1, simulacros: 0 },
      { dateOffset: -4, nodes: 2, simulacros: 0 },
      { dateOffset: -5, nodes: 1, simulacros: 0 },
      { dateOffset: -6, nodes: 1, simulacros: 0 },
      { dateOffset: -7, nodes: 2, simulacros: 0 },
    ],
  }),

  // 8. Retomó racha tras perderla (hueco + racha actual)
  baseUser({
    email: 'test.retomador@ingresa.pe',
    name: 'Retomador de Racha',
    rating: 1200,
    highestRating: 1400,
    streak: 7,
    coins: 600,
    gems: 10,
    totalXp: 3200,
    lastExamScore: 55,
    activity: [
      { dateOffset: 0, nodes: 1, simulacros: 0 },
      { dateOffset: -1, nodes: 1, simulacros: 0 },
      { dateOffset: -2, nodes: 1, simulacros: 0 },
      { dateOffset: -3, nodes: 1, simulacros: 0 },
      { dateOffset: -4, nodes: 1, simulacros: 0 },
      { dateOffset: -5, nodes: 1, simulacros: 0 },
      { dateOffset: -6, nodes: 1, simulacros: 0 },
      // hueco de 5 dias
      { dateOffset: -12, nodes: 1, simulacros: 0 },
      { dateOffset: -15, nodes: 1, simulacros: 0 },
    ],
    history: [
      { weekOffset: -3, score: 35, delta: 40 },
      { weekOffset: -2, score: 38, delta: 30 },
      { weekOffset: -1, score: 36, delta: -20 },
      { weekOffset: 0, score: 39, delta: 30 },
    ],
  }),

  // 9. Actividad irregular (picos)
  baseUser({
    email: 'test.irregular@ingresa.pe',
    name: 'Usuario Irregular',
    rating: 1100,
    highestRating: 1300,
    streak: 2,
    coins: 300,
    gems: 8,
    totalXp: 2400,
    lastExamScore: 48,
    activity: [
      { dateOffset: 0, nodes: 0, simulacros: 1 },
      { dateOffset: -2, nodes: 3, simulacros: 0 },
      { dateOffset: -5, nodes: 0, simulacros: 0 },
      { dateOffset: -7, nodes: 2, simulacros: 1 },
      { dateOffset: -10, nodes: 0, simulacros: 0 },
      { dateOffset: -12, nodes: 4, simulacros: 0 },
      { dateOffset: -16, nodes: 0, simulacros: 1 },
      { dateOffset: -21, nodes: 1, simulacros: 0 },
    ],
    history: [
      { weekOffset: -4, score: 42, delta: 60 },
      { weekOffset: -3, score: 45, delta: 40 },
      { weekOffset: -2, score: 43, delta: -30 },
      { weekOffset: -1, score: 46, delta: 40 },
      { weekOffset: 0, score: 42, delta: -40 },
    ],
  }),

  // 10. Sin actividad (blank slate)
  baseUser({
    email: 'test.blanco@ingresa.pe',
    name: 'Usuario en Blanco',
    rating: 400,
    highestRating: 400,
    streak: 0,
    coins: 100,
    totalXp: 0,
  }),
];

async function ensureSeasons(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const base = today();
  for (let i = -7; i <= 0; i++) {
    const monday = getIsoWeekMonday(addDays(base, i * 7));
    const idx = weekIndex(monday);
    const eventStartsAt = addDays(monday, -2); // sabado
    const eventEndsAt = addDays(monday, 1); // domingo 23:59 aprox (solo semantico)
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
  const career = await prisma.career.findFirst();
  const hashedPassword = await bcrypt.hash(PASSWORD, 12);
  const seasons = await ensureSeasons();
  const now = new Date();

  for (const u of users) {
    const division = getDivisionByRating(u.rating);
    const highestDivision = getDivisionByRating(u.highestRating);

    const user = await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      create: {
        email: u.email.toLowerCase(),
        name: u.name,
        password: hashedPassword,
        provider: 'credentials',
        role: 'USER',
        careerId: career?.id ?? null,
        energy: 25,
        coins: u.coins,
        gems: u.gems,
        totalXp: u.totalXp,
        streak: u.streak,
        lastInteraction: now,
        lastRefill: now,
        rating: u.rating,
        highestRating: u.highestRating,
        division,
        highestDivision,
        seasonHighestRating: u.rating,
        seasonBestDivision: division,
        isPremium: u.isPremium,
        lastExamScore: u.lastExamScore,
      },
      update: {
        name: u.name,
        password: hashedPassword,
        careerId: career?.id ?? null,
        coins: u.coins,
        gems: u.gems,
        totalXp: u.totalXp,
        streak: u.streak,
        lastInteraction: now,
        lastRefill: now,
        rating: u.rating,
        highestRating: u.highestRating,
        division,
        highestDivision,
        seasonHighestRating: u.rating,
        seasonBestDivision: division,
        isPremium: u.isPremium,
        lastExamScore: u.lastExamScore,
      },
    });

    // Limpiar actividad e historial previos para idempotencia
    await prisma.activityLog.deleteMany({ where: { userId: user.id } });
    await prisma.ratingHistory.deleteMany({ where: { userId: user.id } });

    // Activity logs: merge explicit activity + streak daily nodes
    const activityMap = new Map<
      number,
      { nodes: number; simulacros: number }
    >();

    // Racha actual: un nodo por cada dia de la racha (hasta hoy).
    if (u.streak > 0) {
      for (let i = -(u.streak - 1); i <= 0; i++) {
        activityMap.set(i, { nodes: 1, simulacros: 0 });
      }
    }

    // Actividad explicita (simulacros, picos, huecos) se suma encima.
    for (const a of u.activity) {
      const existing = activityMap.get(a.dateOffset) ?? {
        nodes: 0,
        simulacros: 0,
      };
      activityMap.set(a.dateOffset, {
        nodes: existing.nodes + a.nodes,
        simulacros: existing.simulacros + a.simulacros,
      });
    }

    const activityData: Prisma.ActivityLogCreateManyInput[] = Array.from(
      activityMap.entries()
    ).map(([dateOffset, a]) => {
      const date = startOfDayLocal(addDays(today(), dateOffset));
      const questions = a.nodes * 7 + a.simulacros * 100;
      return {
        userId: user.id,
        date,
        nodesCompleted: a.nodes,
        simulacrosCompleted: a.simulacros,
        questionsAnswered: questions,
        questionsCorrect: Math.round(questions * 0.7),
        xpEarned: a.nodes * 20 + a.simulacros * 150,
        gemsEarned: a.simulacros * 3,
      };
    });
    if (activityData.length > 0) {
      await prisma.activityLog.createMany({ data: activityData });
    }

    // Rating history
    let currentRating = u.rating;
    const historyRows: Prisma.RatingHistoryCreateManyInput[] = [];
    for (let i = u.history.length - 1; i >= 0; i--) {
      const h = u.history[i];
      const seasonId = seasons.get(h.weekOffset);
      if (!seasonId) continue;
      const oldRating = currentRating - h.delta;
      const newRating = currentRating;
      currentRating = oldRating;

      historyRows.push({
        userId: user.id,
        seasonId,
        mode: 'GENERATED' as ExamMode,
        score: h.score,
        oldRating,
        newRating,
        delta: h.delta,
        divisionAtTime: getDivisionByRating(newRating),
        kFactorUsed: 50,
        avgOpponentRating: 1500,
        protectorsUsed: [],
        appliedAt: addDays(
          getIsoWeekMonday(addDays(today(), h.weekOffset * 7)),
          1
        ),
        createdAt: addDays(
          getIsoWeekMonday(addDays(today(), h.weekOffset * 7)),
          1
        ),
      });
    }
    if (historyRows.length > 0) {
      await prisma.ratingHistory.createMany({ data: historyRows });
    }

    console.log(
      `Creado/actualizado: ${u.email.toLowerCase()} -> ${
        u.name
      } (${division}, rating ${u.rating})`
    );
  }

  console.log('\n=== Accesos de prueba ===');
  console.log(`Contraseña para todos: ${PASSWORD}`);
  for (const u of users) {
    console.log(`${u.email.toLowerCase().padEnd(36)} ${u.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
