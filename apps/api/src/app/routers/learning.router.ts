import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';
import { QuestionGraderService } from '../services/question-grader.service';
import { answerSubmissionSchema } from '@ingresa-pe/domain';
import { ActivityService } from '../services/activity.service';

@Injectable()
export class LearningRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService,
    private readonly grader: QuestionGraderService,
    private readonly activityService: ActivityService
  ) {}

  public router = this.trpc.router({
    getRandomQuestion: this.trpc.protectedProcedure
      .input(z.object({ topicId: z.string() }))
      .query(async ({ input }) => {
        const count = await this.prisma.question.count({
          where: { topicId: input.topicId },
        });
        if (count === 0)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No hay preguntas en este tema',
          });

        const skip = Math.floor(Math.random() * count);

        const question = await this.prisma.question.findFirst({
          where: { topicId: input.topicId },
          skip: skip,
          select: {
            id: true,
            statement: true,
            options: true,
            imageUrl: true,
            difficulty: true,
          },
        });
        return question;
      }),

    submitAnswer: this.trpc.protectedProcedure
      .input(
        z.object({
          questionId: z.string(),
          answer: z.any(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const answerParse = answerSubmissionSchema.safeParse(input.answer);
        if (!answerParse.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'La respuesta enviada no es válida',
          });
        }
        const answer = answerParse.data;

        const question = await this.prisma.question.findUnique({
          where: { id: input.questionId },
        });

        if (!question)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Pregunta no encontrada',
          });

        const gradeResult = this.grader.grade(question, answer);
        const { isCorrect, correctAnswerText, explanation } = gradeResult;
        const { gems: baseGems } = this.grader.computeRewards(
          question.difficulty,
          isCorrect
        );

        const activityResult = await this.activityService.recordActivity({
          userId: ctx.user.userId,
          type: 'QUESTION_ANSWERED',
          questionId: question.id,
          answer,
          isCorrect,
          baseGems,
          questionsAnswered: 1,
          questionsCorrect: isCorrect ? 1 : 0,
        });

        return {
          correct: isCorrect,
          correctAnswerText,
          explanation: explanation ?? question.explanation,
          rewards: { gems: activityResult.gemsAwarded },
          streakIncremented: activityResult.streakIncremented,
          newTotalGems: activityResult.user.gems,
        };
      }),
  });
}
