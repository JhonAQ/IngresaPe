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
      }),
      questionsAnswered: log.questionsAnswered,
      nodesCompleted: log.nodesCompleted,
      xpEarned: log.xpEarned,
      gemsEarned: log.gemsEarned,
      simulacrosCompleted: log.simulacrosCompleted,
    }));
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
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private intensity(log: { questionsAnswered: number; nodesCompleted: number; simulacrosCompleted: number }): number {
    const value = log.questionsAnswered + log.nodesCompleted * 3 + log.simulacrosCompleted * 20;
    if (value === 0) return 0;
    if (value < 5) return 1;
    if (value < 15) return 2;
    if (value < 30) return 3;
    return 4;
  }
}
