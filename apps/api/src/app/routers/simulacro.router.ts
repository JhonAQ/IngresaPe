import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';

const FREE_WEEKLY_ATTEMPTS = 1;

@Injectable()
export class SimulacroRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    getStats: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const user = await this.prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: {
          id: true,
          isPremium: true,
          lastExamScore: true,
          freeSimAttemptsUsed: true,
          freeSimAttemptsResetAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' });
      }

      const completedAttempts = await this.prisma.examAttempt.findMany({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          score: { not: null },
        },
        select: { score: true },
      });

      const scores = completedAttempts
        .map((a) => a.score)
        .filter((s): s is number => s !== null);

      const bestScore = scores.length > 0 ? Math.max(...scores) : null;
      const averageScore =
        scores.length > 0
          ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
          : null;

      const totalAttempts = await this.prisma.examAttempt.count({
        where: { userId: user.id },
      });

      const freeAttemptsRemaining = user.isPremium
        ? FREE_WEEKLY_ATTEMPTS
        : Math.max(0, FREE_WEEKLY_ATTEMPTS - user.freeSimAttemptsUsed);

      return {
        lastExamScore: user.lastExamScore ?? null,
        bestScore,
        averageScore,
        totalAttempts,
        freeAttemptsUsed: user.isPremium ? 0 : user.freeSimAttemptsUsed,
        freeAttemptsLimit: FREE_WEEKLY_ATTEMPTS,
        freeAttemptsRemaining,
        freeAttemptsResetAt: user.freeSimAttemptsResetAt ?? null,
        isPremium: user.isPremium,
      };
    }),

    // Fase 1: endpoint básico para listar carreras disponibles (usado al elegir carrera)
    getCareers: this.trpc.publicProcedure.query(async () => {
      const careers = await this.prisma.career.findMany({
        select: {
          id: true,
          name: true,
          area: true,
          minimumScore: true,
        },
        orderBy: { name: 'asc' },
      });
      return careers;
    }),
  });
}
