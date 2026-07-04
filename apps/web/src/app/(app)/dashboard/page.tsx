'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { CourseProgress } from '../../../components/dashboard/CourseProgress';
import { TopicList } from '../../../components/dashboard/TopicList';
import { SummaryModal } from '../../../components/dashboard/SummaryModal';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { trpc } from '../../../utils/trpc';
import type { TemaData } from '@ingresa-pe/domain';

function CourseSelector({
  courses,
  selectedCourseId,
  onSelect,
}: {
  courses: { id: string; name: string }[];
  selectedCourseId: string | null;
  onSelect: (courseId: string) => void;
}) {
  const selected = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="relative w-full">
      <select
        value={selectedCourseId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full appearance-none bg-white border-2 border-duo-border border-b-[4px] rounded-2xl px-4 py-3 font-black text-duo-dark pr-10 focus:outline-none focus:border-primary-500"
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-duo-dark">
        <ChevronDown size={20} strokeWidth={3} />
      </div>
      {selected && (
        <p className="mt-2 text-center font-bold text-surface-500 text-sm">
          {selected.name}
        </p>
      )}
    </div>
  );
}

function DashboardContent() {
  const [resumenActivo, setResumenActivo] = useState<TemaData | null>(null);
  const params = useSearchParams();
  const router = useRouter();
  const urlCourseId = params.get('courseId');

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useDashboardData();

  const { data: courses = [], isLoading: isCoursesLoading } =
    trpc.content.getCourses.useQuery(undefined, {
      retry: false,
      refetchOnWindowFocus: false,
    });

  const [courseId, setCourseId] = useState<string | null>(urlCourseId);

  // Sincroniza con URL y, si no hay, usa el primer curso disponible.
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

  return (
    <>
      <main className="flex-1 flex flex-col gap-2 overflow-y-auto px-5 pb-32 hide-scrollbar bg-slate-50/50">
        <div className="sticky top-0 z-40 pt-2 -mx-1 px-1 space-y-2">
          <CourseProgress />
          <CourseSelector
            courses={courses.map((c) => ({ id: c.id, name: c.name }))}
            selectedCourseId={courseId}
            onSelect={handleCourseChange}
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
