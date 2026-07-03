import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionGraderService } from './question-grader.service';
import { TRPCError } from '@trpc/server';
import { AnswerSubmission } from '@ingresa-pe/domain';

interface SubmitAnswerInput {
  userId: string;
  questionId: string;
  answer: AnswerSubmission;
}

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly grader: QuestionGraderService
  ) {}

  /**
   * Lógica central de validación y guardado de respuesta
   */
  async submitAnswer({ userId, questionId, answer }: SubmitAnswerInput) {
    // 1. Validar Usuario y Energía
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuario no encontrado' });
    }

    // 1.5 Recargar energía antes de validar (si ha pasado tiempo)
    const { energy: refilledEnergy, lastRefill: newLastRefill } = this.refillEnergy(
      user.energy,
      user.lastRefill
    );

    if (!user.isPremium && refilledEnergy <= 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '¡Sin energía! ⚡ Espera a que se recargue o hazte Premium.',
      });
    }

    // 2. Obtener Pregunta
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Pregunta no encontrada' });
    }

    // 3. Calificar respuesta (type-aware)
    const gradeResult = this.grader.grade(question, answer);
    const { isCorrect, correctAnswerText, explanation } = gradeResult;

    // 4. Calcular Recompensas
    const rewards = this.grader.computeRewards(question.difficulty, isCorrect);
    const { xp: xpEarned } = rewards;
    const energyCost = user.isPremium ? 0 : 1;

    // 5. Calcular Nueva Racha (Streak)
    const { newStreak, shouldUpdateDate } = this.calculateNewStreak(
      user.streak,
      user.lastInteraction
    );

    // 6. Transacción Atómica: Guardar Intento y Actualizar User
    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar Stats del Usuario (Ahora con Streak y recarga de energía)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          energy: { set: Math.max(0, refilledEnergy - energyCost) },
          totalXp: { increment: xpEarned },
          streak: newStreak,
          lastInteraction: shouldUpdateDate ? new Date() : undefined,
          lastRefill: newLastRefill,
        },
      });

      // B. Guardar el Log (Historial)
      await tx.answerLog.create({
        data: {
          userId,
          questionId: question.id,
          isCorrect,
          answer: answer as any, // Prisma Json acepta object
          // timeTaken: ... (Podríamos recibir esto del front en el futuro)
        },
      });

      // Retornamos el resultado procesado
      return {
        success: true,
        isCorrect,
        correctAnswerText,
        explanation: explanation ?? question.explanation,
        rewards,
        userStats: {
          xp: updatedUser.totalXp,
          energy: updatedUser.energy,
          streak: updatedUser.streak,
        },
      };
    });
  }

  /**
   * ⚡ Algoritmo de Recarga de Energía
   * Regenera +1 de energía por cada 30 minutos transcurridos desde lastRefill,
   * hasta un máximo de 25.
   */
  private refillEnergy(currentEnergy: number, lastRefill: Date) {
    const MAX_ENERGY = 25;
    const REFILL_INTERVAL_MINUTES = 30;

    const now = new Date();
    const last = new Date(lastRefill);
    const minutesSinceRefill = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60)
    );

    const energyToAdd = Math.floor(minutesSinceRefill / REFILL_INTERVAL_MINUTES);

    if (energyToAdd <= 0 || currentEnergy >= MAX_ENERGY) {
      return { energy: currentEnergy, lastRefill: last };
    }

    return {
      energy: Math.min(MAX_ENERGY, currentEnergy + energyToAdd),
      lastRefill: now,
    };
  }

  /**
   * 🧠 Algoritmo de Racha (Streak)
   * Determina si el usuario merece aumentar su racha basándose en la última interacción
   */
  private calculateNewStreak(currentStreak: number, lastDate: Date) {
    const now = new Date();
    const last = new Date(lastDate);

    const isToday = now.toDateString() === last.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === last.toDateString();

    if (isToday) {
      return { newStreak: currentStreak, shouldUpdateDate: true };
    } else if (isYesterday) {
      return { newStreak: currentStreak + 1, shouldUpdateDate: true };
    } else {
      return { newStreak: 1, shouldUpdateDate: true };
    }
  }
}
