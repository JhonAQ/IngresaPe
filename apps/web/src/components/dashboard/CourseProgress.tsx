import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProgressBar, CourseIcon } from '@ingresa-pe/ui';
import { mockCourses, Course } from '../../data/dashboard-mock';

export function CourseProgress() {
  const [selectedCourse] = useState<Course>(mockCourses[0]);

  return (
    <div className="relative">
      <Link
        href="/cursos"
        className="px-4 py-3 flex items-center justify-between bg-white transition-all w-full text-left rounded-2xl shadow-lg active:translate-y-[2px] active:shadow-sm ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3 w-full">
          {/* Aquí va el nuevo SVG original del libro 3D exportado */}
          <CourseIcon className="w-[36px] h-[36px] shrink-0" />
          <div className="flex flex-col items-start flex-1 pr-2 w-full">
            <span className="text-[10px] font-extrabold text-surface-400 uppercase tracking-widest leading-none mb-1">
              Curso Actual
            </span>
            <span className="text-lg font-black text-primary-950 leading-none mb-2">
              {selectedCourse.title}
            </span>
            <ProgressBar
              progress={selectedCourse.progress}
              indicatorColor="success"
              size="sm"
            />
          </div>
        </div>
        <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center border-2 border-surface-200 shrink-0 ml-2">
          <ChevronRight
            size={20}
            className="text-surface-500 transition-transform duration-200"
            strokeWidth={3}
          />
        </div>
      </Link>
    </div>
  );
}
