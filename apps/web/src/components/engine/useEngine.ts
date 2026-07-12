'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { trpc } from '../../utils/trpc';
import type { AnswerSubmission, QuestionDto } from '@ingresa-pe/domain';

export type EngineStatus = 'loading' | 'idle' | 'submitting' | 'feedback' | 'completed' | 'failed' | 'error';

export interface FeedbackState {
  isCorrect: boolean;
  correctAnswerText: string;
  correctOrder?: string[];
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
  correctCount: number;
  totalRewards: { xp: number; coins: number };
  durationSeconds: number;
  streakIncremented: boolean;
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
  const { nodeIndex = 0, nodeSize = 7, onClose } = options;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswerState] = useState<AnswerSubmission | null>(null);
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [lives, setLives] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalRewards, setTotalRewards] = useState({ xp: 0, coins: 0 });
  const [streakIncremented, setStreakIncremented] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const utils = trpc.useUtils();

  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
    error: questionsError,
  } = trpc.content.getQuestions.useQuery(
    { topicId, nodeIndex, limit: nodeSize, excludeAnswered: true },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!topicId,
    }
  );

  const completeNode = trpc.content.completeNode.useMutation({
    onSuccess: () => {
      void utils.profile.getMe.invalidate();
      void utils.content.getTopics.invalidate();
      if (courseId) {
        void utils.content.getTopics.invalidate({ courseId });
      }
    },
    onError: (err) => {
      // No bloqueamos la UI; solo registramos el error.
      console.error('Error completando nodo:', err.message);
    },
  });

  useEffect(() => {
    if (status !== 'loading' && startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'loading') return;
    if (isQuestionsError) {
      setStatus('error');
      setError(questionsError?.message ?? 'No se pudieron cargar las preguntas');
    } else if (!isQuestionsLoading) {
      if (questions.length === 0) {
        setStatus('completed');
      } else {
        setStatus('idle');
      }
    }
  }, [isQuestionsLoading, isQuestionsError, questionsError, questions.length, status]);

  const submitMutation = trpc.game.submitAnswer.useMutation({
    onSuccess: (result) => {
      const isCorrect = result.isCorrect;
      setFeedback({
        isCorrect,
        correctAnswerText: result.correctAnswerText,
        correctOrder: result.correctOrder,
        explanation: result.explanation,
        rewards: result.rewards ?? null,
      });
      if (!isCorrect) {
        setLives((prev) => Math.max(0, prev - 1));
      } else {
        setCorrectCount((prev) => prev + 1);
      }
      if (result.rewards) {
        setTotalRewards((prev) => ({
          xp: prev.xp + result.rewards.xp,
          coins: prev.coins + result.rewards.coins,
        }));
      }
      if (result.streakIncremented) {
        setStreakIncremented(true);
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

    // Si se agotaron las vidas del nodo, se marca como no pasado.
    if (lives <= 0) {
      setStatus('failed');
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStatus('idle');
    } else {
      setStatus('completed');
      if (topicId) {
        completeNode.mutate({ topicId, nodeIndex });
      }
    }
  }, [currentIndex, lives, questions.length, topicId, nodeIndex, completeNode]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const derivedStatus: EngineStatus =
    status === 'loading' && !isQuestionsLoading && questions.length > 0
      ? 'idle'
      : status === 'loading' && isQuestionsError
      ? 'error'
      : status;

  const durationSeconds =
    status === 'completed' && startTimeRef.current !== null
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

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
    correctCount,
    totalRewards,
    durationSeconds,
    streakIncremented,
    setAnswer,
    submit,
    continueNext,
    onClose: handleClose,
  };
}
