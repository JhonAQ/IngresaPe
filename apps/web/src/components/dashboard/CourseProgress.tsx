'use client';

import { ProgressBar } from '@ingresa-pe/ui';

interface CourseProgressProps {
  courseName: string;
  progress: number;
}

export function CourseProgress({ courseName, progress }: CourseProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          Progreso de {courseName}
        </span>
        <span className="text-[13px] font-black text-slate-700">
          {progress}%
        </span>
      </div>
      <ProgressBar progress={progress} indicatorColor="success" size="sm" />
    </div>
  );
}
