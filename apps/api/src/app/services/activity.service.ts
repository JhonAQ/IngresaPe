import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const DAILY_GEMS_CAP = 200;
const LOGIN_BONUS_GEMS = 5;
const NODE_COMPLETION_GEMS = 10;

// ============================================================================
// Tipos
// ============================================================================

export type ActivityType =
  | 'QUESTION_ANSWERED'
  | 'NODE_COMPLETED'
  | 'SIMULACRO_COMPLETED';

export interface RecordActivityInput {
  userId: string;
  type: ActivityType;

  // --- Para QUESTION_ANSWERED ---
  questionId?: string;
  examQuestionId?: string;
  answer?: unknown;
  isCorrect?: boolean;
  timeTaken?: number;

  // --- Para SIMULACRO_COMPLETED (múltiples respuestas) ---
  answerLogs?: Array<{
    questionId?: string;
    examQuestionId?: string;
    isCorrect: boolean;
    answer?: unknown;
    timeTaken?: number;
  }>;

  // --- Para NODE_COMPLETED ---
  topicId?: string;
  nodeIndex?: number;

  // --- Para SIMULACRO_COMPLETED ---
  examAttemptId?: string;

  // --- Recompensas ---
  baseGems?: number;
  coinsEarned?: number;

  // --- Métricas ---
  questionsAnswered?: number;
  questionsCorrect?: number;
  nodesCompleted?: number;
  simulacrosCompleted?: number;
}

export interface ActivityResult {
  success: true;
  gemsAwarded: number;
  loginBonus: number;
  streakMilestoneGems: number;
  totalGems: number;
  coinsAwarded: number;
  streak: number;
  previousStreak: number;
  streakIncremented: boolean;
  freezesUsed: number;
  user: {
    id: string;
    gems: number;
    coins: number;
    streak: number;
    energy: number;
  };
}

export interface StreakStatus {
  streak: number;
  needsSync: boolean;
  syncData?: {
    streak?: number;
    streakFreezes?: number;
    lastActivityDate?: Date;
  };
}

interface StreakComputationResult {
  streak: number;
  freezesUsed: number;
}

interface StreakReadResult {
  streak: number;
  needsSync: boolean;
  syncData?: {
    streak?: number;
    streakFreezes?: number;
    lastActivityDate?: Date;
  };
}

export interface GemAwardResult {
  base: number;
  capped: number;
  loginBonus: number;
  streakMilestone: number;
  total: number;
}

// ============================================================================
// Helpers puros
// ============================================================================

// America/Lima no tiene horario de verano: offset fijo UTC-5.
// Lo fijamos explícitamente para que el "día de hoy" sea el día civil peruano
// sin importar la zona horaria del servidor (local, Docker, Coolify, etc.).
const LIMA_OFFSET_MS = -5 * 60 * 60 * 1000;

/**
 * Convierte un instante a la medianoche UTC del día civil de Lima.
 * Los valores de día se guardan así en la BD (@db.Date → medianoche UTC).
 *
 * IMPORTANTE: no es idempotente por diseño. Solo se aplica a instantes crudos
 * (ej. `new Date()`), nunca a valores de día ya normalizados.
 */
export function toDateOnly(date: Date): Date {
  const lima = new Date(date.getTime() + LIMA_OFFSET_MS);
  return new Date(
    Date.UTC(lima.getUTCFullYear(), lima.getUTCMonth(), lima.getUTCDate())
  );
}

/**
 * Diferencia en días entre dos VALORES DE DÍA (medianoches UTC).
 * No normaliza: asume que ambas fechas ya son valores de día.
 */
function diffInDays(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / 86_400_000);
}

/**
 * Suma días a un VALOR DE DÍA (medianoche UTC). Aritmética pura, sin TZ.
 */
function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/**
 * Calcula la racha cuando el usuario realiza una actividad.
 * Reglas:
 * - Primera actividad: racha = 1.
 * - Mismo día: racha no cambia.
 * - Día consecutivo: racha + 1.
 * - Días perdidos: consume freezes si hay; si no, racha = 1.
 */
export function computeStreakOnActivity(
  user: {
    streak: number;
    lastActivityDate: Date | null;
    streakFreezes: number;
  },
  today: Date
): StreakComputationResult {
  if (!user.lastActivityDate) {
    return { streak: 1, freezesUsed: 0 };
  }

  const daysMissed = diffInDays(today, user.lastActivityDate);

  if (daysMissed === 0) {
    return { streak: user.streak, freezesUsed: 0 };
  }

  if (daysMissed === 1) {
    return { streak: user.streak + 1, freezesUsed: 0 };
  }

  const freezesNeeded = daysMissed - 1;
  if (user.streakFreezes >= freezesNeeded) {
    return { streak: user.streak + 1, freezesUsed: freezesNeeded };
  }

  return { streak: 1, freezesUsed: 0 };
}

/**
 * Calcula la racha al leer (lazy sync).
 * Si hubo días perdidos y hay freezes suficientes, los consume y mantiene la
 * racha. Si no hay suficientes, la racha cae a 0.
 */
export function computeStreakOnRead(
  user: {
    streak: number;
    lastActivityDate: Date | null;
    streakFreezes: number;
  },
  today: Date
): StreakReadResult {
  if (!user.lastActivityDate) {
    return { streak: 0, needsSync: false };
  }

  const daysMissed = diffInDays(today, user.lastActivityDate);

  if (daysMissed <= 1) {
    return { streak: user.streak, needsSync: false };
  }

  const freezesNeeded = daysMissed - 1;

  if (user.streakFreezes >= freezesNeeded) {
    return {
      streak: user.streak,
      needsSync: true,
      syncData: {
        streakFreezes: user.streakFreezes - freezesNeeded,
        lastActivityDate: addDays(user.lastActivityDate, freezesNeeded),
      },
    };
  }

  return {
    streak: 0,
    needsSync: true,
    syncData: { streak: 0 },
  };
}

// ============================================================================
// Servicio
// ============================================================================

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Único punto de entrada para registrar cualquier acción del usuario que
   * genera actividad, recompensas y/o cambios en la racha.
   *
   * Todo ocurre dentro de una transacción de Prisma para garantizar
   * consistencia.
   */
  async recordActivity(input: RecordActivityInput): Promise<ActivityResult> {
    const today = toDateOnly(new Date());
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener usuario dentro de la transacción
      const user = await tx.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          streak: true,
          lastActivityDate: true,
          streakFreezes: true,
          gems: true,
          coins: true,
          energy: true,
        },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // 2. Crear AnswerLog si aplica
      if (input.type === 'QUESTION_ANSWERED' && input.questionId) {
        await tx.answerLog.create({
          data: {
            userId: input.userId,
            questionId: input.questionId,
            examQuestionId: input.examQuestionId ?? null,
            isCorrect: input.isCorrect ?? false,
            answer: (input.answer ?? null) as Prisma.InputJsonValue,
            timeTaken: input.timeTaken ?? null,
          },
        });
      }

      if (input.answerLogs && input.answerLogs.length > 0) {
        await tx.answerLog.createMany({
          data: input.answerLogs.map((log) => ({
            userId: input.userId,
            questionId: log.questionId ?? null,
            examQuestionId: log.examQuestionId ?? null,
            isCorrect: log.isCorrect,
            answer: (log.answer ?? null) as Prisma.InputJsonValue,
            timeTaken: log.timeTaken ?? null,
          })),
        });
      }

      // 3. Upsert ActivityLog (solo métricas)
      const existingLog = await tx.activityLog.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: today,
          },
        },
      });

      const isFirstActivityToday = !existingLog;

      const activityLog = await tx.activityLog.upsert({
        where: {
          userId_date: {
            userId: input.userId,
            date: today,
          },
        },
        update: {
          questionsAnswered: { increment: input.questionsAnswered ?? 0 },
          questionsCorrect: { increment: input.questionsCorrect ?? 0 },
          nodesCompleted: { increment: input.nodesCompleted ?? 0 },
          simulacrosCompleted: { increment: input.simulacrosCompleted ?? 0 },
        },
        create: {
          userId: input.userId,
          date: today,
          questionsAnswered: input.questionsAnswered ?? 0,
          questionsCorrect: input.questionsCorrect ?? 0,
          nodesCompleted: input.nodesCompleted ?? 0,
          simulacrosCompleted: input.simulacrosCompleted ?? 0,
        },
      });

      // 4. Calcular gemas con tope diario, login bonus y boost
      const gemResult = await this.calculateGemsInTransaction(
        tx,
        input.userId,
        input.baseGems ?? 0,
        isFirstActivityToday
      );

      // 5. Calcular racha O(1)
      const previousStreak = user.streak;
      const streakResult = computeStreakOnActivity(user, today);

      // 6. Actualizar usuario
      const updatedUser = await tx.user.update({
        where: { id: input.userId },
        data: {
          gems: { increment: gemResult.total },
          coins: { increment: input.coinsEarned ?? 0 },
          streak: streakResult.streak,
          lastActivityDate: today,
          lastInteraction: now,
          streakFreezes:
            streakResult.freezesUsed > 0
              ? { decrement: streakResult.freezesUsed }
              : undefined,
        },
        select: {
          id: true,
          gems: true,
          coins: true,
          streak: true,
          energy: true,
        },
      });

      // 7. Marcar freeze usado en ActivityLog si aplica
      if (streakResult.freezesUsed > 0) {
        await tx.activityLog.update({
          where: { id: activityLog.id },
          data: { usedStreakFreeze: true },
        });
      }

      // 8. Milestone de gemas por racha (solo si la racha creció)
      let streakMilestoneGems = 0;
      if (streakResult.streak > previousStreak) {
        streakMilestoneGems = await this.awardStreakMilestoneInTransaction(
          tx,
          input.userId,
          streakResult.streak
        );
        // Actualizar el total de gemas del usuario con el milestone
        if (streakMilestoneGems > 0) {
          await tx.user.update({
            where: { id: input.userId },
            data: { gems: { increment: streakMilestoneGems } },
          });
        }
      }

      // 9. Actualizar cache de racha en ActivityLog
      await tx.activityLog.update({
        where: { id: activityLog.id },
        data: { streakAtEndOfDay: streakResult.streak },
      });

      return {
        success: true,
        gemsAwarded: gemResult.capped,
        loginBonus: gemResult.loginBonus,
        streakMilestoneGems,
        totalGems: gemResult.total + streakMilestoneGems,
        coinsAwarded: input.coinsEarned ?? 0,
        streak: streakResult.streak,
        previousStreak,
        streakIncremented: streakResult.streak > previousStreak,
        freezesUsed: streakResult.freezesUsed,
        user: {
          ...updatedUser,
          gems: updatedUser.gems + streakMilestoneGems,
        },
      };
    });
  }

  /**
   * Devuelve la racha real del usuario. Si detecta días perdidos y hay freezes
   * suficientes, los consume y sincroniza la BD. Si no hay suficientes, resetea
   * la racha a 0.
   */
  async getStreakStatus(userId: string): Promise<StreakStatus> {
    const today = toDateOnly(new Date());
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        lastActivityDate: true,
        streakFreezes: true,
      },
    });

    if (!user) {
      return { streak: 0, needsSync: false };
    }

    const result = computeStreakOnRead(user, today);

    if (result.needsSync && result.syncData) {
      await this.prisma.user.update({
        where: { id: userId },
        data: result.syncData,
      });
    }

    return result;
  }

  /**
   * Otorga gemas por completar un nodo.
   * @deprecated Usar recordActivity({ type: 'NODE_COMPLETED' }) en su lugar.
   */
  async awardNodeCompletionGems(userId: string): Promise<GemAwardResult> {
    const result = await this.recordActivity({
      userId,
      type: 'NODE_COMPLETED',
      baseGems: NODE_COMPLETION_GEMS,
      nodesCompleted: 1,
    });

    return {
      base: NODE_COMPLETION_GEMS,
      capped: result.gemsAwarded,
      loginBonus: result.loginBonus,
      streakMilestone: result.streakMilestoneGems,
      total: result.totalGems,
    };
  }

  /**
   * Otorga gemas respetando tope diario, login bonus y boosts.
   * @deprecated Usar recordActivity en su lugar para mantener consistencia.
   */
  async awardGems(userId: string, baseGems: number): Promise<GemAwardResult> {
    const result = await this.recordActivity({
      userId,
      type: 'QUESTION_ANSWERED',
      baseGems,
      questionsAnswered: 0,
      questionsCorrect: 0,
    });

    return {
      base: baseGems,
      capped: result.gemsAwarded,
      loginBonus: result.loginBonus,
      streakMilestone: result.streakMilestoneGems,
      total: result.totalGems,
    };
  }

  /**
   * @deprecated La racha ahora se calcula en O(1) dentro de recordActivity.
   */
  async recalculateStreak(userId: string): Promise<number> {
    const status = await this.getStreakStatus(userId);
    return status.streak;
  }

  /**
   * @deprecated Usar recordActivity en su lugar.
   */
  async log(input: {
    userId: string;
    questionsAnswered?: number;
    questionsCorrect?: number;
    nodesCompleted?: number;
    gemsEarned?: number;
    simulacrosCompleted?: number;
  }): Promise<void> {
    await this.recordActivity({
      userId: input.userId,
      type: 'QUESTION_ANSWERED',
      baseGems: input.gemsEarned ?? 0,
      questionsAnswered: input.questionsAnswered ?? 0,
      questionsCorrect: input.questionsCorrect ?? 0,
      nodesCompleted: input.nodesCompleted ?? 0,
      simulacrosCompleted: input.simulacrosCompleted ?? 0,
    });
  }

  // ==========================================================================
  // Consultas de métricas (ActivityLog sigue siendo la fuente)
  // ==========================================================================

  /**
   * Devuelve el heatmap de actividad de los últimos N días.
   */
  async getHeatmap(userId: string, days = 84) {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
        date: { gte: toDateOnly(start), lte: toDateOnly(end) },
      },
      orderBy: { date: 'asc' },
    });

    return logs.map((log) => ({
      date: log.date.toISOString().split('T')[0],
      intensity: this.intensity({
        questionsAnswered: log.questionsAnswered,
        nodesCompleted: log.nodesCompleted,
        simulacrosCompleted: log.simulacrosCompleted,
        gemsEarned: log.gemsEarned,
      }),
      questionsAnswered: log.questionsAnswered,
      nodesCompleted: log.nodesCompleted,
      gemsEarned: log.gemsEarned,
      simulacrosCompleted: log.simulacrosCompleted,
    }));
  }

  /**
   * Devuelve el estado de la racha para los últimos 7 días (incluyendo hoy).
   *
   * Estados:
   * - done: día con actividad.
   * - freezed: día sin actividad pero protegido por un freeze.
   * - missed: día pasado sin actividad y sin freeze.
   * - not_yet: hoy sin actividad aún.
   */
  async getWeeklyStreak(userId: string) {
    const today = toDateOnly(new Date());
    const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const days: { date: Date; label: string; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 86_400_000);
      days.push({
        date,
        label: labels[date.getDay()],
        isToday: i === 0,
      });
    }

    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
        date: { in: days.map((d) => d.date) },
      },
    });

    const logByDate = new Map(
      logs.map((l) => [l.date.toISOString().split('T')[0], l])
    );

    return days.map((d) => {
      const key = d.date.toISOString().split('T')[0];
      const log = logByDate.get(key);
      const hasActivity =
        !!log &&
        (log.questionsAnswered > 0 ||
          log.nodesCompleted > 0 ||
          log.simulacrosCompleted > 0);

      let status: 'done' | 'freezed' | 'missed' | 'not_yet' = 'not_yet';
      if (hasActivity) {
        status = 'done';
      } else if (log?.usedStreakFreeze) {
        status = 'freezed';
      } else if (!d.isToday) {
        status = 'missed';
      }

      return {
        date: key,
        label: d.label,
        isToday: d.isToday,
        status,
      };
    });
  }

  /**
   * Estadísticas agregadas para el perfil.
   */
  async getStats(userId: string) {
    const totals = await this.prisma.activityLog.aggregate({
      where: { userId },
      _sum: {
        questionsAnswered: true,
        questionsCorrect: true,
        nodesCompleted: true,
        simulacrosCompleted: true,
      },
    });

    return {
      totalQuestionsAnswered: totals._sum.questionsAnswered ?? 0,
      totalQuestionsCorrect: totals._sum.questionsCorrect ?? 0,
      totalNodesCompleted: totals._sum.nodesCompleted ?? 0,
      totalSimulacrosCompleted: totals._sum.simulacrosCompleted ?? 0,
    };
  }

  // ==========================================================================
  // Métodos privados
  // ==========================================================================

  private async calculateGemsInTransaction(
    tx: Prisma.TransactionClient,
    userId: string,
    baseGems: number,
    isFirstActivityToday: boolean
  ): Promise<{ capped: number; loginBonus: number; total: number }> {
    let loginBonus = 0;

    if (isFirstActivityToday) {
      loginBonus = LOGIN_BONUS_GEMS;
      await tx.activityLog.update({
        where: { userId_date: { userId, date: toDateOnly(new Date()) } },
        data: { loginBonusGems: loginBonus },
      });
    }

    const activeBoost = await this.getActiveGemBoostInTransaction(tx, userId);
    const boostedBase = activeBoost > 1 ? baseGems * activeBoost : baseGems;

    const log = await tx.activityLog.findUnique({
      where: { userId_date: { userId, date: toDateOnly(new Date()) } },
    });

    const earnedToday =
      (log?.gemsEarned ?? 0) +
      (log?.loginBonusGems ?? 0) +
      (log?.streakMilestoneGems ?? 0);

    const remaining = Math.max(0, DAILY_GEMS_CAP - earnedToday);
    const capped = Math.min(boostedBase, remaining);

    if (capped > 0) {
      await tx.activityLog.update({
        where: { userId_date: { userId, date: toDateOnly(new Date()) } },
        data: { gemsEarned: { increment: capped } },
      });
    }

    return { capped, loginBonus, total: loginBonus + capped };
  }

  private async awardStreakMilestoneInTransaction(
    tx: Prisma.TransactionClient,
    userId: string,
    streak: number
  ): Promise<number> {
    if (streak <= 0) return 0;

    const milestoneGems = streak === 30 ? 100 : streak % 7 === 0 ? 30 : 0;
    if (!milestoneGems) return 0;

    const log = await tx.activityLog.findUnique({
      where: { userId_date: { userId, date: toDateOnly(new Date()) } },
    });

    if (!log || log.streakMilestoneGems > 0) return 0;

    const earnedToday =
      log.gemsEarned + log.loginBonusGems + log.streakMilestoneGems;
    const remaining = Math.max(0, DAILY_GEMS_CAP - earnedToday);
    const awarded = Math.min(milestoneGems, remaining);

    if (awarded > 0) {
      await tx.activityLog.update({
        where: { id: log.id },
        data: { streakMilestoneGems: awarded },
      });
    }

    return awarded;
  }

  private async getActiveGemBoostInTransaction(
    tx: Prisma.TransactionClient,
    userId: string
  ): Promise<number> {
    const now = new Date();
    const item = await tx.userItem.findFirst({
      where: {
        userId,
        itemKey: 'GEM_BOOST_30MIN',
        expiresAt: { gt: now },
      },
    });
    return item ? 2 : 1;
  }

  private intensity(log: {
    questionsAnswered: number;
    nodesCompleted: number;
    simulacrosCompleted: number;
    gemsEarned: number;
  }): number {
    const value = log.nodesCompleted + log.simulacrosCompleted * 2;
    if (value === 0) return 0;
    if (value === 1) return 1;
    if (value === 2) return 2;
    if (value === 3) return 3;
    return 4;
  }
}
