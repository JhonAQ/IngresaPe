/**
 * Script de migración de datos para el nuevo sistema de rachas O(1).
 *
 * Uso:
 *   npx ts-node apps/api/scripts/migrate-streak-data.ts
 *
 * O desde apps/api:
 *   npx ts-node scripts/migrate-streak-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
}

function diffInDays(later: Date, earlier: Date): number {
  const laterTime = toDateOnly(later).getTime();
  const earlierTime = toDateOnly(earlier).getTime();
  return Math.round((laterTime - earlierTime) / 86_400_000);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return toDateOnly(result);
}

async function main() {
  console.log('🚀 Iniciando migración de datos de rachas...\n');

  const today = toDateOnly(new Date());

  // 1. Obtener todos los usuarios
  const users = await prisma.user.findMany({
    select: {
      id: true,
      streak: true,
      lastInteraction: true,
      lastActivityDate: true,
      streakFreezes: true,
    },
  });

  console.log(`📊 Encontrados ${users.length} usuarios\n`);

  let updated = 0;
  let skipped = 0;

  for (const user of users) {
    // 2. Buscar última actividad del usuario
    const lastLog = await prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        OR: [
          { questionsAnswered: { gt: 0 } },
          { nodesCompleted: { gt: 0 } },
          { simulacrosCompleted: { gt: 0 } },
        ],
      },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    // 3. Determinar lastActivityDate
    let lastActivityDate: Date | null = null;
    if (lastLog) {
      lastActivityDate = toDateOnly(lastLog.date);
    } else if (user.lastInteraction) {
      lastActivityDate = toDateOnly(user.lastInteraction);
    }

    // 4. Contar freezes disponibles en UserItem
    const freezeItem = await prisma.userItem.findUnique({
      where: {
        userId_itemKey: {
          userId: user.id,
          itemKey: 'STREAK_FREEZE_1D',
        },
      },
    });
    const streakFreezes = freezeItem?.quantity ?? 0;

    // 5. Recalcular racha si hay lastActivityDate
    let newStreak = user.streak;
    if (lastActivityDate) {
      const daysMissed = diffInDays(today, lastActivityDate);

      if (daysMissed > 1) {
        const freezesNeeded = daysMissed - 1;
        if (streakFreezes < freezesNeeded) {
          // Racha perdida
          newStreak = 0;
        }
        // Si hay freezes suficientes, mantenemos la racha actual
        // y consumimos los freezes al aplicar la migración
      }
    } else {
      newStreak = 0;
    }

    // 6. Actualizar usuario
    const needsUpdate =
      user.lastActivityDate?.getTime() !== lastActivityDate?.getTime() ||
      user.streakFreezes !== streakFreezes ||
      user.streak !== newStreak;

    if (needsUpdate) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastActivityDate,
          streakFreezes,
          streak: newStreak,
        },
      });
      updated++;
      console.log(
        `✅ Usuario ${user.id}: streak=${user.streak}→${newStreak}, ` +
          `freezes=${streakFreezes}, lastActivity=${lastActivityDate?.toISOString().split('T')[0] ?? 'null'}`
      );
    } else {
      skipped++;
    }
  }

  console.log(`\n✨ Migración completada:`);
  console.log(`   - Usuarios actualizados: ${updated}`);
  console.log(`   - Usuarios sin cambios: ${skipped}`);
  console.log(`   - Total: ${users.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
