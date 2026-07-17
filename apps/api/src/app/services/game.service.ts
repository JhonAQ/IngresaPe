import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionGraderService } from './question-grader.service';
import { TRPCError } from '@trpc/server';
import { AnswerSubmission } from '@ingresa-pe/domain';
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
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Usuario no encontrado',
      });
    }

    // 2. Obtener Pregunta
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Pregunta no encontrada',
      });
    }

    // 3. Calificar respuesta (type-aware)
    const gradeResult = this.grader.grade(question, answer);
    const { isCorrect, correctAnswerText, correctOrder, explanation } =
      gradeResult;

    // 4. Calcular Recompensas (solo monedas/gemas, sin XP)
    const rewards = this.grader.computeRewards(question.difficulty, isCorrect);
    const { coins: coinsEarned } = rewards;
    const gemsEarned = isCorrect ? GEMS_PER_CORRECT : 0;

    // Guardamos la racha previa para detectar si incrementó con esta acción
    const previousStreak = user.streak;

    // 5. Transacción Atómica: Guardar Intento y Actualizar User
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const userRow = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: coinsEarned },
          gems: { increment: gemsEarned },
        },
      });

      await tx.answerLog.create({
        data: {
          userId,
          questionId: question.id,
          isCorrect,
          answer: answer as any, // Prisma Json acepta object
        },
      });

      return userRow;
    });

    // 6. Registrar actividad diaria y sincronizar racha desde ActivityLog
    await this.activityService.log({
      userId,
      questionsAnswered: 1,
      questionsCorrect: isCorrect ? 1 : 0,
      gemsEarned,
    });
    const newStreak = await this.activityService.recalculateStreak(userId);
    const streakIncremented = newStreak > previousStreak;

    return {
      success: true,
      isCorrect,
      correctAnswerText,
      correctOrder,
      explanation: explanation ?? question.explanation,
      rewards: { coins: coinsEarned, gems: gemsEarned },
      streakIncremented,
      userStats: {
        energy: updatedUser.energy,
        streak: newStreak,
        coins: updatedUser.coins,
        gems: updatedUser.gems,
      },
    };
  }
}
