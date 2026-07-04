'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CourseProgress } from '../../../components/dashboard/CourseProgress';
import { TopicList } from '../../../components/dashboard/TopicList';
import { SummaryModal } from '../../../components/dashboard/SummaryModal';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useCourseSelector } from '../../../components/dashboard/CourseSelectorContext';
import { CourseSelector } from '../../../components/dashboard/CourseSelector';
import { trpc } from '../../../utils/trpc';
import type { TemaData } from '@ingresa-pe/domain';

function DashboardContent() {
  const [resumenActivo, setResumenActivo] = useState<TemaData | null>(null);
  const params = useSearchParams();
  const router = useRouter();
  const urlCourseId = params.get('courseId');
  const { open } = useCourseSelector();

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useDashboardData();

  const { data: courses = [], isLoading: isCoursesLoading } =
    trpc.content.getCourses.useQuery(undefined, {
      retry: false,
      refetchOnWindowFocus: false,
    });

  const [courseId, setCourseId] = useState<string | null>(urlCourseId);

  useEffect(() => {
    if (urlCourseId) {
      setCourseId(urlCourseId);
      return;
    }
    if (!isCoursesLoading && courses.length > 0 && !courseId) {
      const first = courses[0].id;
      setCourseId(first);
      router.replace(`/dashboard?courseId=${first}`, { scroll: false });
    }
  }, [urlCourseId, courses, isCoursesLoading, courseId, router]);

  const {
    data: topics = [],
    isLoading: isTopicsLoading,
    isError: isTopicsError,
    error: topicsError,
  } = trpc.content.getTopics.useQuery(
    { courseId: courseId ?? '' },
    { enabled: !!courseId, retry: false, refetchOnWindowFocus: false }
  );

  const selectedCourse = courses.find((c) => c.id === courseId);

  const handleCourseChange = (nextCourseId: string) => {
    setCourseId(nextCourseId);
    router.replace(`/dashboard?courseId=${nextCourseId}`, { scroll: false });
  };

  if (isDashboardLoading || isCoursesLoading || (isTopicsLoading && !!courseId)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="font-black text-[#58cc02]">Cargando dashboard…</div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-black text-[22px] text-[#3c3c3c] mb-2">No hay cursos</h1>
          <p className="text-[#777777]">Vuelve más tarde cuando haya contenido disponible.</p>
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

  const progress = selectedCourse
    ? Math.round(
        (topics.filter(
          (t: any) => t.userProgress?.isGold || t.userProgress?.isCompleted
        ).length /
          (topics.length || 1)) *
          100
      )
    : 0;

  return (
    <>
      <CourseSelector
        selectedCourseId={courseId}
        onSelect={handleCourseChange}
      />

      <main className="flex-1 flex flex-col gap-2 overflow-y-auto px-5 pb-32 hide-scrollbar bg-slate-50/50">
        <div className="sticky top-0 z-40 pt-2 -mx-1 px-1 space-y-3">
          <CourseProgress
            courseName={selectedCourse?.name ?? 'Seleccionar curso'}
            progress={progress}
            onClick={open}
          />
        </div>

        <TopicList
          courseId={courseId ?? courses[0].id}
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
