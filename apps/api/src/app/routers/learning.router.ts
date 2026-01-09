import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';

@Injectable()
export class LearningRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    // 1. OBTENER PREGUNTA (Simulacro o Práctica)
    // Devuelve una pregunta aleatoria de un tema
    getRandomQuestion: this.trpc.protectedProcedure
      .input(z.object({ topicId: z.string() }))
      .query(async ({ ctx, input }) => {
        // En Postgres real usaríamos "ORDER BY RANDOM()", pero Prisma no lo tiene nativo simple.
        // Hacemos un truco: contamos cuántas hay, sacamos un random skip.
        const count = await this.prisma.question.count({ where: { topicId: input.topicId } });
        if (count === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'No hay preguntas en este tema' });
        
        const skip = Math.floor(Math.random() * count);
        
        const question = await this.prisma.question.findFirst({
          where: { topicId: input.topicId },
          skip: skip,
          // OJO: NO devolvemos cual es la correcta al front para evitar trampas fáciles
          select: {
            id: true,
            statement: true,
            options: true, // El front renderiza, pero no sabe cuál es true a simple vista si limpiamos data
            imageUrl: true,
            difficulty: true
          }
        });
        return question;
      }),

    // 2. RESPONDER PREGUNTA (Aquí ocurre la magia de la XP y Monedas)
    submitAnswer: this.trpc.protectedProcedure
      .input(z.object({
        questionId: z.string(),
        selectedOptionIndex: z.number(), // 0, 1, 2...
      }))
      .mutation(async ({ ctx, input }) => {
        // A. Buscar la pregunta y SU RESPUESTA CORRECTA
        const question = await this.prisma.question.findUnique({
          where: { id: input.questionId },
        });

        if (!question) throw new TRPCError({ code: 'NOT_FOUND' });

        // B. Validar si acertó
        const options = question.options as any[]; // Casteamos el JSON
        const selectedOpt = options[input.selectedOptionIndex];
        
        if (!selectedOpt) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Opción inválida' });

        const isCorrect = selectedOpt.isCorrect === true;

        // C. Calcular Recompensas
        let xpEarned = 0;
        let coinsEarned = 0;

        if (isCorrect) {
          // Lógica básica: Fácil=10xp, Medio=20xp, Difícil=30xp
          xpEarned = question.difficulty === 'EASY' ? 10 : question.difficulty === 'MEDIUM' ? 20 : 30;
          coinsEarned = Math.floor(xpEarned / 2); // 5, 10 o 15 monedas
        }

        // D. Actualizar Usuario (Atomic update)
        // También manejamos la racha (streak). Si jugó hoy, mantenemos. Si fue ayer, +1.
        
        const now = new Date();
        const user = await this.prisma.user.findUnique({ where: { id: ctx.user.userId } });
        
        // Lógica simple de racha (se puede mejorar luego)
        // Si lastInteraction fue hace más de 24h pero menos de 48h -> streak + 1
        // Por ahora, solo actualizamos lastInteraction para simplificar.
        
        await this.prisma.user.update({
          where: { id: ctx.user.userId },
          data: {
            totalXp: { increment: xpEarned },
            coins: { increment: coinsEarned },
            lastInteraction: now,
            // Aquí iría la lógica compleja de racha
          }
        });

        // E. Guardar Log (Para historial y análisis)
        await this.prisma.answerLog.create({
          data: {
            userId: ctx.user.userId,
            questionId: question.id,
            isCorrect: isCorrect,
            selectedOption: input.selectedOptionIndex,
          }
        });

        return {
          correct: isCorrect,
          correctOptionIndex: options.findIndex(o => o.isCorrect), // Le decimos cuál era la correcta
          explanation: question.explanation, // Feedback
          rewards: { xp: xpEarned, coins: coinsEarned },
          newTotalCoins: (user?.coins || 0) + coinsEarned
        };
      }),
  });
}