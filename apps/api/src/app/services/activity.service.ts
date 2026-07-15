import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ActivityInput {
  userId: string;
  questionsAnswered?: number;
  questionsCorrect?: number;
  nodesCompleted?: number;
  xpEarned?: number;
  gemsEarned?: number;
  simulacrosCompleted?: number;
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
        xpEarned: { increment: input.xpEarned ?? 0 },
        gemsEarned: { increment: input.gemsEarned ?? 0 },
        simulacrosCompleted: { increment: input.simulacrosCompleted ?? 0 },
      },
      create: {
        userId: input.userId,
        date,
        questionsAnswered: input.questionsAnswered ?? 0,
        questionsCorrect: input.questionsCorrect ?? 0,
        nodesCompleted: input.nodesCompleted ?? 0,
        xpEarned: input.xpEarned ?? 0,
        gemsEarned: input.gemsEarned ?? 0,
        simulacrosCompleted: input.simulacrosCompleted ?? 0,
      },
    });
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
        xpEarned: log.xpEarned,
        gemsEarned: log.gemsEarned,
      }),
      questionsAnswered: log.questionsAnswered,
      nodesCompleted: log.nodesCompleted,
      xpEarned: log.xpEarned,
      gemsEarned: log.gemsEarned,
      simulacrosCompleted: log.simulacrosCompleted,
    }));
  }

  /**
   * Devuelve el estado de la racha para los últimos 7 días (incluyendo hoy)
   * basándose únicamente en los ActivityLog. El día de hoy se marca como
   * 'freezed' si ya tuvo actividad; los demás días usan 'done' o 'not_yet'.
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

      let status: 'done' | 'freezed' | 'not_yet' = 'not_yet';
      if (d.isToday) {
        status = hasActivity ? 'freezed' : 'not_yet';
      } else if (hasActivity) {
        status = 'done';
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
    xpEarned: number;
    gemsEarned: number;
  }): number {
    // La intensidad refleja unidades de contenido completadas, no volumen de
    // preguntas/XP/gemas. Un simulacro cuenta el doble que un nodo del path.
    const value = log.nodesCompleted + log.simulacrosCompleted * 2;
    if (value === 0) return 0;
    if (value === 1) return 1;
    if (value === 2) return 2;
    if (value === 3) return 3;
    return 4;
  }
}
