import { z } from 'zod';

export const QuestionType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE_SWIPE: 'TRUE_FALSE_SWIPE',
  FLASHCARD: 'FLASHCARD',
  ORDERING: 'ORDERING',
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

export const trueFalseContentSchema = z.object({
  type: z.literal(QuestionType.TRUE_FALSE_SWIPE),
  isTrue: z.boolean(),
  trueLabel: z.string().optional(),
  falseLabel: z.string().optional(),
});

export const flashcardContentSchema = z.object({
  type: z.literal(QuestionType.FLASHCARD),
  front: z.string(),
  back: z.string(),
});

export const orderingContentSchema = z.object({
  type: z.literal(QuestionType.ORDERING),
  items: z.array(z.object({ id: z.string(), text: z.string() })).min(2),
  correctOrder: z.array(z.string()),
});

export const questionContentSchema = z.union([
  multipleChoiceContentSchema,
  trueFalseContentSchema,
  flashcardContentSchema,
  orderingContentSchema,
]);
export type MultipleChoiceContent = z.infer<typeof multipleChoiceContentSchema>;
export type TrueFalseContent = z.infer<typeof trueFalseContentSchema>;
export type FlashcardContent = z.infer<typeof flashcardContentSchema>;
export type OrderingContent = z.infer<typeof orderingContentSchema>;
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
  trueLabel: z.string().optional(),
  falseLabel: z.string().optional(),
});

export const flashcardViewSchema = z.object({
  type: z.literal(QuestionType.FLASHCARD),
  front: z.string(),
});

export const orderingViewSchema = z.object({
  type: z.literal(QuestionType.ORDERING),
  items: z.array(z.object({ id: z.string(), text: z.string() })).min(2),
});

export const questionViewSchema = z.union([
  multipleChoiceViewSchema,
  trueFalseViewSchema,
  flashcardViewSchema,
  orderingViewSchema,
]);
export type MultipleChoiceView = z.infer<typeof multipleChoiceViewSchema>;
export type TrueFalseView = z.infer<typeof trueFalseViewSchema>;
export type FlashcardView = z.infer<typeof flashcardViewSchema>;
export type OrderingView = z.infer<typeof orderingViewSchema>;
export type QuestionView = z.infer<typeof questionViewSchema>;

// ============================================================================
// ANSWER submission schemas (sent from frontend)
// ============================================================================

export const multipleChoiceAnswerSchema = z.object({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  selectedOptionId: z.string(),
});

export const trueFalseAnswerSchema = z.object({
  type: z.literal(QuestionType.TRUE_FALSE_SWIPE),
  isTrue: z.boolean(),
});

export const flashcardAnswerSchema = z.object({
  type: z.literal(QuestionType.FLASHCARD),
  remembered: z.boolean(),
});

export const orderingAnswerSchema = z.object({
  type: z.literal(QuestionType.ORDERING),
  itemIds: z.array(z.string()),
});

export const answerSubmissionSchema = z.union([
  multipleChoiceAnswerSchema,
  trueFalseAnswerSchema,
  flashcardAnswerSchema,
  orderingAnswerSchema,
]);
export type MultipleChoiceAnswer = z.infer<typeof multipleChoiceAnswerSchema>;
export type TrueFalseAnswer = z.infer<typeof trueFalseAnswerSchema>;
export type FlashcardAnswer = z.infer<typeof flashcardAnswerSchema>;
export type OrderingAnswer = z.infer<typeof orderingAnswerSchema>;
export type AnswerSubmission = z.infer<typeof answerSubmissionSchema>;

// ============================================================================
// Result of grading a question
// ============================================================================

export interface GradeResult {
  isCorrect: boolean;
  correctAnswerText: string;
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
