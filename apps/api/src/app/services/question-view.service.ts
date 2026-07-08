import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import {
  QuestionView,
  questionContentSchema,
  QuestionType,
} from '@ingresa-pe/domain';
import { Question } from '@prisma/client';

@Injectable()
export class QuestionViewService {
  /**
   * Convierte el contenido completo de una pregunta (incluyendo respuestas correctas)
   * en la vista segura que se envía al frontend.
   */
  toView(question: Question): QuestionView {
    if (!question.content) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'La pregunta no tiene contenido',
      });
    }

    const parsed = questionContentSchema.safeParse(question.content);

    if (!parsed.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Contenido de pregunta inválido',
        cause: parsed.error,
      });
    }

    const content = parsed.data;

    switch (content.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return {
          type: QuestionType.MULTIPLE_CHOICE,
          options: content.options.map((o) => ({ id: o.id, text: o.text })),
        };

      case QuestionType.TRUE_FALSE_SWIPE:
        if (content.category) {
          return {
            type: QuestionType.TRUE_FALSE_SWIPE,
            category: content.category,
            cardText: content.cardText,
          };
        }
        return {
          type: QuestionType.TRUE_FALSE_SWIPE,
          trueLabel: content.trueLabel,
          falseLabel: content.falseLabel,
        };

      case QuestionType.FLASHCARD:
        return {
          type: QuestionType.FLASHCARD,
          front: content.front,
        };

      case QuestionType.ORDERING:
        return {
          type: QuestionType.ORDERING,
          items: content.items,
          correctOrder: content.correctOrder,
        };

      case QuestionType.MATCHING:
        return {
          type: QuestionType.MATCHING,
          pairs: content.pairs,
        };

      case QuestionType.FILL_IN_BLANK:
        return {
          type: QuestionType.FILL_IN_BLANK,
          sentence: content.sentence,
          bank: content.bank,
        };

      default:
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Tipo de pregunta no soportado',
        });
    }
  }
}
