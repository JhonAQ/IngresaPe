import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ProgressBar } from '@ingresa-pe/ui';
import { getCourseMeta } from '../../lib/courseMeta';

interface Course {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
}

interface CourseProgressListProps {
  courses: Course[];
  isLoading?: boolean;
}

function CourseCard({ course }: { course: Course }) {
  const meta = getCourseMeta(course.slug, course.name);
  const Icon = meta.icon;
  const progress = 0; // TODO: conectar con progreso real del backend

  return (
    <div className="flex items-center gap-3.5 bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] p-3 active:border-b-2 active:translate-y-[2px] transition-all">
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: meta.bgTint, color: meta.colorHex }}
      >
        <Icon size={24} strokeWidth={2.5} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-extrabold text-[15px] text-slate-700 truncate">
            {course.name}
          </h4>
          <span className="text-[12px] font-black text-slate-400 ml-2">
            {progress}%
          </span>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: meta.colorHex }}
        >
          {meta.areaLabel}
        </span>
        <div className="mt-1.5">
          <ProgressBar progress={progress} size="sm" indicatorColor="success" />
        </div>
      </div>

      {/* Arrow */}
      <div className="text-slate-300">
        <ChevronRight size={22} strokeWidth={3} />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3.5 bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] p-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function CourseProgressList({
  courses,
  isLoading,
}: CourseProgressListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-black text-[18px] text-slate-800">Tus cursos</h3>
        <button className="text-duo-blue text-[13px] font-black hover:opacity-80 transition-opacity">
          Ver todo
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : courses.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-2xl border-2 border-slate-200 border-b-[4px]">
            <p className="text-[14px] font-bold text-slate-400">
              No hay cursos disponibles
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    </div>
  );
}
