import { PrismaClient } from '@prisma/client';
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

const LEAGUE_XP_RANGES = [
  { min: 0, max: 499 },          // Huevito
  { min: 500, max: 1499 },       // Pollito
  { min: 1500, max: 2999 },      // Dinosaurio
  { min: 3000, max: 4999 },      // Fósil
  { min: 5000, max: 25000 },     // Cachimbo
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomXP(): number {
  // Distribución intencional para asegurar competidores en todas las ligas.
  const weights = [0.3, 0.3, 0.2, 0.12, 0.08];
  const roll = Math.random();
  let cumulative = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (roll <= cumulative) {
      const range = LEAGUE_XP_RANGES[i];
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
  }

  const last = LEAGUE_XP_RANGES[LEAGUE_XP_RANGES.length - 1];
  return Math.floor(Math.random() * (last.max - last.min + 1)) + last.min;
}

function generateName(): string {
  const first = pickRandom(FIRST_NAMES);
  const last = pickRandom(LAST_NAMES);
  return `${first} ${last}`;
}

async function main() {
  console.log('🌱 Sembrando competidores...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Eliminar competidores previos para evitar duplicados al resembrar.
  const deleted = await prisma.user.deleteMany({
    where: { email: { startsWith: 'competidor' } },
  });
  console.log(`🗑️  Eliminados ${deleted.count} competidores anteriores`);

  // Cargar carreras existentes para asignarles una aleatoriamente.
  const careers = await prisma.career.findMany({
    select: { id: true, area: true },
  });

  if (careers.length === 0) {
    console.warn('⚠️ No hay carreras en la base de datos. Ejecuta primero prisma db seed.');
  }

  const TOTAL_COMPETITORS = 150;
  const batch: { email: string; name: string; totalXp: number; careerId?: string }[] = [];

  for (let i = 0; i < TOTAL_COMPETITORS; i++) {
    const career = careers.length > 0 ? pickRandom(careers) : undefined;
    batch.push({
      email: `competidor${i}@test.com`,
      name: generateName(),
      totalXp: generateRandomXP(),
      careerId: career?.id,
    });
  }

  for (const competitor of batch) {
    await prisma.user.create({
      data: {
        email: competitor.email,
        password: hashedPassword,
        name: competitor.name,
        totalXp: competitor.totalXp,
        role: 'USER',
        careerId: competitor.careerId,
      },
    });
  }

  console.log(`✅ ¡${TOTAL_COMPETITORS} competidores creados!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
