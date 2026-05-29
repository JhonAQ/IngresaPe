import React from 'react';
import { Flame, Star, Gem } from 'lucide-react';

interface StatsRowProps {
  racha: number;
  expTotal: number;
  liga: string;
}

export function StatsRow({ racha, expTotal, liga }: StatsRowProps) {
  const formatExp = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const stats = [
    {
      icon: <Flame size={26} className="text-orange-500 fill-orange-500" strokeWidth={2} />,
      value: String(racha),
      label: 'RACHA',
    },
    {
      icon: <Star size={26} className="text-amber-400 fill-amber-400" strokeWidth={2} />,
      value: formatExp(expTotal),
      label: 'EXP TOTAL',
    },
    {
      icon: <Gem size={26} className="text-blue-500 fill-blue-500/20" strokeWidth={2} />,
      value: liga,
      label: 'LIGA',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 p-4 flex flex-col items-center gap-2 shadow-sm"
        >
          {stat.icon}
          <span className="font-black text-[20px] text-slate-800 leading-none">{stat.value}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
