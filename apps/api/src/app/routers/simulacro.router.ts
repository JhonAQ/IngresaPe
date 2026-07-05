import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { WeakTopicAnalyzerService } from '../services/weak-topic-analyzer.service';

const FREE_WEEKLY_ATTEMPTS = 1;

const byIdSchema = z.object({ attemptId: z.string().uuid() });
const byExamIdSchema = z.object({ examId: z.string().uuid() });
const startGeneratedSchema = z.object({
  questionCount: z.number().int().min(5).max(100),
  timeLimitMinutes: z.number().int().min(5).max(180),
  strategy: z.enum(['AI', 'RANDOM']),
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
    private readonly analyzer: WeakTopicAnalyzerService
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

      const { remaining, resetAt } = this.computeFreeAttemptState(user);

      return {
        lastExamScore: user.lastExamScore ?? null,
        bestScore,
        averageScore,
        totalAttempts,
        freeAttemptsUsed: user.isPremium ? 0 : user.freeSimAttemptsUsed,
        freeAttemptsLimit: FREE_WEEKLY_ATTEMPTS,
        freeAttemptsRemaining: user.isPremium ? FREE_WEEKLY_ATTEMPTS : remaining,
        freeAttemptsResetAt: resetAt ?? null,
        isPremium: user.isPremium,
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
        score: a.score,
        correctCount: a.correctCount,
        incorrectCount: a.incorrectCount,
        blankCount: a.blankCount,
        questionCount: a.questionCount,
        timeLimitSeconds: a.timeLimitSeconds,
        timeUsedSeconds: a.timeUsedSeconds,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' });
        }

        if (!user.isPremium) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'El archivo histórico es exclusivo para usuarios premium.',
          });
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Examen no encontrado' });
        }

        const questionIds = exam.questions.map((q) => q.id);

        const attempt = await this.prisma.examAttempt.create({
          data: {
            userId: user.id,
            examId: exam.id,
            mode: 'ARCHIVE',
            questionCount: exam.questionCount,
            timeLimitSeconds: exam.timeLimitMinutes * 60,
            questionIds,
          },
          select: { id: true },
        });

        return { attemptId: attempt.id };
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' });
        }

        const { used, resetAt, remaining } = this.computeFreeAttemptState(user);

        if (!user.isPremium && remaining <= 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Has usado tu simulacro gratuito de esta semana. Sube a premium para intentos ilimitados.',
          });
        }

        const questionIds =
          input.strategy === 'AI'
            ? (await this.analyzer.selectQuestions(user.id, input.questionCount)).questionIds
            : await this.analyzer.selectRandomQuestions(input.questionCount);

        if (questionIds.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No hay suficientes preguntas disponibles para generar el simulacro.',
          });
        }

        // Si se reinició el contador, persistimos la fecha de reset.
        if (resetAt && (!user.freeSimAttemptsResetAt || resetAt > user.freeSimAttemptsResetAt)) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { freeSimAttemptsUsed: used, freeSimAttemptsResetAt: resetAt },
          });
        }

        const attempt = await this.prisma.examAttempt.create({
          data: {
            userId: user.id,
            mode: 'GENERATED',
            questionCount: questionIds.length,
            timeLimitSeconds: input.timeLimitMinutes * 60,
            questionIds,
          },
          select: { id: true },
        });

        return { attemptId: attempt.id };
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Intento no encontrado' });
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
          score: attempt.score,
          correctCount: attempt.correctCount,
          incorrectCount: attempt.incorrectCount,
          blankCount: attempt.blankCount,
          questionCount: attempt.questionCount,
          timeLimitSeconds: attempt.timeLimitSeconds,
          timeUsedSeconds: attempt.timeUsedSeconds,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          questions: orderedQuestions.map((q) => ({
            id: q.id,
            examId: q.examId,
            order: q.order,
            statement: q.statement,
            options: (q.options as Array<{ id: string; text: string; isCorrect: boolean }>).map((o) => ({
              id: o.id,
              text: o.text,
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Intento no encontrado' });
        }

        if (attempt.status !== 'IN_PROGRESS') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Este intento ya fue entregado' });
        }

        const questions = await this.prisma.examQuestion.findMany({
          where: { id: { in: attempt.questionIds } },
          select: { id: true, options: true },
        });

        const questionMap = new Map(questions.map((q) => [q.id, q]));

        let correctCount = 0;
        let incorrectCount = 0;
        let blankCount = 0;

        const gradedAnswers: Record<string, { selectedOptionId: string; timeTaken?: number; isCorrect: boolean }> = {};
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
          const options = (question?.options ?? []) as Array<{ id: string; text: string; isCorrect: boolean }>;
          const correctOption = options.find((o) => o.isCorrect);

          if (!submitted || !submitted.selectedOptionId) {
            blankCount++;
            gradedAnswers[questionId] = { selectedOptionId: '', timeTaken: 0, isCorrect: false };
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
            answer: { selectedOptionId: submitted.selectedOptionId, timeTaken: submitted.timeTaken },
            timeTaken: submitted.timeTaken,
          });
        }

        const totalAnswered = correctCount + incorrectCount;
        const score = attempt.questionCount > 0
          ? Number(((correctCount / attempt.questionCount) * 100).toFixed(1))
          : 0;

        const timeUsedSeconds = Math.max(
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

          const userUpdateData: any = {
            totalXp: { increment: xpEarned },
            coins: { increment: coinsEarned },
            lastExamScore: score,
          };

          if (attempt.mode === 'GENERATED' && !attempt.examId) {
            userUpdateData.freeSimAttemptsUsed = { increment: 1 };
          }

          await tx.user.update({
            where: { id: ctx.user.userId },
            data: userUpdateData,
          });
        });

        return {
          attemptId: attempt.id,
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
      return { used: 0, remaining: FREE_WEEKLY_ATTEMPTS, resetAt: this.getNextMonday() };
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
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    next.setUTCDate(next.getUTCDate() + ((8 - next.getUTCDay()) % 7 || 7));
    return next;
  }
}
