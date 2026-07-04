import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { questionContentSchema, QuestionType, QuestionContent } from '@ingresa-pe/domain';

const createQuestionSchema = z.object({
  statement: z.string().min(5, 'El enunciado debe tener al menos 5 caracteres'),
  imageUrl: z.string().url().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  topicId: z.string().uuid('El topicId debe ser un UUID válido'),
  type: z.nativeEnum(QuestionType),
  content: z.any(),
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
        if (ctx.user.role !== Role.ADMIN && ctx.user.role !== Role.DATA_ENTRY) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Requiere permisos de Administrador o Data Entry'
          });
        }

        const contentParse = questionContentSchema.safeParse(input.content);
        if (!contentParse.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'El contenido de la pregunta no es válido',
          });
        }
        const content = contentParse.data as QuestionContent;

        if (content.type === QuestionType.MULTIPLE_CHOICE) {
          const correctCount = content.options.filter((o) => o.isCorrect).length;
          if (correctCount !== 1) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Debe haber exactamente una opción correcta',
            });
          }
        } else if (content.type === QuestionType.ORDERING) {
          const itemIds = content.items.map((i) => i.id);
          const hasAllIds = content.correctOrder.every((id) => itemIds.includes(id));
          const noDuplicates = new Set(content.correctOrder).size === content.correctOrder.length;
          if (!hasAllIds || !noDuplicates || content.correctOrder.length !== itemIds.length) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'El orden correcto debe contener todos los items sin duplicados',
            });
          }
        }

        const topic = await this.prisma.topic.findUnique({
          where: { id: input.topicId },
        });

        if (!topic) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'El tema especificado no existe'
          });
        }

        return await this.prisma.question.create({
          data: {
            statement: input.statement,
            imageUrl: input.imageUrl,
            difficulty: input.difficulty,
            topicId: input.topicId,
            type: input.type,
            content: content as any,
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