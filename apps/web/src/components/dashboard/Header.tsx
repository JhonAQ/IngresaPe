import { ChevronDown, Crown } from 'lucide-react';
import { UserStats } from '@ingresa-pe/domain';
import { StatBadge } from '@ingresa-pe/ui';
import { trpc } from '../../utils/trpc';
import { usePremiumUpsell } from '../premium/PremiumUpsellContext';

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
  const { data: profile } = trpc.profile.getMe.useQuery();
  const upsell = usePremiumUpsell();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-2.5 shrink-0">
      <div className="flex items-center justify-between gap-3">
        {/* University brand + course selector */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src="/logos/unsa.png"
              alt="UNSA"
              width={32}
              height={32}
              className="w-8 h-8 object-contain pointer-events-none"
            />
          </div>

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
          ) : (
            <span className="font-extrabold text-slate-500 tracking-tight text-[16px] uppercase">
              UNSA
            </span>
          )}
        </div>

        {/* Stats Panel */}
        <div className="flex items-center gap-3 shrink-0">
          {!profile?.isPremium ? (
            <button
              onClick={() => upsell.triggerUpsell('GENERIC')}
              className="relative p-[2px] rounded-[14px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_12px_rgba(34,211,238,0.4)] active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-1.5 bg-[#0a0f2c] rounded-xl px-2.5 py-1">
                <Crown size={14} className="text-cyan-400" strokeWidth={2.5} /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-black text-[11px] uppercase tracking-wider">SUPER</span>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-black text-[11px] px-2.5 py-1 rounded-xl shadow-sm cursor-default">
              <Crown size={14} className="fill-white" strokeWidth={2.5} /> SUPER
            </div>
          )}
          <StatBadge value={stats.racha} type="streak" />
          <StatBadge value={stats.gemas} type="gem" />
          <div onClick={() => !profile?.isPremium && upsell.triggerUpsell('ENERGY')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <StatBadge value={stats.vidas} type="energy" />
          </div>
        </div>
      </div>
    </header>
  );
}
