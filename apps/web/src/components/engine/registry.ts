import type { ComponentType } from 'react';
import {
  QuestionType,
  type QuestionView,
  type AnswerSubmission,
  type MultipleChoiceView,
  type MultipleChoiceAnswer,
  type TrueFalseView,
  type TrueFalseAnswer,
  type FlashcardView,
  type FlashcardAnswer,
  type OrderingView,
  type OrderingAnswer,
  type MatchingView,
  type MatchingAnswer,
} from '@ingresa-pe/domain';
import { MultipleChoiceRenderer } from './renderers/MultipleChoiceRenderer';
import { TrueFalseSwipeRenderer } from './renderers/TrueFalseSwipeRenderer';
import { FlashcardRenderer } from './renderers/FlashcardRenderer';
import { OrderingRenderer } from './renderers/OrderingRenderer';
import { MatchingRenderer } from './renderers/MatchingRenderer';
import type { FeedbackState } from './useEngine';

/**
 * Contracto que debe cumplir cada renderer de pregunta.
 * Es genérico sobre la vista y la respuesta del tipo concreto.
 */
export interface RendererProps<
  TView extends QuestionView = QuestionView,
  TAnswer extends AnswerSubmission = AnswerSubmission
> {
  view: TView;
  answer: TAnswer | null;
  status: 'idle' | 'submitting' | 'feedback';
  feedback: FeedbackState | null;
  onAnswer: (answer: TAnswer) => void;
}

/**
 * Cada renderer se registra con el tipo de QuestionType que soporta.
 * TypeScript infiere el view/answer correctos gracias a la unión discriminada.
 */
type RendererMap = {
  [QuestionType.MULTIPLE_CHOICE]: ComponentType<RendererProps<MultipleChoiceView, MultipleChoiceAnswer>>;
  [QuestionType.TRUE_FALSE_SWIPE]: ComponentType<RendererProps<TrueFalseView, TrueFalseAnswer>>;
  [QuestionType.FLASHCARD]: ComponentType<RendererProps<FlashcardView, FlashcardAnswer>>;
  [QuestionType.ORDERING]: ComponentType<RendererProps<OrderingView, OrderingAnswer>>;
  [QuestionType.MATCHING]: ComponentType<RendererProps<MatchingView, MatchingAnswer>>;
};

export const questionRendererRegistry: RendererMap = {
  [QuestionType.MULTIPLE_CHOICE]: MultipleChoiceRenderer,
  [QuestionType.TRUE_FALSE_SWIPE]: TrueFalseSwipeRenderer,
  [QuestionType.FLASHCARD]: FlashcardRenderer,
  [QuestionType.ORDERING]: OrderingRenderer,
  [QuestionType.MATCHING]: MatchingRenderer,
};

/**
 * Helper para obtener el renderer de un tipo de pregunta.
 * Si no existe, lanza un error claro para facilitar la extensión.
 */
export function getQuestionRenderer(type: QuestionType) {
  const renderer = questionRendererRegistry[type];
  if (!renderer) {
    throw new Error(`No hay renderer registrado para el tipo de pregunta: ${type}`);
  }
  return renderer;
}
