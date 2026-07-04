'use client';

import {
  Dna,
  Calculator,
  BookA,
  Zap,
  FlaskConical,
  BookOpen,
  History,
  PenTool,
  ChevronRight,
} from 'lucide-react';
import { ProgressBar } from '@ingresa-pe/ui';

const coursePalette: Record<
  string,
  { color: string; icon: typeof BookOpen }
> = {
  Biología: { color: '#58cc02', icon: Dna },
  'Álgebra': { color: '#1cb0f6', icon: Calculator },
  'Razonamiento Matemático': { color: '#ce82ff', icon: PenTool },
  Geometría: { color: '#ff9600', icon: PenTool },
  Física: { color: '#ff9600', icon: Zap },
  Química: { color: '#afafaf', icon: FlaskConical },
  Literatura: { color: '#ff4b4b', icon: BookA },
  'Historia del Perú': { color: '#1cb0f6', icon: History },
};

function getCourseStyle(name: string) {
  return coursePalette[name] ?? { color: '#1cb0f6', icon: BookOpen };
}

interface CourseProgressProps {
  courseName: string;
  progress: number;
  iconUrl?: string;
  onClick: () => void;
}

export function CourseProgress({ courseName, progress, iconUrl, onClick }: CourseProgressProps) {
  const style = getCourseStyle(courseName);
  const Icon = style.icon;

  return (
    <button
      onClick={onClick}
      className="relative w-full px-4 py-3 flex items-center justify-between bg-white transition-all text-left rounded-2xl shadow-lg active:translate-y-[2px] active:shadow-sm ring-1 ring-black/5"
    >
      <div className="flex items-center gap-3 w-full">
        <div
          className="w-[44px] h-[44px] rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{ backgroundColor: `${style.color}20` }}
        >
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={courseName}
              className="w-7 h-7 object-contain"
            />
          ) : (
            <Icon size={26} color={style.color} strokeWidth={2} />
          )}
        </div>
        <div className="flex flex-col items-start flex-1 pr-2 w-full">
          <span className="text-[10px] font-extrabold text-surface-400 uppercase tracking-widest leading-none mb-1">
            Curso Actual
          </span>
          <span className="text-lg font-black text-primary-950 leading-none mb-2">
            {courseName}
          </span>
          <ProgressBar
            progress={progress}
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
    </button>
  );
}
