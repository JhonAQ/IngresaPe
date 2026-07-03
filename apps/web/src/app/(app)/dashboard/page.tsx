'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourseProgress } from '../../../components/dashboard/CourseProgress';
import { TopicList } from '../../../components/dashboard/TopicList';
import { SummaryModal } from '../../../components/dashboard/SummaryModal';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { trpc } from '../../../utils/trpc';
import type { TemaData } from '@ingresa-pe/domain';

function DashboardContent() {
  const [resumenActivo, setResumenActivo] = useState<TemaData | null>(null);
  const params = useSearchParams();
  const courseId = params.get('courseId');

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useDashboardData();

  const {
    data: topics = [],
    isLoading: isTopicsLoading,
    isError: isTopicsError,
    error: topicsError,
  } = trpc.content.getTopics.useQuery(
    { courseId: courseId ?? '' },
    { enabled: !!courseId, retry: false, refetchOnWindowFocus: false }
  );

  if (isDashboardLoading || isTopicsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="font-black text-[#58cc02]">Cargando dashboard…</div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-black text-[22px] text-[#3c3c3c] mb-2">Selecciona un curso</h1>
          <p className="text-[#777777] mb-6">
            Elige un curso desde la pantalla de cursos para ver sus temas.
          </p>
        </div>
      </div>
    );
  }

  if (isTopicsError) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-black text-[22px] text-[#ea2b2b] mb-2">Ups</h1>
          <p className="text-[#777777]">{topicsError?.message ?? 'No se pudieron cargar los temas'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 flex flex-col gap-2 overflow-y-auto px-5 pb-32 hide-scrollbar bg-slate-50/50">
        <div className="sticky top-0 z-40 pt-2 -mx-1 px-1">
          <CourseProgress />
        </div>

        <TopicList
          courseId={courseId}
          topics={topics}
          temario={dashboardData.temario ?? []}
          onOpenSummary={setResumenActivo}
        />
      </main>

      <SummaryModal
        resumenActivo={resumenActivo}
        onClose={() => setResumenActivo(null)}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="font-black text-[#58cc02]">Cargando dashboard…</div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
