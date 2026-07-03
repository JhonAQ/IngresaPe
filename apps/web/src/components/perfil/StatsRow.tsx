import React from 'react';
import { FlameIcon, GemIcon, XpIcon } from '@ingresa-pe/ui';

interface StatsRowProps {
  streak?: number;
  totalXp?: number;
  coins?: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  colorClass: string;
}

function StatCard({ icon, value, label, colorClass }: StatCardProps) {
  const displayValue = value >= 10000 ? `${(value / 1000).toFixed(1)}k` : value;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] px-3 py-3 flex flex-col items-center justify-center active:border-b-2 active:translate-y-[2px] transition-all">
      <div className={`mb-1 ${colorClass}`}>{icon}</div>
      <span className="text-[17px] font-black text-slate-700 leading-none">
        {displayValue}
      </span>
      <span className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function StatsRow({ streak = 0, totalXp = 0, coins = 0 }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 -mt-8 relative z-20">
      <StatCard
        icon={<FlameIcon active={streak > 0} className="w-7 h-7" />}
        value={streak}
        label="Racha"
        colorClass="text-warning-500"
      />
      <StatCard
        icon={<XpIcon className="w-7 h-7" />}
        value={totalXp}
        label="XP total"
        colorClass="text-[#FFC800]"
      />
      <StatCard
        icon={<GemIcon className="w-7 h-7" />}
        value={coins}
        label="Monedas"
        colorClass="text-[#1CB0F6]"
      />
    </div>
  );
}
