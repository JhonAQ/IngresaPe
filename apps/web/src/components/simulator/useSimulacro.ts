'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { trpc } from '../../utils/trpc';
import type { ExamAttemptDetailDto, ExamResultDto } from '@ingresa-pe/domain';

export type SimulacroStatus =
  | 'loading'
  | 'idle'
  | 'submitting'
  | 'completed'
  | 'error';

export interface SimulacroAnswer {
  selectedOptionId: string;
  timeTaken?: number;
}

export interface UseSimulacroResult {
  status: SimulacroStatus;
  error: string | null;
  attempt: ExamAttemptDetailDto | null;
  questions: ExamAttemptDetailDto['questions'];
  currentIndex: number;
  currentQuestion: ExamAttemptDetailDto['questions'][number] | null;
  answers: Record<string, SimulacroAnswer>;
  markedIds: string[];
  timeRemaining: number;
  progress: number;
  answeredCount: number;
  isFirst: boolean;
  isLast: boolean;
  setAnswer: (optionId: string) => void;
  toggleMark: () => void;
  goTo: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  submit: () => void;
  result: ExamResultDto | null;
}

export function useSimulacro(attemptId: string): UseSimulacroResult {
  const [status, setStatus] = useState<SimulacroStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SimulacroAnswer>>({});
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [result, setResult] = useState<ExamResultDto | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const {
    data: attempt,
    isError,
    error: queryError,
  } = trpc.simulacro.getById.useQuery(
    { attemptId },
    { enabled: !!attemptId, retry: false, refetchOnWindowFocus: false }
  );

  const questions = attempt?.questions ?? [];
  const currentQuestion = questions[currentIndex] ?? null;

  useEffect(() => {
    if (attempt) {
      if (attempt.status === 'COMPLETED') {
        setStatus('completed');
      } else {
        setStatus('idle');
        setTimeRemaining(attempt.timeLimitSeconds);
      }
    } else if (isError) {
      setStatus('error');
      setError(queryError?.message ?? 'No se pudo cargar el examen');
    }
  }, [attempt, isError, queryError]);

  // Temporizador global del examen
  useEffect(() => {
    if (status !== 'idle' || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-submit al acabar el tiempo
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, timeRemaining]);

  // Reiniciar cronómetro por pregunta al cambiar de índice
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.selectedOptionId).length,
    [answers]
  );

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return (answeredCount / questions.length) * 100;
  }, [answeredCount, questions.length]);

  const submitMutation = trpc.simulacro.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setStatus('completed');
    },
    onError: (err) => {
      setStatus('error');
      setError(err.message ?? 'No se pudo entregar el examen');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!attempt || status !== 'idle') return;
    setStatus('submitting');
    submitMutation.mutate({ attemptId, answers });
  }, [attempt, status, submitMutation, attemptId, answers]);

  const setAnswer = useCallback(
    (optionId: string) => {
      if (status !== 'idle' || !currentQuestion) return;

      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
      const nextAnswers: Record<string, SimulacroAnswer> = {
        ...answers,
        [currentQuestion.id]: { selectedOptionId: optionId, timeTaken },
      };
      setAnswers(nextAnswers);

      if (currentIndex < questions.length - 1) {
        setTimeout(() => setCurrentIndex((i) => i + 1), 250);
      }
    },
    [status, currentQuestion, answers, currentIndex, questions.length, questionStartTime]
  );

  const toggleMark = useCallback(() => {
    if (!currentQuestion) return;
    setMarkedIds((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  }, [currentQuestion]);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
      }
    },
    [questions.length]
  );

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  return {
    status,
    error,
    attempt: attempt ?? null,
    questions,
    currentIndex,
    currentQuestion,
    answers,
    markedIds,
    timeRemaining,
    progress,
    answeredCount,
    isFirst: currentIndex === 0,
    isLast: currentIndex === questions.length - 1,
    setAnswer,
    toggleMark,
    goTo,
    goNext,
    goPrev,
    submit: handleSubmit,
    result,
  };
}
