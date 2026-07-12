'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Dna,
  Calculator,
  BookA,
  Zap,
  FlaskConical,
  BookOpen,
  History,
  PenTool,
} from 'lucide-react';
import { trpc } from '../../../utils/trpc';
import { CourseListSkeleton } from '../../../components/ui/skeleton';

type CourseStatus = 'completed' | 'available' | 'locked';

interface CourseView {
  id: string;
  name: string;
  area: string;
  progress: number;
  colorHex: string;
  bgTint: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }>;
  message: string;
  status: CourseStatus;
}

const coursePalette: Record<
  string,
  { color: string; bg: string; icon: typeof BookOpen }
> = {
  Biología: { color: '#58cc02', bg: '#f1fcdb', icon: Dna },
  'Álgebra': { color: '#1cb0f6', bg: '#ddf4ff', icon: Calculator },
  'Razonamiento Matemático': { color: '#ce82ff', bg: '#f8eaff', icon: PenTool },
  Geometría: { color: '#ff9600', bg: '#fff2e0', icon: PenTool },
  Física: { color: '#ff9600', bg: '#fff2e0', icon: Zap },
  Química: { color: '#afafaf', bg: '#f0f0f0', icon: FlaskConical },
  Literatura: { color: '#ff4b4b', bg: '#ffebeb', icon: BookA },
  'Historia del Perú': { color: '#1cb0f6', bg: '#ddf4ff', icon: History },
};

function getCourseStyle(name: string) {
  return coursePalette[name] ?? { color: '#1cb0f6', bg: '#ddf4ff', icon: BookOpen };
}

export default function CursosPage() {
  const router = useRouter();
  const { data: courses = [], isLoading } = trpc.content.getCourses.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const coursesData: CourseView[] = useMemo(() => {
    return courses.map((course) => {
      const style = getCourseStyle(course.name);
      return {
        id: course.id,
        name: course.name,
        area: 'Curso',
        progress: 0,
        colorHex: style.color,
        bgTint: style.bg,
        icon: style.icon,
        message: `¡Vamos a dominar ${course.name}!`,
        status: 'available' as CourseStatus,
      };
    });
  }, [courses]);

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const activeCourse =
    coursesData.find((c) => c.id === activeCourseId) ?? coursesData[0];

  if (isLoading) {
    return <CourseListSkeleton />;
  }

  if (coursesData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-black text-[22px] text-[#3c3c3c] mb-2">
            No hay cursos aún
          </h1>
          <p className="text-[#777777]">
            Vuelve más tarde cuando haya contenido disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
      <div className="flex-1 p-5 pb-bottom-nav">
        <h2 className="font-black text-[32px] leading-[1.15] mb-8 text-center tracking-tight">
          <span className="text-duo-dark">¿Qué quieres</span>
          <br />
          <span className="text-error-500">aprender hoy?</span>
        </h2>

        <div className="flex flex-col gap-6">
          {coursesData.map((course) => {
            const isSelected = activeCourse?.id === course.id;
            const isLocked = course.status === 'locked';
            const Icon = course.icon;

            return (
              <motion.div
                key={course.id}
                layout
                onClick={() => !isLocked && setActiveCourseId(course.id)}
                className={`w-full rounded-2xl border-2 border-duo-border border-b-[5px] flex flex-col overflow-hidden cursor-pointer transition-colors
                  ${isLocked ? 'opacity-60 grayscale-[0.5]' : 'bg-white'}`}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative w-full overflow-hidden"
                      style={{ backgroundColor: course.bgTint }}
                    >
                      <div className="pt-6 px-5 pb-2 relative min-h-[145px] flex items-start">
                        <div className="duo-bubble w-[75%] relative z-10">{course.message}</div>
                        <div className="absolute -bottom-3 -right-2 w-28 h-28 flex items-center justify-center rotate-[-5deg]">
                          <Icon
                            size={100}
                            color={course.colorHex}
                            strokeWidth={1.5}
                            className="drop-shadow-sm opacity-90"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={`p-5 bg-white relative z-20 ${
                    isSelected ? 'border-t-2 border-duo-border' : ''
                  }`}
                >
                  {course.progress === 100 && (
                    <div className="absolute inset-0 duo-sheen pointer-events-none rounded-b-xl z-0" />
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="font-black text-[22px] text-duo-dark leading-none">
                        {course.name}
                      </h3>
                      <span
                        className="font-extrabold text-[11px] uppercase tracking-widest"
                        style={{ color: isSelected ? course.colorHex : '#1cb0f6' }}
                      >
                        {course.area} • {isSelected ? 'SELECCIONADO' : 'ELEGIR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-[18px] flex-1 bg-duo-border rounded-full overflow-hidden relative">
                        {course.progress > 0 && (
                          <div
                            className="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 flex items-center justify-center"
                            style={{
                              width: `${course.progress}%`,
                              backgroundColor: course.colorHex,
                            }}
                          >
                            <div className="absolute top-[3px] left-2 right-2 h-[4px] bg-white/30 rounded-full" />
                            <span className="text-[11px] font-black text-black/30 mix-blend-color-burn tracking-widest mt-0.5">
                              {course.progress} %
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center justify-center w-8">
                        <Trophy
                          size={32}
                          color={course.progress === 100 ? course.colorHex : '#e5e5e5'}
                          fill={course.progress === 100 ? course.colorHex : 'none'}
                          strokeWidth={course.progress === 100 ? 1 : 2.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t-2 border-duo-border px-4 py-4 z-30">
        <button
          onClick={() => router.push(`/dashboard?courseId=${activeCourse?.id}`)}
          className="w-full text-white font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[5px] active:border-b-0 active:translate-y-[5px] transition-all flex justify-center items-center gap-2"
          style={{
            backgroundColor: activeCourse?.colorHex || '#1cb0f6',
            borderColor: 'rgba(0,0,0,0.15)',
          }}
        >
          CONTINUAR
        </button>
      </div>
    </main>
  );
}
