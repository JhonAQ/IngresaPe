import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Difficulty, Prisma } from '@prisma/client';

@Injectable()
export class ContentRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  router = this.trpc.router({
    
    // ------------------------------------------------------
    // 1. LISTAR CURSOS (Menú Principal)
    // ------------------------------------------------------
    getCourses: this.trpc.protectedProcedure.query(async () => {
      return await this.prisma.course.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { topics: true },
          },
        },
      });
    }),

    // ------------------------------------------------------
    // 2. LISTAR SUBTEMAS CON PROGRESO (Para el mapa del Front)
    // ------------------------------------------------------
    getTopics: this.trpc.protectedProcedure
      .input(z.object({ courseId: z.string() }))
      .query(async ({ ctx, input }) => {
        const userId = ctx.user.userId;

        // A. Validar que el curso exista
        const courseExists = await this.prisma.course.findUnique({ 
            where: { id: input.courseId } 
        });
        if (!courseExists) throw new TRPCError({ code: 'NOT_FOUND', message: 'Curso no encontrado' });

        // B. Traer los temas del curso
        const topics = await this.prisma.topic.findMany({
          where: { courseId: input.courseId },
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { questions: true } }, // Total de preguntas disponibles
          },
        });

        // C. Calcular Progreso "Dorado" 
        // Meta: 15 correctas para considerar el tema "Dominado" (3 Quizzes de 5)
        const GOAL_TO_GOLD = 15;

        const topicsWithProgress = await Promise.all(
            topics.map(async (topic) => {
                // Contamos respuestas correctas únicas del usuario en este tema
                const correctCount = await this.prisma.answerLog.count({
                    where: {
                        userId: userId,
                        isCorrect: true,
                        question: { topicId: topic.id }
                    }
                });

                return {
                    ...topic,
                    totalQuestions: topic._count.questions,
                    userProgress: {
                        correctCount,
                        goal: GOAL_TO_GOLD,
                        percentage: Math.min(100, Math.round((correctCount / GOAL_TO_GOLD) * 100)),
                        isGold: correctCount >= GOAL_TO_GOLD, // True = Pintar de Dorado
                        isCompleted: correctCount >= topic._count.questions // True = Ya no hay preguntas nuevas
                    }
                };
            })
        );

        return topicsWithProgress;
      }),

    // ------------------------------------------------------
    // 3. ENTREGAR PREGUNTAS (Motor de Examen Infinito )
    // ------------------------------------------------------
    getQuestions: this.trpc.protectedProcedure
      .input(
        z.object({
          topicId: z.string().optional(),
          difficulty: z.nativeEnum(Difficulty).optional(),
          limit: z.number().min(1).max(20).default(5),
          excludeAnswered: z.boolean().default(true), // True = Modo Infinito (No repetir)
        })
      )
      .query(async ({ ctx, input }) => {
        const { topicId, difficulty, limit, excludeAnswered } = input;
        const userId = ctx.user.userId;

        const conditions: Prisma.Sql[] = [];

        // Filtros básicos
        if (topicId) conditions.push(Prisma.sql`"topicId" = ${topicId}`);
        if (difficulty) conditions.push(Prisma.sql`"difficulty" = ${difficulty}::"Difficulty"`);

        // FILTRO CRÍTICO: Anti-Repetición
        if (excludeAnswered) {
            conditions.push(Prisma.sql`id NOT IN (
                SELECT "questionId" FROM "AnswerLog" WHERE "userId" = ${userId}
            )`);
        }

        const whereClause = conditions.length > 0 
            ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` 
            : Prisma.empty;

        // Query SQL Nativa para Aleatoriedad Real
        const randomIds = await this.prisma.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM "Question" 
            ${whereClause} 
            ORDER BY RANDOM() 
            LIMIT ${limit};
        `;

        if (randomIds.length === 0) return []; // Trofeo: Tema completado

        // Hidratar objetos con Prisma (Type-Safe)
        const questions = await this.prisma.question.findMany({
            where: { id: { in: randomIds.map((r) => r.id) } },
        });

        return questions.sort(() => Math.random() - 0.5); // Doble baraja
      }),
  });
}