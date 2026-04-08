'use client';

import { useState } from 'react';
import { DashboardHeader } from '../../../components/dashboard/Header';
import { CourseProgress } from '../../../components/dashboard/CourseProgress';
import { TopicList } from '../../../components/dashboard/TopicList';
import { SummaryModal } from '../../../components/dashboard/SummaryModal';
import { BottomNav } from '../../../components/dashboard/BottomNav';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { TemaData } from '../../../types/dashboard';

export default function DashboardPage() {
  const [resumenActivo, setResumenActivo] = useState<TemaData | null>(null);
  const { data, isLoading } = useDashboardData();

  if (isLoading || !data.stats || !data.temario) {
    return (
      <div className="w-full h-dvh flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-md mx-auto relative flex flex-col overflow-hidden font-sans"
      style={{ height: '100dvh' }}
    >
      {/* Top Section */}
      <div className="bg-white border-b-2 border-slate-200 shrink-0 z-40 relative flex flex-col">
        <DashboardHeader stats={data.stats} />
        <CourseProgress />
      </div>

      {/* Main Content Area */}
      <main
        className="flex-1 overflow-y-auto p-5 pb-32 hide-scrollbar bg-slate-50"
        style={{
          backgroundImage:
            'linear-gradient(to right, #e2e8f0 2px, transparent 2px), linear-gradient(to bottom, #e2e8f0 2px, transparent 2px)',
          backgroundSize: '40px 40px',
        }}
      >
        <TopicList temario={data.temario} onOpenSummary={setResumenActivo} />
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Floating Modal for Summaries */}
      <SummaryModal
        resumenActivo={resumenActivo}
        onClose={() => setResumenActivo(null)}
      />
    </div>
  );
}
