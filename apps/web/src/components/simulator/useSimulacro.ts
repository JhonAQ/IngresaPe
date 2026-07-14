'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { trpc } from '../../utils/trpc';
import type {
  ExamAttemptDetailDto,
  ExamResultDto,
  ExamSubmitResponseDto,
} from '@ingresa-pe/domain';

export type SimulacroStatus =
  | 'loading'
  | 'idle'
  | 'submitting'
  | 'completed'
  | 'locked'
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
  lockedMessage: string | null;
}

function toMs(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  return new Date(date).getTime();
}

export function useSimulacro(attemptId: string): UseSimulacroResult {
  const [status, setStatus] = useState<SimulacroStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SimulacroAnswer>>({});
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [result, setResult] = useState<ExamResultDto | null>(null);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const serverOffsetRef = useRef(0);

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
      serverOffsetRef.current = Date.now() - toMs(attempt.serverNow)!;

      if (attempt.status === 'COMPLETED') {
        if (attempt.isOfficial && !attempt.isRevealed) {
          setLockedMessage('Examen recibido. Calculando percentiles...');
          setStatus('locked');
        } else {
          setStatus('completed');
        }
      } else if (attempt.status === 'IN_PROGRESS') {
        setStatus('idle');
        const timerStartedAt = toMs(attempt.timerStartedAt);
        if (timerStartedAt != null) {
          const serverMs = Date.now() - serverOffsetRef.current;
          const elapsedSec = Math.max(0, serverMs - timerStartedAt) / 1000;
          setTimeRemaining(Math.max(0, attempt.serverTimeLimitSec - elapsedSec));
        } else {
          setTimeRemaining(attempt.timeLimitSeconds);
        }
      } else {
        setStatus('error');
        setError('El intento no está disponible');
      }
    } else if (isError) {
      setStatus('error');
      setError(queryError?.message ?? 'No se pudo cargar el examen');
    }
  }, [attempt, isError, queryError]);

  const submitMutation = trpc.simulacro.submit.useMutation({
    onSuccess: (data: ExamSubmitResponseDto) => {
      if (data.status === 'RECEIVED') {
        setLockedMessage(data.message);
        setStatus('locked');
      } else {
        setResult(data);
        setStatus('completed');
      }
    },
    onError: (err) => {
      setStatus('error');
      setError(err.message ?? 'No se pudo entregar el examen');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!attempt || (status !== 'idle' && status !== 'submitting')) return;
    setStatus('submitting');
    submitMutation.mutate({ attemptId, answers });
  }, [attempt, status, submitMutation, attemptId, answers]);

  // Temporizador global del examen sincronizado con el servidor.
  useEffect(() => {
    if (status !== 'idle' || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const timerStartedAt = toMs(attempt?.timerStartedAt);
        let next: number;
        if (timerStartedAt != null) {
          const serverMs = Date.now() - serverOffsetRef.current;
          const elapsedSec = Math.max(0, serverMs - timerStartedAt) / 1000;
          next = Math.max(0, (attempt?.serverTimeLimitSec ?? 0) - elapsedSec);
        } else {
          next = Math.max(0, prev - 1);
        }

        if (next <= 0) {
          clearInterval(interval);
          // Auto-submit al acabar el tiempo
          handleSubmit();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, timeRemaining, attempt, handleSubmit]);

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
    lockedMessage,
  };
}
