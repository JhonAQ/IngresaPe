import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { WeakTopicAnalyzerService } from '../services/weak-topic-analyzer.service';
import { SeasonService } from '../services/season.service';
import { ratingToScore } from '../services/rating.service';
import { ActivityService } from '../services/activity.service';

const FREE_WEEKLY_ATTEMPTS = 1;

const byIdSchema = z.object({ attemptId: z.string().uuid() });
const byExamIdSchema = z.object({ examId: z.string().uuid() });
const startGeneratedSchema = z.object({
  questionCount: z.number().int().min(5).max(100),
  timeLimitMinutes: z.number().int().min(5).max(180),
  strategy: z.enum(['AI', 'RANDOM']),
  isOfficial: z.boolean().default(false),
});

const submitSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.record(
    z.string(),
    z.object({
      selectedOptionId: z.string(),
      timeTaken: z.number().optional(),
    })
  ),
});

const XP_PER_CORRECT = 10;
const COINS_PER_CORRECT = 5;

@Injectable()
export class SimulacroRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService,
    private readonly analyzer: WeakTopicAnalyzerService,
    private readonly seasonService: SeasonService,
    private readonly activityService: ActivityService
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
          rating: true,
          division: true,
          highestRating: true,
          gems: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        });
      }

      const season = await this.seasonService.getOrCreateCurrentSeason();
      const hasOfficialAttempt = await this.seasonService.hasOfficialAttempt(
        user.id,
        season.id
      );
      const officialAttempt =
        await this.seasonService.getCurrentOfficialAttempt(user.id, season.id);

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
          ? Number(
              (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
            )
          : null;

      const { remaining, resetAt } = this.computeFreeAttemptState(user);

      return {
        lastExamScore: user.lastExamScore ?? null,
        bestScore,
        averageScore,
        totalAttempts: completedAttempts.length,
        freeAttemptsUsed: user.isPremium ? 0 : user.freeSimAttemptsUsed,
        freeAttemptsLimit: FREE_WEEKLY_ATTEMPTS,
        freeAttemptsRemaining: user.isPremium
          ? FREE_WEEKLY_ATTEMPTS
          : remaining,
        freeAttemptsResetAt: resetAt ?? null,
        isPremium: user.isPremium,
        rating: user.rating,
        score: ratingToScore(user.rating),
        division: user.division,
        highestRating: user.highestRating,
        gems: user.gems,
        season: {
          id: season.id,
          isEventOpen: this.seasonService.isEventOpen(season),
          eventStartsAt: season.eventStartsAt,
          eventEndsAt: season.eventEndsAt,
          isRevealed: season.isRevealed,
          hasOfficialAttempt,
          officialAttemptStatus: officialAttempt?.status ?? null,
        },
      };
    }),

    getRecentAttempts: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const attempts = await this.prisma.examAttempt.findMany({
        where: { userId: ctx.user.userId },
        include: { exam: { select: { title: true } } },
        orderBy: { startedAt: 'desc' },
        take: 10,
      });

      return attempts.map((a) => ({
        id: a.id,
        examId: a.examId,
        examTitle: a.exam?.title ?? null,
        mode: a.mode,
        status: a.status,
        score: a.isOfficial ? (a.isRevealed ? a.score : null) : a.score,
        correctCount: a.correctCount,
        incorrectCount: a.incorrectCount,
        blankCount: a.blankCount,
        questionCount: a.questionCount,
        timeLimitSeconds: a.timeLimitSeconds,
        timeUsedSeconds: a.timeUsedSeconds,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        isOfficial: a.isOfficial,
        isRevealed: a.isRevealed,
        calculatedRatingDelta: a.calculatedRatingDelta,
      }));
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

    // Fase 2: archivo histórico de exámenes reales
    getArchiveExams: this.trpc.protectedProcedure.query(async () => {
      const exams = await this.prisma.exam.findMany({
        select: {
          id: true,
          title: true,
          year: true,
          phase: true,
          type: true,
          questionCount: true,
          timeLimitMinutes: true,
        },
        orderBy: [{ year: 'desc' }, { phase: 'desc' }],
      });
      return exams;
    }),

    startArchiveAttempt: this.trpc.protectedProcedure
      .input(byExamIdSchema)
      .mutation(async ({ ctx, input }) => {
        const user = await this.prisma.user.findUnique({
          where: { id: ctx.user.userId },
          select: { id: true, isPremium: true },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Usuario no encontrado',
          });
        }

        if (!user.isPremium) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'El archivo histórico es exclusivo para usuarios premium.',
          });
        }

        const season = await this.seasonService.getOrCreateCurrentSeason();
        if (this.seasonService.isEventOpen(season)) {
          const hasOfficial = await this.seasonService.hasOfficialAttempt(
            user.id,
            season.id
          );
          if (hasOfficial) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message:
                'Ya iniciaste tu simulacro oficial de este fin de semana.',
            });
          }
        }

        const exam = await this.prisma.exam.findUnique({
          where: { id: input.examId },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              select: { id: true },
            },
          },
        });

        if (!exam) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Examen no encontrado',
          });
        }

        const questionIds = exam.questions.map((q) => q.id);
        const isOfficial = this.seasonService.isEventOpen(season);

        const attempt = await this.prisma.examAttempt.create({
          data: {
            userId: user.id,
            examId: exam.id,
            mode: 'ARCHIVE',
            questionCount: exam.questionCount,
            timeLimitSeconds: exam.timeLimitMinutes * 60,
            questionIds,
            isOfficial,
            seasonId: isOfficial ? season.id : null,
            timerStartedAt: isOfficial ? new Date() : null,
          },
          select: { id: true },
        });

        return { attemptId: attempt.id, isOfficial };
      }),

    // Fase 4: generar simulacro personalizado (IA o aleatorio)
    startGeneratedAttempt: this.trpc.protectedProcedure
      .input(startGeneratedSchema)
      .mutation(async ({ ctx, input }) => {
        const user = await this.prisma.user.findUnique({
          where: { id: ctx.user.userId },
          select: {
            id: true,
            isPremium: true,
            freeSimAttemptsUsed: true,
            freeSimAttemptsResetAt: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Usuario no encontrado',
          });
        }

        const season = await this.seasonService.getOrCreateCurrentSeason();
        const isOfficial =
          input.isOfficial && this.seasonService.isEventOpen(season);

        if (isOfficial) {
          const hasOfficial = await this.seasonService.hasOfficialAttempt(
            user.id,
            season.id
          );
          if (hasOfficial) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message:
                'Ya iniciaste tu simulacro oficial de este fin de semana.',
            });
          }
        } else {
          const { resetAt, remaining } = this.computeFreeAttemptState(user);
          if (!user.isPremium && remaining <= 0) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message:
                'Has usado tu simulacro gratuito de esta semana. Sube a premium para intentos ilimitados.',
            });
          }

          if (!user.isPremium) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: {
                freeSimAttemptsUsed: { increment: 1 },
                ...(resetAt &&
                (!user.freeSimAttemptsResetAt ||
                  resetAt > user.freeSimAttemptsResetAt)
                  ? { freeSimAttemptsResetAt: resetAt }
                  : {}),
              },
            });
          }
        }

        const questionIds =
          input.strategy === 'AI'
            ? (
                await this.analyzer.selectQuestions(
                  user.id,
                  input.questionCount
                )
              ).questionIds
            : await this.analyzer.selectRandomQuestions(input.questionCount);

        if (questionIds.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message:
              'No hay suficientes preguntas disponibles para generar el simulacro.',
          });
        }

        const attempt = await this.prisma.examAttempt.create({
          data: {
            userId: user.id,
            mode: 'GENERATED',
            questionCount: questionIds.length,
            timeLimitSeconds: input.timeLimitMinutes * 60,
            questionIds,
            isOfficial,
            seasonId: isOfficial ? season.id : null,
            timerStartedAt: isOfficial ? new Date() : null,
          },
          select: { id: true },
        });

        return { attemptId: attempt.id, isOfficial };
      }),

    // Fase 2-3: recuperar un intento con sus preguntas
    getById: this.trpc.protectedProcedure
      .input(byIdSchema)
      .query(async ({ ctx, input }) => {
        const attempt = await this.prisma.examAttempt.findUnique({
          where: { id: input.attemptId },
          include: {
            exam: {
              select: { id: true, title: true },
            },
          },
        });

        if (!attempt || attempt.userId !== ctx.user.userId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Intento no encontrado',
          });
        }

        const questions = await this.prisma.examQuestion.findMany({
          where: { id: { in: attempt.questionIds } },
          include: {
            topic: { select: { name: true } },
            course: { select: { name: true } },
          },
        });

        const questionMap = new Map(questions.map((q) => [q.id, q]));
        const orderedQuestions = attempt.questionIds
          .map((id) => questionMap.get(id))
          .filter((q): q is NonNullable<typeof q> => q !== undefined);

        return {
          id: attempt.id,
          examId: attempt.examId,
          examTitle: attempt.exam?.title ?? null,
          mode: attempt.mode,
          status: attempt.status,
          score: attempt.isOfficial
            ? attempt.isRevealed
              ? attempt.score
              : null
            : attempt.score,
          correctCount: attempt.correctCount,
          incorrectCount: attempt.incorrectCount,
          blankCount: attempt.blankCount,
          questionCount: attempt.questionCount,
          timeLimitSeconds: attempt.timeLimitSeconds,
          timeUsedSeconds: attempt.timeUsedSeconds,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          timerStartedAt: attempt.timerStartedAt,
          serverTimeLimitSec: attempt.serverTimeLimitSec,
          isOfficial: attempt.isOfficial,
          isRevealed: attempt.isRevealed,
          serverNow: new Date(),
          questions: orderedQuestions.map((q) => ({
            id: q.id,
            examId: q.examId,
            order: q.order,
            statement: q.statement,
            passage: q.passage,
            imageUrl: q.imageUrl,
            options: (
              q.options as Array<{
                id: string;
                text: string;
                isCorrect: boolean;
                imageUrl?: string | null;
              }>
            ).map((o) => ({
              id: o.id,
              text: o.text,
              imageUrl: o.imageUrl,
            })),
            difficulty: q.difficulty,
            topicName: q.topic.name,
            courseName: q.course.name,
          })),
        };
      }),

    // Fase 3: entregar y calificar un intento
    submit: this.trpc.protectedProcedure
      .input(submitSchema)
      .mutation(async ({ ctx, input }) => {
        const attempt = await this.prisma.examAttempt.findUnique({
          where: { id: input.attemptId },
          include: { exam: { select: { id: true, title: true } } },
        });

        if (!attempt || attempt.userId !== ctx.user.userId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Intento no encontrado',
          });
        }

        if (attempt.status !== 'IN_PROGRESS') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Este intento ya fue entregado',
          });
        }

        const questions = await this.prisma.examQuestion.findMany({
          where: { id: { in: attempt.questionIds } },
          select: { id: true, options: true },
        });

        const questionMap = new Map(questions.map((q) => [q.id, q]));

        let correctCount = 0;
        let incorrectCount = 0;
        let blankCount = 0;

        const gradedAnswers: Record<
          string,
          { selectedOptionId: string; timeTaken?: number; isCorrect: boolean }
        > = {};
        const answerLogs: Array<{
          userId: string;
          examQuestionId: string;
          isCorrect: boolean;
          answer: { selectedOptionId: string; timeTaken?: number };
          timeTaken?: number;
        }> = [];

        for (const questionId of attempt.questionIds) {
          const question = questionMap.get(questionId);
          const submitted = input.answers[questionId];
          const options = (question?.options ?? []) as Array<{
            id: string;
            text: string;
            isCorrect: boolean;
          }>;
          const correctOption = options.find((o) => o.isCorrect);

          if (!submitted || !submitted.selectedOptionId) {
            blankCount++;
            gradedAnswers[questionId] = {
              selectedOptionId: '',
              timeTaken: 0,
              isCorrect: false,
            };
            continue;
          }

          const isCorrect = submitted.selectedOptionId === correctOption?.id;
          if (isCorrect) correctCount++;
          else incorrectCount++;

          gradedAnswers[questionId] = {
            selectedOptionId: submitted.selectedOptionId,
            timeTaken: submitted.timeTaken,
            isCorrect,
          };

          answerLogs.push({
            userId: ctx.user.userId,
            examQuestionId: questionId,
            isCorrect,
            answer: {
              selectedOptionId: submitted.selectedOptionId,
              timeTaken: submitted.timeTaken,
            },
            timeTaken: submitted.timeTaken,
          });
        }

        const totalAnswered = correctCount + incorrectCount;
        const score =
          attempt.questionCount > 0
            ? Number(((correctCount / attempt.questionCount) * 100).toFixed(1))
            : 0;

        const timeUsedSeconds = attempt.timerStartedAt
          ? Math.max(
              0,
              Math.floor((Date.now() - attempt.timerStartedAt.getTime()) / 1000)
            )
          : Math.max(
              0,
              Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)
            );

        const xpEarned = correctCount * XP_PER_CORRECT;
        const coinsEarned = correctCount * COINS_PER_CORRECT;

        await this.prisma.$transaction(async (tx) => {
          await tx.examAttempt.update({
            where: { id: attempt.id },
            data: {
              status: 'COMPLETED',
              submittedAt: new Date(),
              serverSubmittedAt: new Date(),
              timeUsedSeconds,
              correctCount,
              incorrectCount,
              blankCount,
              score,
              answers: gradedAnswers as any,
              totalXpEarned: xpEarned,
              totalCoinsEarned: coinsEarned,
            },
          });

          for (const log of answerLogs) {
            await tx.answerLog.create({ data: log as any });
          }

          if (!attempt.isOfficial) {
            await tx.user.update({
              where: { id: ctx.user.userId },
              data: {
                totalXp: { increment: xpEarned },
                coins: { increment: coinsEarned },
                lastExamScore: score,
              },
            });
          }
        });

        await this.activityService.log({
          userId: ctx.user.userId,
          simulacrosCompleted: 1,
          xpEarned,
        });

        if (attempt.isOfficial) {
          return {
            attemptId: attempt.id,
            status: 'RECEIVED' as const,
            message: 'Examen recibido. Calculando percentiles...',
          };
        }

        return {
          attemptId: attempt.id,
          status: 'COMPLETED' as const,
          score,
          correctCount,
          incorrectCount,
          blankCount,
          totalAnswered,
          timeUsedSeconds,
          xpEarned,
          coinsEarned,
        };
      }),
  });

  private computeFreeAttemptState(user: {
    isPremium: boolean;
    freeSimAttemptsUsed: number;
    freeSimAttemptsResetAt: Date | null;
  }) {
    if (user.isPremium) {
      return {
        used: 0,
        remaining: FREE_WEEKLY_ATTEMPTS,
        resetAt: this.getNextMonday(),
      };
    }

    const now = new Date();
    let used = user.freeSimAttemptsUsed;
    let resetAt = user.freeSimAttemptsResetAt;

    if (!resetAt || now >= resetAt) {
      used = 0;
      resetAt = this.getNextMonday();
    }

    const remaining = Math.max(0, FREE_WEEKLY_ATTEMPTS - used);
    return { used, remaining, resetAt };
  }

  private getNextMonday(): Date {
    const now = new Date();
    const next = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    next.setUTCDate(next.getUTCDate() + ((8 - next.getUTCDay()) % 7 || 7));
    return next;
  }
}
