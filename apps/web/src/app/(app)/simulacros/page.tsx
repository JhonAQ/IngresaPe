'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Trophy, Clock, Lock } from 'lucide-react';
import {
  GoalCard,
  AIExamCard,
  HistoryArchive,
  RecentAttempts,
  CareerSelectorModal,
} from '../../../components/simulacros';
import { trpc } from '../../../utils/trpc';
import { SimulacrosSkeleton } from '../../../components/ui/skeleton';

export default function SimulacroDashboardPage() {
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
  const currentScore = stats?.score ?? 0;
  const targetScore = career?.minimumScore;
  const season = stats?.season;

  const isLoading =
    isProfileLoading || isStatsLoading || isArchiveLoading || isAttemptsLoading;

  const handleStartGenerated = (params: { mode: 'AI' | 'RANDOM'; isOfficial?: boolean }) => {
    setStartError(null);
    startGenerated.mutate({
      questionCount: numQuestions,
      timeLimitMinutes: params.isOfficial ? 120 : timeLimit,
      strategy: params.mode,
      isOfficial: params.isOfficial ?? false,
    });
  };

  const handleStartOfficial = () => {
    setStartError(null);
    startGenerated.mutate({
      questionCount: 40,
      timeLimitMinutes: 120,
      strategy: 'AI',
      isOfficial: true,
    });
  };

  if (isLoading) {
    return <SimulacrosSkeleton />;
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

      {season && (
        <div className="px-5 mb-6">
          <div
            className={`rounded-[1.8rem] p-4 border-2 border-b-[6px] ${
              season.isRevealed
                ? 'bg-purple-50 border-purple-200 border-b-purple-300'
                : season.isEventOpen
                ? 'bg-green-50 border-green-200 border-b-green-300'
                : 'bg-slate-50 border-slate-200 border-b-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy
                  size={20}
                  className={
                    season.isRevealed
                      ? 'text-purple-500'
                      : season.isEventOpen
                      ? 'text-green-500'
                      : 'text-slate-400'
                  }
                />
                <span className="font-black text-[14px] text-slate-800">
                  {season.isRevealed
                    ? 'Resultados revelados'
                    : season.isEventOpen
                    ? 'Finde de ranking abierto'
                    : 'Finde de ranking cerrado'}
                </span>
              </div>
              <Clock size={16} className="text-slate-400" />
            </div>
            <p className="text-[12px] font-bold text-slate-500 mb-3">
              {season.isEventOpen
                ? 'Sábado y domingo puedes dar tu simulacro oficial de 2 horas.'
                : season.isRevealed
                ? 'Ya se calcularon los nuevos ratings y divisiones.'
                : 'El próximo fin de semana habrá un nuevo evento de ranking.'}
            </p>

            {season.isEventOpen && !season.hasOfficialAttempt && (
              <button
                onClick={handleStartOfficial}
                disabled={startGenerated.isPending}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-[14px] uppercase tracking-widest border-b-[5px] border-black active:border-b-0 active:translate-y-[5px] transition-all disabled:opacity-60"
              >
                {startGenerated.isPending ? 'Generando...' : 'INICIAR SIMULACRO OFICIAL'}
              </button>
            )}

            {season.isEventOpen && season.hasOfficialAttempt && (
              <div className="flex items-center gap-2 text-[12px] font-black text-slate-500 bg-white/60 rounded-xl p-3">
                <Lock size={14} />
                Ya iniciaste tu simulacro oficial este fin de semana.
              </div>
            )}
          </div>
        </div>
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
