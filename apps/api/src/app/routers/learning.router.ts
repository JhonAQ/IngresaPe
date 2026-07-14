import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';
import { QuestionGraderService } from '../services/question-grader.service';
import { answerSubmissionSchema } from '@ingresa-pe/domain';
import { calculateNewStreak } from '../utils/streak.utils';
import { ActivityService } from '../services/activity.service';

const GEMS_PER_CORRECT = 1;

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
        const count = await this.prisma.question.count({ where: { topicId: input.topicId } });
        if (count === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'No hay preguntas en este tema' });
        
        const skip = Math.floor(Math.random() * count);
        
        const question = await this.prisma.question.findFirst({
          where: { topicId: input.topicId },
          skip: skip,
          select: {
            id: true,
            statement: true,
            options: true,
            imageUrl: true,
            difficulty: true
          }
        });
        return question;
      }),

    submitAnswer: this.trpc.protectedProcedure
      .input(z.object({
        questionId: z.string(),
        answer: z.any(),
      }))
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

        if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pregunta no encontrada' });

        const gradeResult = this.grader.grade(question, answer);
        const { isCorrect, correctAnswerText, explanation } = gradeResult;
        const { xp: xpEarned, coins: coinsEarned } = this.grader.computeRewards(
          question.difficulty,
          isCorrect
        );
        const gemsEarned = isCorrect ? GEMS_PER_CORRECT : 0;

        const now = new Date();
        const user = await this.prisma.user.findUnique({ where: { id: ctx.user.userId } });

        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuario no encontrado' });
        }

        const { newStreak, shouldUpdateDate, streakIncremented } = calculateNewStreak(
          user.streak,
          user.lastInteraction
        );

        await this.prisma.user.update({
          where: { id: ctx.user.userId },
          data: {
            totalXp: { increment: xpEarned },
            coins: { increment: coinsEarned },
            gems: { increment: gemsEarned },
            streak: newStreak,
            lastInteraction: shouldUpdateDate ? now : undefined,
          }
        });

        await this.prisma.answerLog.create({
          data: {
            userId: ctx.user.userId,
            questionId: question.id,
            isCorrect: isCorrect,
            answer: answer as any,
          }
        });

        await this.activityService.log({
          userId: ctx.user.userId,
          questionsAnswered: 1,
          questionsCorrect: isCorrect ? 1 : 0,
          xpEarned,
          gemsEarned,
        });

        return {
          correct: isCorrect,
          correctAnswerText,
          explanation: explanation ?? question.explanation,
          rewards: { xp: xpEarned, coins: coinsEarned, gems: gemsEarned },
          streakIncremented,
          newTotalCoins: (user?.coins || 0) + coinsEarned,
          newTotalGems: (user?.gems || 0) + gemsEarned,
        };
      }),
  });
}