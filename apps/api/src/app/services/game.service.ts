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

    // 4. Calcular recompensas en gemas
    const rewards = this.grader.computeRewards(question.difficulty, isCorrect);

    // 5. Registrar actividad (AnswerLog + ActivityLog + racha + gemas)
    const activityResult = await this.activityService.recordActivity({
      userId,
      type: 'QUESTION_ANSWERED',
      questionId: question.id,
      answer,
      isCorrect,
      baseGems: rewards.gems,
      questionsAnswered: 1,
      questionsCorrect: isCorrect ? 1 : 0,
    });

    return {
      success: true,
      isCorrect,
      correctAnswerText,
      correctOrder,
      explanation: explanation ?? question.explanation,
      rewards: { gems: activityResult.gemsAwarded },
      streakIncremented: activityResult.streakIncremented,
      userStats: {
        energy: activityResult.user.energy,
        streak: activityResult.streak,
        gems: activityResult.user.gems,
      },
    };
  }
}
