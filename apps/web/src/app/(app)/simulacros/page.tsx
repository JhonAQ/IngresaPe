'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import {
  GoalCard,
  AIExamCard,
  HistoryArchive,
  RecentAttempts,
  CareerSelectorModal,
} from '../../../components/simulacros';
import { trpc } from '../../../utils/trpc';

export default function SimulacrosDashboardPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [numQuestions, setNumQuestions] = useState(40);
  const [timeLimit, setTimeLimit] = useState(60);
  const [startError, setStartError] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } = trpc.profile.getMe.useQuery();
  const { data: stats, isLoading: isStatsLoading } = trpc.simulacro.getStats.useQuery();
  const { data: archiveExams, isLoading: isArchiveLoading } =
    trpc.simulacro.getArchiveExams.useQuery();
  const { data: recentAttempts, isLoading: isAttemptsLoading } =
    trpc.simulacro.getRecentAttempts.useQuery();

  const startGenerated = trpc.simulacro.startGeneratedAttempt.useMutation({
    onSuccess: (data) => {
      setStartError(null);
      router.push(`/simulator?attemptId=${data.attemptId}`);
    },
    onError: (err) => {
      setStartError(err.message ?? 'No se pudo generar el simulacro');
    },
  });

  const startArchive = trpc.simulacro.startArchiveAttempt.useMutation({
    onSuccess: (data) => {
      setStartError(null);
      router.push(`/simulator?attemptId=${data.attemptId}`);
    },
    onError: (err) => {
      setStartError(err.message ?? 'No se pudo iniciar el examen');
    },
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const career = profile?.career;
  const currentScore = stats?.lastExamScore ?? 0;
  const targetScore = career?.minimumScore;

  const isLoading =
    isProfileLoading || isStatsLoading || isArchiveLoading || isAttemptsLoading;

  const handleStartGenerated = (params: { mode: 'AI' | 'RANDOM' }) => {
    setStartError(null);
    startGenerated.mutate({
      questionCount: numQuestions,
      timeLimitMinutes: timeLimit,
      strategy: params.mode,
    });
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto pt-6 pb-32 hide-scrollbar relative">
        <div className="px-5 mb-6 h-32 bg-slate-100 rounded-[1.8rem] animate-pulse" />
        <div className="px-5 mb-8 h-64 bg-slate-100 rounded-[2rem] animate-pulse" />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto pt-6 pb-32 hide-scrollbar relative">
      {!career ? (
        <div className="px-5 mb-6">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-[1.8rem] p-5 text-center">
            <h2 className="font-black text-amber-800 text-[18px] mb-1">
              Aún no tienes carrera
            </h2>
            <p className="text-amber-700 font-bold text-[13px] mb-4">
              Selecciona tu carrera para ver tu meta de admisión.
            </p>
            <p className="text-amber-600/70 text-[11px] font-bold">
              El selector aparecerá al continuar.
            </p>
          </div>
        </div>
      ) : (
        <GoalCard
          career={career.name}
          currentScore={currentScore}
          targetScore={targetScore}
          isLoaded={isLoaded}
        />
      )}

      {startError && (
        <div className="px-5 mb-4">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-[1.5rem] p-4 flex items-start gap-3">
            <AlertCircle className="shrink-0 text-rose-500 mt-0.5" size={18} strokeWidth={2.5} />
            <p className="text-rose-700 font-bold text-[13px] leading-snug">{startError}</p>
          </div>
        </div>
      )}

      <AIExamCard
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        timeLimit={timeLimit}
        setTimeLimit={setTimeLimit}
        isPremium={stats?.isPremium ?? false}
        freeAttemptsRemaining={stats?.freeAttemptsRemaining ?? 0}
        freeAttemptsLimit={stats?.freeAttemptsLimit ?? 1}
        freeAttemptsResetAt={stats?.freeAttemptsResetAt}
        isLoading={startGenerated.isPending}
        onStart={handleStartGenerated}
      />

      <HistoryArchive
        pastExams={archiveExams ?? []}
        isPremium={stats?.isPremium ?? false}
        onStartExam={(examId) => startArchive.mutate({ examId })}
        startingExamId={startArchive.variables?.examId}
      />

      <RecentAttempts attempts={recentAttempts ?? []} limit={2} showViewAll />

      <CareerSelectorModal
        isOpen={!career}
        onSelect={() => {
          // El invalidado de profile ocurre dentro del modal.
        }}
      />
    </main>
  );
}
