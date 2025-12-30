import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';

interface SubmitAnswerInput {
  userId: string;
  questionId: string;
  selectedOptionIndex: number;
}

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lógica central de validación y guardado de respuesta
   */
  async submitAnswer({ userId, questionId, selectedOptionIndex }: SubmitAnswerInput) {
    // 1. Validar Usuario y Energía
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuario no encontrado' });
    }

    if (!user.isPremium && user.energy <= 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '¡Sin energía! ⚡ Espera a que se recargue o hazte Premium.',
      });
    }

    // 2. Obtener Pregunta
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Pregunta no encontrada' });
    }

    // 3. Validar Opción
    const options = question.options as unknown as QuestionOption[];
    const selectedOption = options[selectedOptionIndex];

    if (!selectedOption) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Opción inválida' });
    }

    // 4. Calcular Resultado
    const isCorrect = selectedOption.isCorrect;
    const xpEarned = isCorrect ? 20 : 5;     // 20 XP si acierta, 5 XP consuelo
    const energyCost = user.isPremium ? 0 : 1; // Costo de energía

    // 5. Transacción Atómica: Guardar Intento y Actualizar User
    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar Stats del Usuario
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          energy: { decrement: energyCost },
          totalXp: { increment: xpEarned },
        },
      });

      // B. Guardar el Log (Historial)
      await tx.answerLog.create({
        data: {
          userId,
          questionId: question.id,
          isCorrect,
          selectedOption: selectedOptionIndex,
          // timeTaken: ... (Podríamos recibir esto del front en el futuro)
        },
      });

      // Retornamos el resultado procesado
      return {
        success: true,
        isCorrect,
        correctOptionIndex: options.findIndex((o) => o.isCorrect),
        explanation: question.explanation,
        userStats: {
          xp: updatedUser.totalXp,
          energy: updatedUser.energy,
        },
      };
    });
  }
}