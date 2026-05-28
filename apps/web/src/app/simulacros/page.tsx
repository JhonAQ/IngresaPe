'use client';

import React, { useState, useEffect } from 'react';
import { 
  TopStatsBar, 
  GoalCard, 
  AIExamCard, 
  HistoryArchive, 
  RecentAttempts, 
  BottomNav 
} from '../../components/simulacros';

export default function SimulacrosDashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [numQuestions, setNumQuestions] = useState(40);
  const [timeLimit, setTimeLimit] = useState(60);

  const admissionGoal = {
    career: "Medicina Humana",
    currentScore: 58.4,
    targetScore: 82.5
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const pastExams = [
    { id: 101, title: 'Admisión 2024 - II', type: 'FASE II', questions: 80 },
    { id: 102, title: 'Admisión 2024 - I', type: 'FASE I', questions: 80 },
    { id: 103, title: 'Admisión 2023 - II', type: 'FASE II', questions: 80 },
    { id: 104, title: 'Admisión 2023 - I', type: 'FASE I', questions: 80 },
  ];

  const myAttempts = [
    { 
      id: 1, 
      title: "Simulacro General III", 
      date: "Ayer, 04:20 PM", 
      score: 62.5, 
      correct: 52, 
      incorrect: 28, 
      timeUsed: "108 min" 
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto relative bg-white h-[100dvh] flex flex-col overflow-hidden shadow-2xl border-x border-slate-100">
      <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none"></div>

      <TopStatsBar />

      <main className="flex-1 overflow-y-auto pt-6 pb-32 hide-scrollbar relative z-10">
        <GoalCard 
          career={admissionGoal.career} 
          currentScore={admissionGoal.currentScore} 
          targetScore={admissionGoal.targetScore}
          isLoaded={isLoaded}
        />

        <AIExamCard 
          numQuestions={numQuestions}
          setNumQuestions={setNumQuestions}
          timeLimit={timeLimit}
          setTimeLimit={setTimeLimit}
        />

        <HistoryArchive pastExams={pastExams} />

        <RecentAttempts attempts={myAttempts} />
      </main>

      <BottomNav />
    </div>
  );
}
