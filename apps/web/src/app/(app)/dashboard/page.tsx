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

function CoursePill({
  name,
  progress,
  color,
  onClick,
}: {
  name: string;
  progress: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border-2 border-duo-border border-b-[4px] rounded-2xl p-4 active:border-b-0 active:translate-y-[4px] transition-all"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-black text-[16px] text-duo-dark">{name}</span>
        <span className="font-bold text-[13px]" style={{ color }}>{progress}%</span>
      </div>
      <div className="h-[10px] bg-duo-border rounded-full overflow-hidden relative">
        <div
          className="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </button>
  );
}

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

  const courseColor = selectedCourse?.name
    ? ({
        Biología: '#58cc02',
        'Álgebra': '#1cb0f6',
        'Razonamiento Matemático': '#ce82ff',
        Geometría: '#ff9600',
        Física: '#ff9600',
        Química: '#afafaf',
        Literatura: '#ff4b4b',
        'Historia del Perú': '#1cb0f6',
      }[selectedCourse.name] ?? '#1cb0f6')
    : '#1cb0f6';

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
          <CourseProgress />
          <CoursePill
            name={selectedCourse?.name ?? 'Seleccionar curso'}
            progress={progress}
            color={courseColor}
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
