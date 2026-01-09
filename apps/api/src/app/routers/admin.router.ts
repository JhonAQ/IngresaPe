import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client'; // 👈 IMPORTANTE: Importar el Enum generado

// Esquema para crear pregunta
const createQuestionSchema = z.object({
  statement: z.string().min(5, 'El enunciado debe tener al menos 5 caracteres'),
  imageUrl: z.string().url().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  topicId: z.string().uuid('El topicId debe ser un UUID válido'),
  options: z.array(z.object({
    text: z.string(),
    isCorrect: z.boolean(),
  })).min(2, 'Debe haber al menos 2 opciones').max(5, 'Máximo 5 opciones'),
  explanation: z.string().optional(),
});

@Injectable()
export class AdminRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    createQuestion: this.trpc.protectedProcedure
      .input(createQuestionSchema)
      .mutation(async ({ ctx, input }) => {
        
        // 1. Verificar Rol usando el ENUM real
        if (ctx.user.role !== Role.ADMIN && ctx.user.role !== Role.DATA_ENTRY) {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'Requiere permisos de Administrador o Data Entry' 
          });
        }

        // 2. Validar que solo hay una opción correcta
        const correctOptions = input.options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Debe haber exactamente una opción correcta'
          });
        }

        // 3. Verificar que el topic existe
        const topic = await this.prisma.topic.findUnique({
          where: { id: input.topicId },
        });
        
        if (!topic) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'El tema especificado no existe'
          });
        }

        // 4. Crear la pregunta
        return await this.prisma.question.create({
          data: {
            statement: input.statement,
            imageUrl: input.imageUrl,
            difficulty: input.difficulty,
            topicId: input.topicId,
            options: input.options, // JSON directo
            explanation: input.explanation,
          },
          include: {
            topic: {
              include: {
                course: true,
              },
            },
          },
        });
      }),
  });
}