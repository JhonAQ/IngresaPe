import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionGraderService } from './question-grader.service';
import { TRPCError } from '@trpc/server';
import { AnswerSubmission } from '@ingresa-pe/domain';
import { calculateNewStreak } from '../utils/streak.utils';
import { ActivityService } from './activity.service';

interface SubmitAnswerInput {
  userId: string;
  questionId: string;
  answer: AnswerSubmission;
}

const GEMS_PER_CORRECT = 1;

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly grader: QuestionGraderService,
    private readonly activityService: ActivityService
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
    const { newStreak, shouldUpdateDate, streakIncremented } = calculateNewStreak(
      user.streak,
      user.lastInteraction
    );

    // 6. Transacción Atómica: Guardar Intento y Actualizar User
    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar Stats del Usuario (XP, monedas, gemas y racha)
      const gemsEarned = isCorrect ? GEMS_PER_CORRECT : 0;
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: xpEarned },
          coins: { increment: coinsEarned },
          gems: { increment: gemsEarned },
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

      // C. Registrar actividad diaria
      await this.activityService.log({
        userId,
        questionsAnswered: 1,
        questionsCorrect: isCorrect ? 1 : 0,
        xpEarned,
        gemsEarned,
      });

      // Retornamos el resultado procesado
      return {
        success: true,
        isCorrect,
        correctAnswerText,
        correctOrder,
        explanation: explanation ?? question.explanation,
        rewards,
        streakIncremented,
        userStats: {
          xp: updatedUser.totalXp,
          energy: updatedUser.energy,
          streak: updatedUser.streak,
          coins: updatedUser.coins,
          gems: updatedUser.gems,
        },
      };
    });
  }

}
