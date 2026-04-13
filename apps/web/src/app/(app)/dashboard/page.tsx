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
      <div className="bg-white border-b-2 border-slate-200 shrink-0 z-40 relative flex flex-col pt-0">
        <DashboardHeader stats={data.stats} />
      </div>

      {/* Main Content Area */}
      <main
        className="flex-1 flex flex-col gap-6 overflow-y-auto px-5 pb-32 hide-scrollbar bg-slate-50 relative"
        style={{
          backgroundImage:
            'linear-gradient(to right, #e2e8f0 2px, transparent 2px), linear-gradient(to bottom, #e2e8f0 2px, transparent 2px)',
          backgroundSize: '40px 40px',
          backgroundPosition: 'left top',
        }}
      >
        {/* CourseProgress ahora viaja dentro del main para estar sobre el grid global y tiene sticky top */}
        <div className="sticky top-0 z-40 pt-4 -mx-1 px-1 pb-2">
          <CourseProgress />
        </div>

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
