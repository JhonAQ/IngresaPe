import { Flame, Hexagon, Zap } from 'lucide-react';
import { UserStats } from '../../types/dashboard';
import { StatBadge } from '@ingresa-pe/ui';

interface HeaderProps {
  stats: UserStats;
}

export function DashboardHeader({ stats }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-surface-border p-4 shadow-sm">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <h1 className="font-bold text-xl text-primary-950 tracking-tight">Biología</h1>
        <div className="flex bg-surface-50 p-1.5 rounded-full gap-2 border-2 border-surface-border">
          <StatBadge icon={Flame} value={stats.racha} variant="warning" />
          <StatBadge icon={Zap} value={stats.xp} variant="primary" />
          <StatBadge icon={Hexagon} value={stats.gemas} variant="info" />
        </div>
      </div>
    </header>
  );
}
