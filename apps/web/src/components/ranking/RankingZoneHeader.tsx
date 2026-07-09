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
  }
> = {
  promotion: {
    label: 'Zona de ascenso',
    className: 'text-emerald-600',
  },
  neutral: {
    label: 'Zona neutral',
    className: 'text-slate-500',
  },
  relegation: {
    label: 'Zona de descenso',
    className: 'text-rose-600',
  },
};

export const RankingZoneHeader: React.FC<RankingZoneHeaderProps> = ({ zone }) => {
  const config = zoneConfig[zone];
  return (
    <div className="flex justify-center py-0.5">
      <span
        className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${config.className}`}
      >
        {config.label}
      </span>
    </div>
  );
};
