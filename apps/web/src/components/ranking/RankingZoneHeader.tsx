'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Zone = 'promotion' | 'neutral' | 'relegation';

interface RankingZoneHeaderProps {
  zone: Zone;
}

const zoneConfig: Record<
  Zone,
  {
    label: string;
    wrapperClass: string;
    icon: React.ReactNode;
  }
> = {
  promotion: {
    label: 'Zona de ascenso',
    wrapperClass: 'bg-green-200 border-green-400 text-green-900',
    icon: <TrendingUp size={15} className="text-green-700" />,
  },
  neutral: {
    label: 'Zona neutral',
    wrapperClass: 'bg-[#e5e5e5] border-black text-black',
    icon: <Minus size={15} className="text-slate-600" />,
  },
  relegation: {
    label: 'Zona de descenso',
    wrapperClass: 'bg-rose-200 border-rose-400 text-rose-900',
    icon: <TrendingDown size={15} className="text-rose-700" />,
  },
};

export const RankingZoneHeader: React.FC<RankingZoneHeaderProps> = ({ zone }) => {
  const config = zoneConfig[zone];
  return (
    <div
      className={`py-1.5 px-3 flex items-center justify-between text-[11px] sm:text-[12px] font-bold tracking-wider uppercase border-y-[1.5px] ${config.wrapperClass}`}
    >
      <span>{config.label}</span>
      <span className="flex items-center gap-1">{config.icon}</span>
    </div>
  );
};
