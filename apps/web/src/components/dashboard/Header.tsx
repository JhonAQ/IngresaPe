import { ChevronDown } from 'lucide-react';
import { UserStats } from '@ingresa-pe/domain';
import { StatBadge } from '@ingresa-pe/ui';

interface SelectedCourse {
  id: string;
  name: string;
  iconUrl?: string;
}

interface HeaderProps {
  stats: UserStats;
  selectedCourse?: SelectedCourse | null;
  onOpenCourseSelector?: () => void;
}

const coursePalette: Record<string, string> = {
  Biología: '#58cc02',
  'Álgebra': '#1cb0f6',
  'Razonamiento Matemático': '#ce82ff',
  Geometría: '#ff9600',
  Física: '#ff9600',
  Química: '#afafaf',
  Literatura: '#ff4b4b',
  'Historia del Perú': '#1cb0f6',
};

function getCourseColor(name: string) {
  return coursePalette[name] ?? '#1cb0f6';
}

export function DashboardHeader({
  stats,
  selectedCourse,
  onOpenCourseSelector,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-4 py-2 shrink-0">
      <div className="flex items-center justify-between gap-3">
        {/* University brand + course selector */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src="/logos/unsa.png"
              alt="UNSA"
              width={28}
              height={28}
              className="w-7 h-7 object-contain pointer-events-none"
            />
          </div>

          {selectedCourse ? (
            <button
              onClick={onOpenCourseSelector}
              className="flex items-center gap-2 min-w-0 pl-1 pr-3 py-1 rounded-full bg-white border-b-[4px] border-slate-200 shadow-sm active:border-b-0 active:translate-y-[4px] transition-all"
              aria-label="Cambiar curso"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${getCourseColor(selectedCourse.name)}20` }}
              >
                {selectedCourse.iconUrl ? (
                  <img
                    src={selectedCourse.iconUrl}
                    alt=""
                    className="w-4 h-4 object-contain shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: getCourseColor(selectedCourse.name) }}
                  />
                )}
              </span>
              <span className="font-black text-slate-700 text-[14px] truncate max-w-[120px]">
                {selectedCourse.name}
              </span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" strokeWidth={3} />
            </button>
          ) : (
            <span className="font-extrabold text-slate-500 tracking-tight text-[16px] uppercase">
              UNSA
            </span>
          )}
        </div>

        {/* Stats Panel */}
        <div className="flex items-center gap-1 shrink-0">
          <StatBadge value={stats.racha} type="streak" />
          <StatBadge value={stats.xp} type="xp" />
          <StatBadge value={stats.gemas} type="gem" />
        </div>
      </div>
    </header>
  );
}
