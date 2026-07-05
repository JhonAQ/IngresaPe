import { z } from 'zod';

// ============================================================================
// Carrera y meta de admisión
// ============================================================================

export const careerSchema = z.object({
  id: z.string(),
  name: z.string(),
  area: z.enum(['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS']),
  minimumScore: z.number().nullable().optional(),
});
export type CareerDto = z.infer<typeof careerSchema>;

export const simulacroStatsSchema = z.object({
  lastExamScore: z.number().nullable(),
  bestScore: z.number().nullable(),
  averageScore: z.number().nullable(),
  totalAttempts: z.number(),
  freeAttemptsUsed: z.number(),
  freeAttemptsLimit: z.number(),
  freeAttemptsRemaining: z.number(),
  freeAttemptsResetAt: z.date().nullable(),
  isPremium: z.boolean(),
});
export type SimulacroStatsDto = z.infer<typeof simulacroStatsSchema>;

// ============================================================================
// Archivo histórico de exámenes
// ============================================================================

export const examSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number(),
  phase: z.string().nullable(),
  type: z.string().nullable(),
  questionCount: z.number(),
  timeLimitMinutes: z.number(),
});
export type ExamSummaryDto = z.infer<typeof examSummarySchema>;

// Vista pública de una pregunta de examen (sin respuesta correcta)
export const examQuestionOptionViewSchema = z.object({
  id: z.string(),
  text: z.string(),
  imageUrl: z.string().nullable().optional(),
});

export const examQuestionViewSchema = z.object({
  id: z.string(),
  examId: z.string(),
  order: z.number(),
  statement: z.string(),
  passage: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  options: z.array(examQuestionOptionViewSchema).min(2).max(5),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  topicName: z.string(),
  courseName: z.string(),
});
export type ExamQuestionViewDto = z.infer<typeof examQuestionViewSchema>;

// ============================================================================
// Intentos de examen / simulacro
// ============================================================================

export const examAttemptSummarySchema = z.object({
  id: z.string(),
  examId: z.string().nullable(),
  examTitle: z.string().nullable(),
  mode: z.enum(['ARCHIVE', 'GENERATED']),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']),
  score: z.number().nullable(),
  correctCount: z.number().nullable(),
  incorrectCount: z.number().nullable(),
  blankCount: z.number().nullable(),
  questionCount: z.number(),
  timeLimitSeconds: z.number(),
  timeUsedSeconds: z.number().nullable(),
  startedAt: z.date(),
  submittedAt: z.date().nullable(),
});
export type ExamAttemptSummaryDto = z.infer<typeof examAttemptSummarySchema>;

export const examAttemptDetailSchema = examAttemptSummarySchema.extend({
  questions: z.array(examQuestionViewSchema),
});
export type ExamAttemptDetailDto = z.infer<typeof examAttemptDetailSchema>;

// Envío de respuesta de examen
export const examAnswerSubmissionSchema = z.record(
  z.string(),
  z.object({
    selectedOptionId: z.string(),
    timeTaken: z.number().optional(),
  })
);
export type ExamAnswerSubmission = z.infer<typeof examAnswerSubmissionSchema>;

// Resultado de entregar un simulacro
export const examResultSchema = z.object({
  attemptId: z.string(),
  score: z.number(),
  correctCount: z.number(),
  incorrectCount: z.number(),
  blankCount: z.number(),
  timeUsedSeconds: z.number(),
  xpEarned: z.number(),
  coinsEarned: z.number(),
});
export type ExamResultDto = z.infer<typeof examResultSchema>;
