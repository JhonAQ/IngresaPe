import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const DAILY_GEMS_CAP = 200;
const STREAK_FREEZE_KEY = 'STREAK_FREEZE_1D';

export interface ActivityInput {
  userId: string;
  questionsAnswered?: number;
  questionsCorrect?: number;
  nodesCompleted?: number;
  gemsEarned?: number;
  simulacrosCompleted?: number;
}

export interface GemAwardResult {
  base: number;
  capped: number;
  loginBonus: number;
  streakMilestone: number;
  total: number;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra o acumula actividad diaria de un usuario.
   */
  async log(input: ActivityInput): Promise<void> {
    const date = this.toDate(new Date());
    await this.prisma.activityLog.upsert({
      where: {
        userId_date: {
          userId: input.userId,
          date,
        },
      },
      update: {
        questionsAnswered: { increment: input.questionsAnswered ?? 0 },
        questionsCorrect: { increment: input.questionsCorrect ?? 0 },
        nodesCompleted: { increment: input.nodesCompleted ?? 0 },
        gemsEarned: { increment: input.gemsEarned ?? 0 },
        simulacrosCompleted: { increment: input.simulacrosCompleted ?? 0 },
      },
      create: {
        userId: input.userId,
        date,
        questionsAnswered: input.questionsAnswered ?? 0,
        questionsCorrect: input.questionsCorrect ?? 0,
        nodesCompleted: input.nodesCompleted ?? 0,
        gemsEarned: input.gemsEarned ?? 0,
        simulacrosCompleted: input.simulacrosCompleted ?? 0,
      },
    });
  }

  /**
   * Devuelve el registro de actividad de hoy, creándolo si no existe.
   */
  private async getOrCreateDailyLog(userId: string) {
    const date = this.toDate(new Date());
    const existing = await this.prisma.activityLog.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (existing) return { log: existing, created: false };
    const created = await this.prisma.activityLog.create({
      data: { userId, date },
    });
    return { log: created, created: true };
  }

  /**
   * Otorga gemas a un usuario respetando el tope diario, login bonus y
   * potenciadores activos. Devuelve el desglose de lo otorgado.
   */
  async awardGems(
    userId: string,
    baseGems: number
  ): Promise<GemAwardResult> {
    const { log, created } = await this.getOrCreateDailyLog(userId);

    let loginBonus = 0;
    if (created) {
      loginBonus = Math.min(5, DAILY_GEMS_CAP);
      if (loginBonus > 0) {
        await this.prisma.activityLog.update({
          where: { id: log.id },
          data: { loginBonusGems: loginBonus },
        });
        await this.incrementUserGems(userId, loginBonus);
      }
    }

    const activeBoost = await this.getActiveGemBoost(userId);
    const boostedBase = activeBoost > 1 ? baseGems * activeBoost : baseGems;

    const current = await this.prisma.activityLog.findUnique({
      where: { id: log.id },
    });
    const earnedToday =
      (current?.gemsEarned ?? 0) +
      (current?.loginBonusGems ?? 0) +
      (current?.streakMilestoneGems ?? 0);
    const remaining = Math.max(0, DAILY_GEMS_CAP - earnedToday);
    const capped = Math.min(boostedBase, remaining);

    if (capped > 0) {
      await this.prisma.activityLog.update({
        where: { id: log.id },
        data: { gemsEarned: { increment: capped } },
      });
      await this.incrementUserGems(userId, capped);
    }

    return {
      base: baseGems,
      capped,
      loginBonus,
      streakMilestone: 0,
      total: loginBonus + capped,
    };
  }

  /**
   * Otorga gemas por completar un nodo (10 gemas).
   */
  async awardNodeCompletionGems(userId: string): Promise<GemAwardResult> {
    return this.awardGems(userId, 10);
  }

  /**
   * Revisa si la racha alcanzó un milestone y otorga gemas.
   * Se llama después de recalcular la racha.
   */
  async awardStreakMilestone(userId: string, streak: number): Promise<number> {
    if (streak <= 0) return 0;

    const milestoneGems = streak === 30 ? 100 : streak % 7 === 0 ? 30 : 0;
    if (!milestoneGems) return 0;

    const { log } = await this.getOrCreateDailyLog(userId);
    if (log.streakMilestoneGems > 0) return 0;

    const earnedToday =
      log.gemsEarned + log.loginBonusGems + log.streakMilestoneGems;
    const remaining = Math.max(0, DAILY_GEMS_CAP - earnedToday);
    const awarded = Math.min(milestoneGems, remaining);

    if (awarded > 0) {
      await this.prisma.activityLog.update({
        where: { id: log.id },
        data: { streakMilestoneGems: awarded },
      });
      await this.incrementUserGems(userId, awarded);
    }

    return awarded;
  }

  private async incrementUserGems(userId: string, amount: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { gems: { increment: amount } },
    });
  }

  private async getActiveGemBoost(userId: string): Promise<number> {
    const now = new Date();
    const item = await this.prisma.userItem.findFirst({
      where: {
        userId,
        itemKey: 'GEM_BOOST_30MIN',
        expiresAt: { gt: now },
      },
    });
    return item ? 2 : 1;
  }

  /**
   * Devuelve el heatmap de actividad de los últimos N días.
   */
  async getHeatmap(userId: string, days = 84) {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
        date: { gte: this.toDate(start), lte: this.toDate(end) },
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
   * Devuelve el estado de la racha para los últimos 7 días (incluyendo hoy)
   * basándose únicamente en los ActivityLog.
   *
   * Estados:
   * - done: día con actividad (pasado o hoy).
   * - missed: día pasado sin actividad.
   * - not_yet: día futuro o hoy sin actividad aún.
   */
  async getWeeklyStreak(userId: string) {
    const today = this.toDate(new Date());
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

      let status: 'done' | 'missed' | 'not_yet' = 'not_yet';
      if (hasActivity) {
        status = 'done';
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
   * Recalcula la racha del usuario a partir de los ActivityLog y sincroniza
   * user.streak / user.lastInteraction. Devuelve la nueva racha.
   *
   * Si el usuario tiene Protectores de Racha (STREAK_FREEZE_1D), se consumen
   * para saltar días sin actividad.
   */
  async recalculateStreak(userId: string): Promise<number> {
    const today = this.toDate(new Date());

    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
        date: { lte: today },
        OR: [
          { questionsAnswered: { gt: 0 } },
          { nodesCompleted: { gt: 0 } },
          { simulacrosCompleted: { gt: 0 } },
        ],
      },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    const freezeCount = await this.getStreakFreezeCount(userId);
    let usedFreezes = 0;
    let streak = 0;
    let expectedTime = today.getTime();

    for (const log of logs) {
      const logTime = this.toDate(log.date).getTime();

      while (logTime < expectedTime && usedFreezes < freezeCount) {
        usedFreezes++;
        expectedTime -= 86_400_000;
      }

      if (logTime === expectedTime) {
        streak++;
        expectedTime -= 86_400_000;
      } else if (logTime < expectedTime) {
        break;
      }
    }

    if (usedFreezes > 0) {
      await this.consumeStreakFreezes(userId, usedFreezes);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { streak, lastInteraction: new Date() },
    });

    await this.awardStreakMilestone(userId, streak);

    return streak;
  }

  private async getStreakFreezeCount(userId: string): Promise<number> {
    const result = await this.prisma.userItem.aggregate({
      where: { userId, itemKey: STREAK_FREEZE_KEY },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  }

  private async consumeStreakFreezes(userId: string, count: number) {
    const item = await this.prisma.userItem.findUnique({
      where: { userId_itemKey: { userId, itemKey: STREAK_FREEZE_KEY } },
    });
    if (!item) return;
    const newQty = Math.max(0, item.quantity - count);
    await this.prisma.userItem.update({
      where: { id: item.id },
      data: { quantity: newQty },
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

  private toDate(date: Date): Date {
    // Usamos la fecha local del servidor/PC para que el día de hoy en Perú
    // no se guarde como mañana por el desfase UTC.
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  }

  private intensity(log: {
    questionsAnswered: number;
    nodesCompleted: number;
    simulacrosCompleted: number;
    gemsEarned: number;
  }): number {
    // La intensidad refleja unidades de contenido completadas, no volumen de
    // preguntas/gemas. Un simulacro cuenta el doble que un nodo del path.
    const value = log.nodesCompleted + log.simulacrosCompleted * 2;
    if (value === 0) return 0;
    if (value === 1) return 1;
    if (value === 2) return 2;
    if (value === 3) return 3;
    return 4;
  }
}
