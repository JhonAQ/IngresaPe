import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import {
  QuestionContent,
  questionContentSchema,
  AnswerSubmission,
  GradeResult,
  QuestionType,
  MultipleChoiceContent,
  MultipleChoiceAnswer,
  TrueFalseContent,
  TrueFalseAnswer,
  FlashcardContent,
  FlashcardAnswer,
  OrderingContent,
  OrderingAnswer,
  MatchingContent,
  MatchingAnswer,
  FillInBlankContent,
  FillInBlankAnswer,
} from '@ingresa-pe/domain';
import { Difficulty, Question } from '@prisma/client';

@Injectable()
export class QuestionGraderService {
  /**
   * Valida y califica una respuesta contra el contenido de una pregunta.
   * Lanza TRPCError si el tipo de respuesta no coincide con el de la pregunta
   * o si el contenido de la pregunta es inválido.
   */
  grade(question: Question, answer: AnswerSubmission): GradeResult {
    const content = this.parseContent(question);

    if (answer.type !== content.type) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Tipo de respuesta inválido: se esperaba ${content.type}, se recibió ${answer.type}`,
      });
    }

    switch (content.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return this.gradeMultipleChoice(
          content as MultipleChoiceContent,
          answer as MultipleChoiceAnswer
        );
      case QuestionType.TRUE_FALSE_SWIPE:
        return this.gradeTrueFalse(
          content as TrueFalseContent,
          answer as TrueFalseAnswer
        );
      case QuestionType.FLASHCARD:
        return this.gradeFlashcard(
          content as FlashcardContent,
          answer as FlashcardAnswer
        );
      case QuestionType.ORDERING:
        return this.gradeOrdering(
          content as OrderingContent,
          answer as OrderingAnswer
        );
      case QuestionType.MATCHING:
        return this.gradeMatching(
          content as MatchingContent,
          answer as MatchingAnswer
        );
      case QuestionType.FILL_IN_BLANK:
        return this.gradeFillInBlank(
          content as FillInBlankContent,
          answer as FillInBlankAnswer
        );
      default:
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tipo de pregunta no soportado',
        });
    }
  }

  /**
   * Calcula recompensas según dificultad y si acertó.
   * Usado tanto por GameService como por LearningRouter.
   */
  computeRewards(
    difficulty: Difficulty,
    isCorrect: boolean
  ): { coins: number } {
    if (!isCorrect) {
      return { coins: 0 };
    }

    switch (difficulty) {
      case 'EASY':
        return { coins: 5 };
      case 'MEDIUM':
        return { coins: 10 };
      case 'HARD':
        return { coins: 15 };
      default:
        return { coins: 10 };
    }
  }

  private parseContent(question: Question): QuestionContent {
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

    return parsed.data;
  }

  private gradeMultipleChoice(
    content: MultipleChoiceContent,
    answer: MultipleChoiceAnswer
  ): GradeResult {
    const correctOption = content.options.find((o) => o.isCorrect);
    const selectedOption = content.options.find((o) => o.id === answer.selectedOptionId);

    if (!selectedOption) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Opción seleccionada no existe',
      });
    }

    return {
      isCorrect: selectedOption.isCorrect,
      correctAnswerText: correctOption?.text ?? 'Respuesta correcta',
      explanation: null,
    };
  }

  private gradeTrueFalse(
    content: TrueFalseContent,
    answer: TrueFalseAnswer
  ): GradeResult {
    // Modo arcade: categorías laterales (Motor Swipe)
    if (content.category && content.correctSide) {
      const isCorrect = answer.side === content.correctSide;
      return {
        isCorrect,
        correctAnswerText: content.category[content.correctSide].label,
        explanation: null,
      };
    }

    // Modo legacy: isTrue
    if (typeof content.isTrue === 'boolean') {
      return {
        isCorrect: answer.isTrue === content.isTrue,
        correctAnswerText: content.isTrue
          ? content.trueLabel ?? 'Verdadero'
          : content.falseLabel ?? 'Falso',
        explanation: null,
      };
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Contenido TRUE_FALSE_SWIPE inválido',
    });
  }

  private gradeFlashcard(
    content: FlashcardContent,
    answer: FlashcardAnswer
  ): GradeResult {
    return {
      isCorrect: answer.remembered,
      correctAnswerText: content.back,
      explanation: null,
    };
  }

  private gradeOrdering(
    content: OrderingContent,
    answer: OrderingAnswer
  ): GradeResult {
    const isCorrect =
      answer.itemIds.length === content.correctOrder.length &&
      answer.itemIds.every((id, index) => id === content.correctOrder[index]);

    const correctText = content.items
      .slice()
      .sort((a, b) => content.correctOrder.indexOf(a.id) - content.correctOrder.indexOf(b.id))
      .map((i) => i.text)
      .join(' → ');

    return {
      isCorrect,
      correctAnswerText: correctText,
      correctOrder: content.correctOrder,
      explanation: null,
    };
  }

  private gradeMatching(
    content: MatchingContent,
    answer: MatchingAnswer
  ): GradeResult {
    const expectedIds = new Set(content.pairs.map((p) => p.id));
    const submittedIds = new Set(answer.matchedPairIds);

    const isCorrect =
      submittedIds.size === expectedIds.size &&
      content.pairs.every((p) => submittedIds.has(p.id));

    const correctAnswerText = content.pairs
      .map((p) => `${p.left} → ${p.right}`)
      .join(', ');

    return {
      isCorrect,
      correctAnswerText,
      explanation: null,
    };
  }

  private gradeFillInBlank(
    content: FillInBlankContent,
    answer: FillInBlankAnswer
  ): GradeResult {
    const bankById = new Map(content.bank.map((w) => [w.id, w]));
    const slotCount = (content.sentence.match(/\[slot\]/g) ?? []).length;
    const selected = answer.selectedWordIds;

    const isComplete =
      selected.length === slotCount &&
      new Set(selected).size === selected.length &&
      selected.every((id) => bankById.has(id));

    const isCorrect =
      isComplete &&
      content.correctWordIds.every((id, idx) => id === selected[idx]);

    let i = 0;
    const correctAnswerText = content.sentence.replace(/\[slot\]/g, () => {
      const id = content.correctWordIds[i++];
      return bankById.get(id)?.text ?? '___';
    });

    return {
      isCorrect,
      correctAnswerText,
      explanation: null,
    };
  }
}
