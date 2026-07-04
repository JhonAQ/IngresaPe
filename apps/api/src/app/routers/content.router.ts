import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Difficulty, Prisma } from '@prisma/client';
import { QuestionViewService } from '../services/question-view.service';
import { parseSummaryBlocks } from '@ingresa-pe/domain';

@Injectable()
export class ContentRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService,
    private readonly viewService: QuestionViewService
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

        // C. Calcular Progreso por Nodos
        // - Cada nodo es una lección de ~7 preguntas (rango 6-10).
        // - Dorado: 15 correctas (dominio total del tema).
        // - Completado: el usuario terminó todos los nodos del tema.
        const GOAL_TO_GOLD = 15;
        const NODE_SIZE = 7;

        const topicsWithProgress = await Promise.all(
            topics.map(async (topic) => {
                // Total de respuestas dadas (aciertos o fallos)
                const attemptedCount = await this.prisma.answerLog.count({
                    where: {
                        userId: userId,
                        question: { topicId: topic.id }
                    }
                });

                // Respuestas correctas para el estado "dorado"
                const correctCount = await this.prisma.answerLog.count({
                    where: {
                        userId: userId,
                        isCorrect: true,
                        question: { topicId: topic.id }
                    }
                });

                const totalQuestions = topic._count.questions;
                const nodeCount = Math.max(1, Math.ceil(totalQuestions / NODE_SIZE));
                // El último nodo puede tener menos de NODE_SIZE preguntas; si ya se respondieron
                // todas las del tema, consideramos todos los nodos completados.
                const answeredAll = totalQuestions > 0 && attemptedCount >= totalQuestions;
                const completedNodes = answeredAll
                  ? nodeCount
                  : Math.min(nodeCount - 1, Math.floor(attemptedCount / NODE_SIZE));

                return {
                    ...topic,
                    summary: parseSummaryBlocks(topic.summary),
                    totalQuestions,
                    userProgress: {
                        attemptedCount,
                        correctCount,
                        nodeSize: NODE_SIZE,
                        nodeCount,
                        completedNodes,
                        goal: GOAL_TO_GOLD,
                        percentage: Math.min(100, Math.round((completedNodes / Math.max(1, nodeCount)) * 100)),
                        isGold: correctCount >= GOAL_TO_GOLD, // True = Pintar de Dorado
                        isCompleted: answeredAll // True = Ya no hay preguntas nuevas
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
          limit: z.number().min(1).max(20).default(5), // True = Modo Infinito (No repetir)
          excludeAnswered: z.boolean().default(true),
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

        const shuffled = questions.sort(() => Math.random() - 0.5); // Doble baraja

        return shuffled.map((q) => ({
            id: q.id,
            statement: q.statement,
            imageUrl: q.imageUrl,
            difficulty: q.difficulty,
            type: q.type,
            explanation: q.explanation,
            content: this.viewService.toView(q),
        }));
      }),
  });
}
