import { ChevronDown } from 'lucide-react';
import { ProgressBar, CourseIcon } from '@ingresa-pe/ui';

export function CourseProgress() {
  return (
    <button className="px-4 py-3 flex items-center justify-between bg-white transition-all w-full text-left rounded-2xl shadow-lg active:translate-y-[2px] active:shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3 w-full">
        {/* Aquí va el nuevo SVG original del libro 3D exportado */}
        <CourseIcon className="w-[36px] h-[36px] shrink-0" />
        <div className="flex flex-col items-start flex-1 pr-2 w-full">
          <span className="text-[10px] font-extrabold text-surface-400 uppercase tracking-widest leading-none mb-1">
            Curso Actual
          </span>
          <span className="text-lg font-black text-primary-950 leading-none mb-2">
            Biología Celular
          </span>
          <ProgressBar progress={35} variant="success" size="sm" />
        </div>
      </div>
      <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center border-2 border-surface-200 shrink-0 ml-2">
        <ChevronDown size={20} className="text-surface-500" strokeWidth={3} />
      </div>
    </button>
  );
}
