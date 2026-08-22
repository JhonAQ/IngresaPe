'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import {
  AIExamCard,
  HistoryArchive,
  RecentAttempts,
  CareerSelectorModal,
  WeeklyRankingCard,
} from '../../../components/simulacros';
import { trpc } from '../../../utils/trpc';
import { SimulacrosSkeleton } from '../../../components/ui/skeleton';
import { usePremiumUpsell } from '../../../components/premium/PremiumUpsellContext';

export default function SimulacroDashboardPage() {
  const router = useRouter();
  const upsell = usePremiumUpsell();
  const [numQuestions, setNumQuestions] = useState(40);
  const [timeLimit, setTimeLimit] = useState(60);
  const [startError, setStartError] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } =
    trpc.profile.getMe.useQuery();
  const { data: stats, isLoading: isStatsLoading } =
    trpc.simulacro.getStats.useQuery();
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
      if (err.data?.code === 'FORBIDDEN' && err.message.includes('gratuito')) {
        upsell.triggerUpsell('SIMULACRO_LIMIT');
      } else {
        setStartError(err.message ?? 'No se pudo generar el simulacro');
      }
    },
  });

  const startArchive = trpc.simulacro.startArchiveAttempt.useMutation({
    onSuccess: (data) => {
      setStartError(null);
      router.push(`/simulator?attemptId=${data.attemptId}`);
    },
    onError: (err) => {
      if (err.data?.code === 'FORBIDDEN' && err.message.includes('premium')) {
        upsell.triggerUpsell('ARCHIVE_LOCKED');
      } else {
        setStartError(err.message ?? 'No se pudo iniciar el examen');
      }
    },
  });

  const career = profile?.career;
  const season = stats?.season;

  const isLoading =
    isProfileLoading || isStatsLoading || isArchiveLoading || isAttemptsLoading;

  const handleStartGenerated = (params: {
    mode: 'AI' | 'RANDOM';
    isOfficial?: boolean;
  }) => {
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
      {/* GoalCard and Career alerts removed for cleaner UI */}

      {season && (
        <WeeklyRankingCard
          season={season}
          onStartOfficial={handleStartOfficial}
          isStarting={startGenerated.isPending}
        />
      )}

      {startError && (
        <div className="px-5 mb-4">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-[1.5rem] p-4 flex items-start gap-3">
            <AlertCircle
              className="shrink-0 text-rose-500 mt-0.5"
              size={18}
              strokeWidth={2.5}
            />
            <p className="text-rose-700 font-bold text-[13px] leading-snug">
              {startError}
            </p>
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
