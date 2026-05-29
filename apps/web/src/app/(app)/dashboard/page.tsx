'use client';

import { useState } from 'react';
import { CourseProgress } from '../../../components/dashboard/CourseProgress';
import { TopicList } from '../../../components/dashboard/TopicList';
import { SummaryModal } from '../../../components/dashboard/SummaryModal';
import { useDashboardData } from '../../../hooks/useDashboardData';
import type { TemaData } from '@ingresa-pe/domain';

export default function DashboardPage() {
  const [resumenActivo, setResumenActivo] = useState<TemaData | null>(null);
  const { data, isLoading } = useDashboardData();

  if (isLoading || !data.temario) {
    return null; // Layout handles the loading state
  }

  return (
    <>
      <main className="flex-1 flex flex-col gap-2 overflow-y-auto px-5 pb-32 hide-scrollbar bg-slate-50/50">
        <div className="sticky top-0 z-40 pt-2 -mx-1 px-1">
          <CourseProgress />
        </div>

        <TopicList temario={data.temario} onOpenSummary={setResumenActivo} />
      </main>

      <SummaryModal
        resumenActivo={resumenActivo}
        onClose={() => setResumenActivo(null)}
      />
    </>
  );
}
