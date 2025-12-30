import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Interfaz para tipar las opciones de las preguntas
interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

@Injectable()
export class GameRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  router = this.trpc.router({
    // ------------------------------------------------------
    // ENVIAR RESPUESTA (El corazón del juego) 🎮
    // ------------------------------------------------------
    submitAnswer: this.trpc.protectedProcedure
      .input(
        z.object({
          questionId: z.string(),
          selectedOptionIndex: z.number().min(0), // El índice de la opción marcada (0, 1, 2...)
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.userId;

        // 1. Validaciones Previas (Energía y Existencia)
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

        // Regla: Si NO es premium y tiene 0 energía, no puede jugar
        if (!user.isPremium && user.energy <= 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '¡Sin energía! ⚡ Espera a que se recargue o hazte Premium.',
          });
        }

        const question = await this.prisma.question.findUnique({
          where: { id: input.questionId },
        });

        if (!question) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Pregunta no encontrada' });
        }

        // 2. Evaluar Respuesta
        // Asumimos que 'options' es un array JSON en la BD: [{ text: "...", isCorrect: true }, ...]
        const options = question.options as unknown as QuestionOption[];
        const selectedOption = options[input.selectedOptionIndex];

        if (!selectedOption) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Opción inválida' });
        }

        const isCorrect = selectedOption.isCorrect;

        // 3. Definir Recompensas y Costos
        const xpEarned = isCorrect ? 20 : 5;   // 20 XP si acierta, 5 XP de consuelo
        const energyCost = user.isPremium ? 0 : 1; // Gratis si es Premium, 1 si no

        // 4. TRANSACCIÓN ATÓMICA (Todo o nada) 🛡️
        // Esto asegura consistencia: No te cobro energía si no guardo el log.
        const result = await this.prisma.$transaction(async (tx) => {
          
          // A. Actualizar Usuario (XP y Energía)
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              energy: { decrement: energyCost },
              totalXp: { increment: xpEarned },
            },
          });

          // B. Guardar el Log (Esto activa el filtro "Anti-Repetición" para el futuro)
          await tx.answerLog.create({
            data: {
              userId,
              questionId: question.id,
              isCorrect,
              selectedOption: input.selectedOptionIndex,
            },
          });

          return {
            success: true,
            isCorrect,
            correctOptionIndex: options.findIndex((o: QuestionOption) => o.isCorrect), // Para mostrar cuál era la buena
            explanation: question.explanation, // Feedback educativo
            userStats: {
              energy: updatedUser.energy,
              xp: updatedUser.totalXp,
            },
          };
        });

        return result;
      }),
  });
}