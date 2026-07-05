'use client';

import React, { useState, useEffect } from 'react';
import {
  GoalCard,
  AIExamCard,
  HistoryArchive,
  RecentAttempts,
  CareerSelectorModal,
} from '../../../components/simulacros';
import { trpc } from '../../../utils/trpc';

export default function SimulacrosDashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [numQuestions, setNumQuestions] = useState(40);
  const [timeLimit, setTimeLimit] = useState(60);

  const { data: profile, isLoading: isProfileLoading } = trpc.profile.getMe.useQuery();
  const { data: stats, isLoading: isStatsLoading } = trpc.simulacro.getStats.useQuery();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const career = profile?.career;
  const currentScore = stats?.lastExamScore ?? 0;
  const targetScore = career?.minimumScore;

  const pastExams = [
    { id: 101, title: 'Admisión 2024 - II', type: 'FASE II', questions: 80 },
    { id: 102, title: 'Admisión 2024 - I', type: 'FASE I', questions: 80 },
    { id: 103, title: 'Admisión 2023 - II', type: 'FASE II', questions: 80 },
    { id: 104, title: 'Admisión 2023 - I', type: 'FASE I', questions: 80 },
  ];

  const myAttempts = [
    {
      id: 1,
      title: 'Simulacro General III',
      date: 'Ayer, 04:20 PM',
      score: 62.5,
      correct: 52,
      incorrect: 28,
      timeUsed: '108 min',
    },
  ];

  if (isProfileLoading || isStatsLoading) {
    return (
      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-32 hide-scrollbar relative">
        <div className="px-5 mb-6 h-32 bg-slate-100 rounded-[1.8rem] animate-pulse" />
        <div className="px-5 mb-8 h-64 bg-slate-100 rounded-[2rem] animate-pulse" />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-5 pt-6 pb-32 hide-scrollbar relative">
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

      <AIExamCard
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        timeLimit={timeLimit}
        setTimeLimit={setTimeLimit}
      />

      <HistoryArchive pastExams={pastExams} />

      <RecentAttempts attempts={myAttempts} />

      <CareerSelectorModal
        isOpen={!career}
        onSelect={() => {
          // El invalidado de profile ocurre dentro del modal.
        }}
      />
    </main>
  );
}
