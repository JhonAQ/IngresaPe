import React from 'react';
import type { League } from '@ingresa-pe/domain';
import { leagueConfig } from '@ingresa-pe/domain';

interface LeagueBadgeProps {
  league: League;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'w-7 h-7 text-[14px]',
  md: 'w-10 h-10 text-[20px]',
  lg: 'w-14 h-14 text-[28px]',
};

export const LeagueBadge: React.FC<LeagueBadgeProps> = ({
  league,
  size = 'md',
  showLabel = false,
}) => {
  const config = leagueConfig[league];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center shrink-0 ${config.bg} border-2 ${config.border}`}
        style={{ boxShadow: `0 4px 0 0 ${config.color}` }}
      >
        <span>{config.emoji}</span>
      </div>
      {showLabel && (
        <span className={`font-black text-[14px] ${config.text}`}>{config.label}</span>
      )}
    </div>
  );
};
