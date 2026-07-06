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
        } else if (content.type === QuestionType.MATCHING) {
          if (content.pairs.length < 2 || content.pairs.length > 6) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Las preguntas de matching deben tener entre 2 y 6 pares',
            });
          }
          const uniqueIds = new Set(content.pairs.map((p) => p.id));
          if (uniqueIds.size !== content.pairs.length) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Los ids de los pares de matching deben ser únicos',
            });
          }
          const allTextsFilled = content.pairs.every(
            (p) => p.left.trim().length > 0 && p.right.trim().length > 0
          );
          if (!allTextsFilled) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Las columnas izquierda y derecha no pueden estar vacías',
            });
          }
        } else if (content.type === QuestionType.TRUE_FALSE_SWIPE) {
          if (content.category) {
            const { left, right } = content.category;
            const categoryValid =
              left.label.trim().length > 0 &&
              left.color.trim().length > 0 &&
              left.darkColor.trim().length > 0 &&
              right.label.trim().length > 0 &&
              right.color.trim().length > 0 &&
              right.darkColor.trim().length > 0 &&
              (content.correctSide === 'left' || content.correctSide === 'right');
            if (!categoryValid) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'TRUE_FALSE_SWIPE arcade requiere categorías izquierda/derecha válidas y un lado correcto',
              });
            }
          } else if (typeof content.isTrue !== 'boolean') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'TRUE_FALSE_SWIPE debe tener isTrue (legacy) o category + correctSide (arcade)',
            });
          }
          } else if (content.type === QuestionType.FILL_IN_BLANK) {
            const slotCount = (content.sentence.match(/\[slot\]/g) ?? []).length;
            const bankIds = new Set(content.bank.map((w) => w.id));
            const hasDuplicates = bankIds.size !== content.bank.length;
            const correctInBank = content.correctWordIds.every((id) => bankIds.has(id));
            const correctUnique =
              new Set(content.correctWordIds).size === content.correctWordIds.length;

            if (
              slotCount < 1 ||
              slotCount !== content.correctWordIds.length ||
              !correctInBank ||
              !correctUnique ||
              hasDuplicates
            ) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message:
                  'FILL_IN_BLANK requiere al menos un [slot], correctWordIds que existan en el banco, sin duplicados, y coincidan con la cantidad de slots',
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