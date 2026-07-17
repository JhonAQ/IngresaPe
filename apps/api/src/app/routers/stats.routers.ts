import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  router = this.trpc.router({
    
    // 📊 DASHBOARD PRINCIPAL
    getDashboard: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.userId;

      // 1. Datos del Usuario
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, energy: true, name: true }
      });

      if (!user) throw new Error('Usuario no encontrado');

      // 2. Cuenta Regresiva (Hardcoded por ahora: Examen UNSA aprox Agosto/Sept)
      // OJO: Cámbialo a la fecha real de tu examen objetivo
      const examDate = new Date('2025-08-15');
      const today = new Date();
      const diffTime = Math.abs(examDate.getTime() - today.getTime());
      const daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 3. Preguntas respondidas HOY (Para la gráfica diaria)
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);

      const questionsToday = await this.prisma.answerLog.count({
        where: {
            userId,
            createdAt: { gte: startOfDay }
        }
      });

      return {
        user: {
            name: user.name,
            energy: user.energy,
            streak: user.streak
        },
        stats: {
            daysUntilExam,
            questionsToday,
        }
      };
    }),
  });
}