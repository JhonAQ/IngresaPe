import { BookOpen, ChevronDown } from 'lucide-react';
import { ProgressBar } from '@ingresa-pe/ui';

export function CourseProgress() {
  return (
    <button className="px-4 py-3 flex items-center justify-between hover:bg-surface-50 transition-colors w-full text-left">
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center border-2 border-success-200 shrink-0">
          <BookOpen size={20} className="text-success-600" />
        </div>
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
