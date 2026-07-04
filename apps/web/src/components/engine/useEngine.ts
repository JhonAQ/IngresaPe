'use client';

import { useState, useCallback, useEffect } from 'react';
import { trpc } from '../../utils/trpc';
import type { AnswerSubmission, QuestionDto } from '@ingresa-pe/domain';

export type EngineStatus = 'loading' | 'idle' | 'submitting' | 'feedback' | 'completed' | 'error';

export interface FeedbackState {
  isCorrect: boolean;
  correctAnswerText: string;
  explanation: string | null;
  rewards: { xp: number; coins: number } | null;
}

export interface UseEngineResult {
  status: EngineStatus;
  error: string | null;
  questions: QuestionDto[];
  currentIndex: number;
  currentQuestion: QuestionDto | null;
  progress: number;
  lives: number;
  answer: AnswerSubmission | null;
  feedback: FeedbackState | null;
  setAnswer: (answer: AnswerSubmission) => void;
  submit: () => void;
  continueNext: () => void;
  onClose: () => void;
}

export function useEngine(
  topicId: string,
  courseId: string | null,
  options: {
    nodeIndex?: number;
    nodeSize?: number;
    onClose?: () => void;
  } = {}
): UseEngineResult {
  const { nodeIndex: _nodeIndex = 0, nodeSize = 7, onClose } = options;
  void _nodeIndex; // reservado para futuras validaciones de nodo
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswerState] = useState<AnswerSubmission | null>(null);
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [lives, setLives] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
    error: questionsError,
  } = trpc.content.getQuestions.useQuery(
    { topicId, limit: nodeSize, excludeAnswered: true },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!topicId,
    }
  );

  useEffect(() => {
    if (status !== 'loading') return;
    if (isQuestionsError) {
      setStatus('error');
      setError(questionsError?.message ?? 'No se pudieron cargar las preguntas');
    } else if (!isQuestionsLoading) {
      setStatus('idle');
    }
  }, [isQuestionsLoading, isQuestionsError, questionsError, status]);

  const submitMutation = trpc.game.submitAnswer.useMutation({
    onSuccess: (result) => {
      const isCorrect = result.isCorrect;
      setFeedback({
        isCorrect,
        correctAnswerText: result.correctAnswerText,
        explanation: result.explanation,
        rewards: result.rewards ?? null,
      });
      if (!isCorrect) {
        setLives((prev) => Math.max(0, prev - 1));
      }
      setStatus('feedback');
      // Invalidar stats/progreso para reflejar cambios en dashboard.
      void utils.profile.getMe.invalidate();
      void utils.content.getTopics.invalidate();
      if (courseId) {
        void utils.content.getTopics.invalidate({ courseId });
      }
    },
    onError: (err) => {
      setStatus('error');
      setError(err.message ?? 'No se pudo enviar la respuesta');
    },
  });

  const currentQuestion = questions[currentIndex] ?? null;
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  const setAnswer = useCallback((next: AnswerSubmission) => {
    if (status === 'idle') {
      setAnswerState(next);
    }
  }, [status]);

  const submit = useCallback(() => {
    if (!currentQuestion || !answer || status !== 'idle') return;
    setStatus('submitting');
    submitMutation.mutate({
      questionId: currentQuestion.id,
      answer,
    });
  }, [currentQuestion, answer, status, submitMutation]);

  const continueNext = useCallback(() => {
    setAnswerState(null);
    setFeedback(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStatus('idle');
    } else {
      setStatus('completed');
    }
  }, [currentIndex, questions.length]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const derivedStatus: EngineStatus =
    status === 'loading' && !isQuestionsLoading && questions.length > 0
      ? 'idle'
      : status === 'loading' && isQuestionsError
      ? 'error'
      : status;

  return {
    status: derivedStatus,
    error,
    questions,
    currentIndex,
    currentQuestion,
    progress,
    lives,
    answer,
    feedback,
    setAnswer,
    submit,
    continueNext,
    onClose: handleClose,
  };
}
