import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionGraderService } from './question-grader.service';
import { TRPCError } from '@trpc/server';
import { AnswerSubmission } from '@ingresa-pe/domain';
import { calculateNewStreak } from '../utils/streak.utils';

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
    // 1. Validar Usuario
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuario no encontrado' });
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
    const { isCorrect, correctAnswerText, correctOrder, explanation } = gradeResult;

    // 4. Calcular Recompensas
    const rewards = this.grader.computeRewards(question.difficulty, isCorrect);
    const { xp: xpEarned, coins: coinsEarned } = rewards;

    // 5. Calcular Nueva Racha (Streak)
    const { newStreak, shouldUpdateDate } = calculateNewStreak(
      user.streak,
      user.lastInteraction
    );

    // 6. Transacción Atómica: Guardar Intento y Actualizar User
    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar Stats del Usuario (XP, monedas y racha)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: xpEarned },
          coins: { increment: coinsEarned },
          streak: newStreak,
          lastInteraction: shouldUpdateDate ? new Date() : undefined,
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
        correctOrder,
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

}
