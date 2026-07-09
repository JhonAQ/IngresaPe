'use client';

import React from 'react';

type Zone = 'promotion' | 'neutral' | 'relegation';

interface RankingZoneHeaderProps {
  zone: Zone;
}

const zoneConfig: Record<
  Zone,
  {
    label: string;
    className: string;
    dotClass: string;
  }
> = {
  promotion: {
    label: 'Zona de ascenso',
    className: 'text-emerald-600 bg-emerald-50',
    dotClass: 'bg-emerald-500',
  },
  neutral: {
    label: 'Zona neutral',
    className: 'text-slate-600 bg-slate-100',
    dotClass: 'bg-slate-400',
  },
  relegation: {
    label: 'Zona de descenso',
    className: 'text-rose-600 bg-rose-50',
    dotClass: 'bg-rose-500',
  },
};

export const RankingZoneHeader: React.FC<RankingZoneHeaderProps> = ({ zone }) => {
  const config = zoneConfig[zone];
  return (
    <div className="flex justify-center py-3">
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${config.className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        {config.label}
      </span>
    </div>
  );
};
