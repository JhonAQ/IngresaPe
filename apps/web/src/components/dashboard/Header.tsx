import { ChevronDown } from 'lucide-react';
import { UserStats } from '@ingresa-pe/domain';
import { StatBadge } from '@ingresa-pe/ui';

interface SelectedCourse {
  id: string;
  name: string;
}

interface HeaderProps {
  stats: UserStats;
  selectedCourse?: SelectedCourse | null;
  onOpenCourseSelector?: () => void;
}

export function DashboardHeader({
  stats,
  selectedCourse,
  onOpenCourseSelector,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-2.5 shrink-0">
      <div className="flex items-center justify-between gap-3">
        {/* Brand + course selector */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/logo-horizontal.png"
            alt="Ingresa.pe"
            className="h-6 w-auto shrink-0 object-contain"
          />

          {selectedCourse ? (
            <button
              onClick={onOpenCourseSelector}
              className="flex items-center gap-1 min-w-0 px-2 py-1 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors"
              aria-label="Cambiar curso"
            >
              <span className="font-black text-slate-700 text-[16px] truncate max-w-[130px]">
                {selectedCourse.name}
              </span>
              <ChevronDown size={16} className="text-slate-400 shrink-0" strokeWidth={3} />
            </button>
          ) : null}
        </div>

        {/* Stats Panel */}
        <div className="flex items-center gap-5 shrink-0">
          <StatBadge value={stats.racha} type="streak" />
          <StatBadge value={stats.gemas} type="gem" />
          <StatBadge value={stats.vidas} type="energy" />
        </div>
      </div>
    </header>
  );
}
