import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Difficulty, Prisma, QuestionType } from '@prisma/client';
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

        // C. Traer completitud de nodos del usuario para estos temas
        const topicIds = topics.map((t) => t.id);
        const nodeCompletions = await this.prisma.userTopicNodeCompletion.findMany({
            where: { userId, topicId: { in: topicIds } },
            select: { topicId: true, nodeIndex: true },
        });

        const completionsByTopic = nodeCompletions.reduce<Record<string, number[]>>((acc, curr) => {
            if (!acc[curr.topicId]) acc[curr.topicId] = [];
            acc[curr.topicId].push(curr.nodeIndex);
            return acc;
        }, {});

        // D. Calcular Progreso por Nodos
        // - Cada nodo es una lección de ~nodeSize preguntas.
        // - Dorado: 15 correctas (dominio total del tema).
        // - Completado: el usuario terminó todos los nodos del tema.
        const GOAL_TO_GOLD = 15;

        const topicsWithProgress = await Promise.all(
            topics.map(async (topic) => {
                // Total de respuestas dadas (aciertos o fallos) — para stats y verificación dorada
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

                const completedNodeIndexes = completionsByTopic[topic.id] ?? [];
                const completedNodes = completedNodeIndexes.length;
                const nodeCount = topic.nodeCount;
                const nodeSize = topic.nodeSize;
                const totalQuestions = topic._count.questions;

                return {
                    ...topic,
                    summary: parseSummaryBlocks(topic.summary),
                    totalQuestions,
                    userProgress: {
                        attemptedCount,
                        correctCount,
                        nodeSize,
                        nodeCount,
                        completedNodes,
                        goal: GOAL_TO_GOLD,
                        percentage: Math.min(100, Math.round((completedNodes / Math.max(1, nodeCount)) * 100)),
                        isGold: correctCount >= GOAL_TO_GOLD, // True = Pintar de Dorado
                        isCompleted: completedNodes >= nodeCount // True = Ya no hay nodos pendientes
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
          nodeIndex: z.number().int().min(0).optional(),
          difficulty: z.nativeEnum(Difficulty).optional(),
          limit: z.number().min(1).max(20).default(7),
          excludeAnswered: z.boolean().default(true),
        })
      )
      .query(async ({ ctx, input }) => {
        const { topicId, nodeIndex, difficulty, limit, excludeAnswered } = input;
        const userId = ctx.user.userId;

        // Modo nodo: selección determinística de preguntas del tema.
        if (topicId && typeof nodeIndex === 'number') {
          const topic = await this.prisma.topic.findUnique({
            where: { id: topicId },
            select: { nodeSize: true, nodeCount: true },
          });
          if (!topic) throw new TRPCError({ code: 'NOT_FOUND', message: 'Tema no encontrado' });
          if (nodeIndex >= topic.nodeCount) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nodo inválido' });

          const deliveredIds = await this.getNodeDeliveredQuestionIds(
            topicId,
            nodeIndex,
            userId
          );

          if (deliveredIds.length === 0) return [];

          const questions = await this.prisma.question.findMany({
            where: { id: { in: deliveredIds.slice(0, limit) } },
          });

          const shuffled = questions.sort(() => Math.random() - 0.5);

          return shuffled.map((q) => ({
            id: q.id,
            statement: q.statement,
            imageUrl: q.imageUrl,
            difficulty: q.difficulty,
            type: q.type,
            explanation: q.explanation,
            content: this.viewService.toView(q),
          }));
        }

        // Modo libre/aleatorio (fallback para otros callers).
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

    // ------------------------------------------------------
    // 4. COMPLETAR NODO
    // ------------------------------------------------------
    completeNode: this.trpc.protectedProcedure
      .input(
        z.object({
          topicId: z.string(),
          nodeIndex: z.number().int().min(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { topicId, nodeIndex } = input;
        const userId = ctx.user.userId;

        const deliveredIds = await this.getNodeDeliveredQuestionIds(
          topicId,
          nodeIndex,
          userId
        );

        if (deliveredIds.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nodo sin preguntas' });
        }

        const answeredCount = await this.prisma.answerLog.count({
          where: { userId, questionId: { in: deliveredIds } },
        });

        if (answeredCount < deliveredIds.length) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Aún faltan preguntas por responder en este nodo' });
        }

        await this.prisma.userTopicNodeCompletion.upsert({
          where: { userId_topicId_nodeIndex: { userId, topicId, nodeIndex } },
          update: {},
          create: { userId, topicId, nodeIndex },
        });

        return { success: true, completedNodeIndex: nodeIndex };
      }),
  });

  private async getNodeDeliveredQuestionIds(
    topicId: string,
    nodeIndex: number,
    userId: string
  ): Promise<string[]> {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      select: { nodeSize: true, nodeCount: true },
    });
    if (!topic) throw new TRPCError({ code: 'NOT_FOUND', message: 'Tema no encontrado' });
    if (nodeIndex >= topic.nodeCount) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Nodo inválido' });

    const allQuestionIds = await this.prisma.question.findMany({
      where: { topicId },
      orderBy: { id: 'asc' },
      select: { id: true },
    });

    const start = nodeIndex * topic.nodeSize;
    const end = Math.min(start + topic.nodeSize, allQuestionIds.length);
    const deliveredIds = allQuestionIds.slice(start, end).map((q) => q.id);

    if (deliveredIds.length === 0) return [];

    // Garantizar al menos una pregunta MATCHING por nodo cuando haya disponibles.
    await this.ensureTypePresent(
      deliveredIds,
      topicId,
      QuestionType.MATCHING
    );

    // Garantizar al menos una pregunta TRUE_FALSE_SWIPE por nodo cuando haya disponibles.
    await this.ensureTypePresent(
      deliveredIds,
      topicId,
      QuestionType.TRUE_FALSE_SWIPE,
      [QuestionType.MATCHING]
    );

    return deliveredIds;
  }

  /**
   * Garantiza la presencia de un tipo de pregunta en el nodo. El candidato se elige
   * de forma determinista (primer id no presente, ordenado por id) para que
   * `getQuestions` y `completeNode` vean exactamente el mismo conjunto aunque el
   * usuario ya haya respondido algunas preguntas.
   */
  private async ensureTypePresent(
    deliveredIds: string[],
    topicId: string,
    type: QuestionType,
    protectedTypes: QuestionType[] = []
  ): Promise<void> {
    const hasType = await this.prisma.question.count({
      where: { id: { in: deliveredIds }, type },
    });
    if (hasType > 0) return;

    // Búsqueda determinista: NO filtrar por respuestas del usuario. Si el
    // candidato ya fue respondido, seguirá formando parte del nodo y contará
    // como respondido al completar, evitando el error de "faltan preguntas".
    const candidate = await this.prisma.question.findFirst({
      where: {
        topicId,
        type,
        id: { notIn: deliveredIds },
      },
      orderBy: { id: 'asc' },
      select: { id: true },
    });

    if (!candidate) return;

    const currentQuestions = await this.prisma.question.findMany({
      where: { id: { in: deliveredIds } },
      select: { id: true, type: true },
    });
    const typeById = new Map(currentQuestions.map((q) => [q.id, q.type]));

    let replaceIndex = -1;
    for (let i = deliveredIds.length - 1; i >= 0; i--) {
      const currentType = typeById.get(deliveredIds[i]);
      if (
        currentType &&
        currentType !== type &&
        !protectedTypes.includes(currentType)
      ) {
        replaceIndex = i;
        break;
      }
    }

    if (replaceIndex === -1) {
      replaceIndex = deliveredIds.length - 1;
    }

    deliveredIds[replaceIndex] = candidate.id;
  }
}
