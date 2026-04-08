import { Flame, Hexagon, Zap } from 'lucide-react';
import { UserStats } from '../../types/dashboard';

interface HeaderProps {
  stats: UserStats;
}

export function DashboardHeader({ stats }: HeaderProps) {
  return (
    <div className="flex justify-between items-center px-6 py-3 border-b-2 border-slate-100 bg-white">
      <div className="flex items-center gap-1.5 text-orange-500 font-black text-lg">
        <Flame className="fill-orange-500" size={22} />{' '}
        <span>{stats.racha}</span>
      </div>
      <div className="flex items-center gap-1.5 text-yellow-400 font-black text-lg">
        <Zap className="fill-yellow-400" size={22} />{' '}
        <span className="text-yellow-500">{stats.xp}</span>
      </div>
      <div className="flex items-center gap-1.5 text-blue-500 font-black text-lg">
        <Hexagon className="fill-blue-500" size={22} />{' '}
        <span>{stats.gemas}</span>
      </div>
    </div>
  );
}
