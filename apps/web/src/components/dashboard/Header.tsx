import { UserStats } from '../../types/dashboard';
import { StatBadge } from '@ingresa-pe/ui';

interface HeaderProps {
  stats: UserStats;
}

export function DashboardHeader({ stats }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-4 py-2 shrink-0">
      <div className="flex items-center justify-between">
        {/* University Selector */}
        <div className="flex items-center gap-2 py-1.5 shrink-0 select-none">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src="/logos/unsa.png"
              alt="UNSA"
              width={28}
              height={28}
              className="w-7 h-7 object-contain pointer-events-none"
            />
          </div>
          <span className="font-extrabold text-slate-500 tracking-tight text-[16px] uppercase">
            UNSA
          </span>
        </div>

        {/* Stats Panel */}
        <div className="flex items-center gap-1">
          <StatBadge value={stats.racha} type="streak" />
          <StatBadge value={stats.xp} type="xp" />
          <StatBadge value={stats.gemas} type="gem" />
        </div>
      </div>
    </header>
  );
}
