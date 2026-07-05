'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CourseProgress } from '../../../components/dashboard/CourseProgress';
import { TopicList, TopicFromApi } from '../../../components/dashboard/TopicList';
import { TopicHeader } from '../../../components/dashboard/TopicHeader';
import { SummaryModal } from '../../../components/dashboard/SummaryModal';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { CourseSelector } from '../../../components/dashboard/CourseSelector';
import { useSetDashboardCourse } from '../../../components/dashboard/DashboardCourseContext';
import { trpc } from '../../../utils/trpc';
import type { TemaData } from '@ingresa-pe/domain';
import { DashboardSkeleton } from '../../../components/ui/skeleton';

function buildTemaData(topic: TopicFromApi, index: number): TemaData {
  return {
    id: Number(topic.id),
    tema: index + 1,
    titulo: topic.name,
    descripcion: topic.slug,
    variant: 'primary',
    actividades: [],
    resumenData: topic.summary ?? [],
    color: topic.userProgress?.isGold ? '#58cc02' : '#1cb0f6',
  };
}

function DashboardContent() {
  const [resumenActivo, setResumenActivo] = useState<TemaData | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
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
    {
      enabled: !!courseId,
      retry: false,
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      staleTime: 0,
    }
  );

  const typedTopics = topics as unknown as TopicFromApi[];

  useEffect(() => {
    if (typedTopics.length > 0 && !activeTopicId) {
      setActiveTopicId(typedTopics[0].id);
    }
  }, [typedTopics, activeTopicId]);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const setDashboardCourse = useSetDashboardCourse();

  useEffect(() => {
    if (selectedCourse) {
      setDashboardCourse({
        id: selectedCourse.id,
        name: selectedCourse.name,
        iconUrl: selectedCourse.iconUrl ?? undefined,
      });
    } else {
      setDashboardCourse(null);
    }
  }, [selectedCourse, setDashboardCourse]);

  const handleCourseChange = (nextCourseId: string) => {
    setCourseId(nextCourseId);
    setActiveTopicId(null);
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    router.replace(`/dashboard?courseId=${nextCourseId}`, { scroll: false });
  };

  if (isDashboardLoading || isCoursesLoading || (isTopicsLoading && !!courseId)) {
    return <DashboardSkeleton />;
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

  const totalNodes = typedTopics.reduce(
    (sum, t) => sum + (t.userProgress?.nodeCount ?? 1),
    0
  );
  const completedNodes = typedTopics.reduce(
    (sum, t) => sum + (t.userProgress?.completedNodes ?? 0),
    0
  );

  const progress = selectedCourse
    ? Math.round((completedNodes / Math.max(1, totalNodes)) * 100)
    : 0;

  const activeTopicIndex = typedTopics.findIndex((t) => t.id === activeTopicId);
  const activeTopic =
    activeTopicIndex >= 0 ? buildTemaData(typedTopics[activeTopicIndex], activeTopicIndex) : null;

  return (
    <>
      <CourseSelector
        selectedCourseId={courseId}
        onSelect={handleCourseChange}
      />

      <main
        ref={mainRef}
        className="flex-1 flex flex-col gap-2 overflow-y-auto px-5 pb-32 hide-scrollbar bg-slate-50/50"
      >
        <div id="course-progress-sticky" className="sticky top-0 z-40 -mx-5 px-5 pt-2 pb-2 bg-slate-50/95 backdrop-blur-sm space-y-2">
          <CourseProgress
            courseName={selectedCourse?.name ?? 'Seleccionar curso'}
            progress={progress}
          />

          {activeTopic && (
            <TopicHeader
              subtitle={`TEMA ${activeTopic.tema}`}
              title={activeTopic.titulo}
              onGuideClick={() => setResumenActivo(activeTopic)}
            />
          )}
        </div>

        <TopicList
          courseId={courseId ?? courses[0].id}
          topics={typedTopics}
          temario={dashboardData.temario ?? []}
          onOpenSummary={setResumenActivo}
          onActiveTopicChange={setActiveTopicId}
          scrollContainerRef={mainRef}
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
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
