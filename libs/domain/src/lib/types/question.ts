import { z } from 'zod';

export const QuestionType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE_SWIPE: 'TRUE_FALSE_SWIPE',
  FLASHCARD: 'FLASHCARD',
  ORDERING: 'ORDERING',
  MATCHING: 'MATCHING',
  FILL_IN_BLANK: 'FILL_IN_BLANK',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

// ============================================================================
// CONTENT schemas (used on backend / admin — include correct answers)
// ============================================================================

export const multipleChoiceContentSchema = z.object({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        isCorrect: z.boolean(),
      })
    )
    .min(2)
    .max(5),
});

export const swipeCategorySchema = z.object({
  label: z.string().min(1),
  color: z.string().min(1),
  darkColor: z.string().min(1),
});

export type SwipeCategory = z.infer<typeof swipeCategorySchema>;

/**
 * TRUE_FALSE_SWIPE soporta dos formatos:
 * - Legacy: { isTrue, trueLabel?, falseLabel? }
 * - Arcade (Motor Swipe): { category: { left, right }, correctSide, cardText? }
 */
export const trueFalseContentSchema = z
  .object({
    type: z.literal(QuestionType.TRUE_FALSE_SWIPE),
    // Legacy
    isTrue: z.boolean().optional(),
    trueLabel: z.string().optional(),
    falseLabel: z.string().optional(),
    // Arcade
    category: z.object({ left: swipeCategorySchema, right: swipeCategorySchema }).optional(),
    correctSide: z.enum(['left', 'right']).optional(),
    cardText: z.string().optional(),
  })
  .refine(
    (data) => {
      const isLegacy = typeof data.isTrue === 'boolean';
      const isModern = data.category !== undefined && data.correctSide !== undefined;
      return (isLegacy && !isModern) || (!isLegacy && isModern);
    },
    {
      message:
        'TRUE_FALSE_SWIPE debe usar o bien {isTrue} (legacy) o bien {category, correctSide} (arcade); no ambos ni faltar ambos.',
    }
  );

export const flashcardContentSchema = z.object({
  type: z.literal(QuestionType.FLASHCARD),
  front: z.string(),
  back: z.string(),
});

export const orderingContentSchema = z
  .object({
    type: z.literal(QuestionType.ORDERING),
    items: z.array(z.object({ id: z.string(), text: z.string() })).min(2),
    correctOrder: z.array(z.string()),
  })
  .refine(
    (data) => {
      const itemIds = data.items.map((i) => i.id);
      const hasAllIds = data.correctOrder.every((id) => itemIds.includes(id));
      const noDuplicates =
        new Set(data.correctOrder).size === data.correctOrder.length;
      return (
        hasAllIds &&
        noDuplicates &&
        data.correctOrder.length === itemIds.length
      );
    },
    {
      message:
        'El orden correcto debe contener todos los items sin duplicados',
    }
  );

export const matchingContentSchema = z
  .object({
    type: z.literal(QuestionType.MATCHING),
    pairs: z
      .array(
        z.object({
          id: z.string(),
          left: z.string().min(1),
          right: z.string().min(1),
        })
      )
      .min(2)
      .max(6),
  })
  .refine(
    (data) => new Set(data.pairs.map((p) => p.id)).size === data.pairs.length,
    {
      message: 'Los ids de los pares deben ser únicos',
    }
  );

export const wordBankItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});
export type WordBankItem = z.infer<typeof wordBankItemSchema>;

export const fillInBlankContentSchema = z
  .object({
    type: z.literal(QuestionType.FILL_IN_BLANK),
    sentence: z.string().min(1),
    bank: z.array(wordBankItemSchema).min(2),
    correctWordIds: z.array(z.string()).min(1),
  })
  .refine(
    (data) => {
      const slotCount = (data.sentence.match(/\[slot\]/g) ?? []).length;
      return slotCount >= 1 && slotCount === data.correctWordIds.length;
    },
    {
      message:
        'La cantidad de [slot] debe ser mayor a 0 y coincidir con correctWordIds',
    }
  )
  .refine(
    (data) => {
      const bankIds = new Set(data.bank.map((w) => w.id));
      return data.correctWordIds.every((id) => bankIds.has(id));
    },
    {
      message: 'Cada correctWordIds debe existir en el banco',
    }
  )
  .refine(
    (data) => new Set(data.bank.map((w) => w.id)).size === data.bank.length,
    {
      message: 'Los ids del banco deben ser únicos',
    }
  )
  .refine(
    (data) =>
      new Set(data.correctWordIds).size === data.correctWordIds.length,
    {
      message: 'Los correctWordIds deben ser únicos',
    }
  );

export const questionContentSchema = z.union([
  multipleChoiceContentSchema,
  trueFalseContentSchema,
  flashcardContentSchema,
  orderingContentSchema,
  matchingContentSchema,
  fillInBlankContentSchema,
]);
export type MultipleChoiceContent = z.infer<typeof multipleChoiceContentSchema>;
export type TrueFalseContent = z.infer<typeof trueFalseContentSchema>;
export type FlashcardContent = z.infer<typeof flashcardContentSchema>;
export type OrderingContent = z.infer<typeof orderingContentSchema>;
export type MatchingContent = z.infer<typeof matchingContentSchema>;
export type FillInBlankContent = z.infer<typeof fillInBlankContentSchema>;
export type QuestionContent = z.infer<typeof questionContentSchema>;

// ============================================================================
// VIEW schemas (sent to frontend — stripped of correct answers)
// ============================================================================

export const multipleChoiceViewSchema = z.object({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  options: z.array(z.object({ id: z.string(), text: z.string() })).min(2).max(5),
});

export const trueFalseViewSchema = z.object({
  type: z.literal(QuestionType.TRUE_FALSE_SWIPE),
  // Legacy
  trueLabel: z.string().optional(),
  falseLabel: z.string().optional(),
  // Arcade
  category: z.object({ left: swipeCategorySchema, right: swipeCategorySchema }).optional(),
  cardText: z.string().optional(),
});

export const flashcardViewSchema = z.object({
  type: z.literal(QuestionType.FLASHCARD),
  front: z.string(),
});

export const orderingViewSchema = z.object({
  type: z.literal(QuestionType.ORDERING),
  items: z.array(z.object({ id: z.string(), text: z.string() })).min(2),
  correctOrder: z.array(z.string()),
});

export const matchingViewSchema = z.object({
  type: z.literal(QuestionType.MATCHING),
  pairs: z
    .array(
      z.object({
        id: z.string(),
        left: z.string(),
        right: z.string(),
      })
    )
    .min(2)
    .max(6),
});

export const fillInBlankViewSchema = z.object({
  type: z.literal(QuestionType.FILL_IN_BLANK),
  sentence: z.string().min(1),
  bank: z.array(wordBankItemSchema).min(2),
});

export const questionViewSchema = z.union([
  multipleChoiceViewSchema,
  trueFalseViewSchema,
  flashcardViewSchema,
  orderingViewSchema,
  matchingViewSchema,
  fillInBlankViewSchema,
]);
export type MultipleChoiceView = z.infer<typeof multipleChoiceViewSchema>;
export type TrueFalseView = z.infer<typeof trueFalseViewSchema>;
export type FlashcardView = z.infer<typeof flashcardViewSchema>;
export type OrderingView = z.infer<typeof orderingViewSchema>;
export type MatchingView = z.infer<typeof matchingViewSchema>;
export type FillInBlankView = z.infer<typeof fillInBlankViewSchema>;
export type QuestionView = z.infer<typeof questionViewSchema>;

// ============================================================================
// ANSWER submission schemas (sent from frontend)
// ============================================================================

export const multipleChoiceAnswerSchema = z.object({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  selectedOptionId: z.string(),
});

export const trueFalseAnswerSchema = z
  .object({
    type: z.literal(QuestionType.TRUE_FALSE_SWIPE),
    // Legacy
    isTrue: z.boolean().optional(),
    // Arcade
    side: z.enum(['left', 'right']).optional(),
  })
  .refine(
    (data) => {
      const hasIsTrue = typeof data.isTrue === 'boolean';
      const hasSide = data.side !== undefined;
      return (hasIsTrue && !hasSide) || (!hasIsTrue && hasSide);
    },
    {
      message: 'Debe enviar isTrue (legacy) o side (arcade), no ambos ni ninguno.',
    }
  );

export const flashcardAnswerSchema = z.object({
  type: z.literal(QuestionType.FLASHCARD),
  remembered: z.boolean(),
});

export const orderingAnswerSchema = z.object({
  type: z.literal(QuestionType.ORDERING),
  itemIds: z.array(z.string()),
});

export const matchingAnswerSchema = z.object({
  type: z.literal(QuestionType.MATCHING),
  matchedPairIds: z.array(z.string()),
});

export const fillInBlankAnswerSchema = z
  .object({
    type: z.literal(QuestionType.FILL_IN_BLANK),
    selectedWordIds: z.array(z.string()).min(1),
  })
  .refine(
    (data) => new Set(data.selectedWordIds).size === data.selectedWordIds.length,
    {
      message: 'No se puede usar la misma palabra en dos slots',
    }
  );

export const answerSubmissionSchema = z.union([
  multipleChoiceAnswerSchema,
  trueFalseAnswerSchema,
  flashcardAnswerSchema,
  orderingAnswerSchema,
  matchingAnswerSchema,
  fillInBlankAnswerSchema,
]);
export type MultipleChoiceAnswer = z.infer<typeof multipleChoiceAnswerSchema>;
export type TrueFalseAnswer = z.infer<typeof trueFalseAnswerSchema>;
export type FlashcardAnswer = z.infer<typeof flashcardAnswerSchema>;
export type OrderingAnswer = z.infer<typeof orderingAnswerSchema>;
export type MatchingAnswer = z.infer<typeof matchingAnswerSchema>;
export type FillInBlankAnswer = z.infer<typeof fillInBlankAnswerSchema>;
export type AnswerSubmission = z.infer<typeof answerSubmissionSchema>;

// ============================================================================
// Result of grading a question
// ============================================================================

export interface GradeResult {
  isCorrect: boolean;
  correctAnswerText: string;
  correctOrder?: string[];
  explanation: string | null;
}

// ============================================================================
// Shared question DTO shape (frontend receives this from content.getQuestions)
// ============================================================================

export const questionDtoSchema = z.object({
  id: z.string(),
  statement: z.string(),
  imageUrl: z.string().nullable().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  type: z.nativeEnum(QuestionType),
  explanation: z.string().nullable().optional(),
  content: questionViewSchema,
});
export type QuestionDto = z.infer<typeof questionDtoSchema>;
