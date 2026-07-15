'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RankingUserDto } from '@ingresa-pe/domain';
import { leagueConfig } from '@ingresa-pe/domain';

interface RankingTableRowProps {
  user: RankingUserDto;
  index: number;
  showDelta?: boolean;
  targetRef?: React.Ref<HTMLDivElement>;
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function DeltaPill({ delta }: { delta: number | null | undefined }) {
  if (delta === null || delta === undefined || delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-slate-400 text-[10px] font-bold">
        <Minus size={10} /> 0
      </span>
    );
  }
  const isPositive = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-black ${
        isPositive ? 'text-emerald-600' : 'text-rose-500'
      }`}
    >
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isPositive ? '+' : ''}
      {delta}
    </span>
  );
}

export const RankingTableRow: React.FC<RankingTableRowProps> = ({
  user,
  index,
  showDelta = false,
  targetRef,
}) => {
  const divisionCfg = leagueConfig[user.division];

  return (
    <motion.div
      ref={targetRef}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`relative flex py-[6px] items-center border-b border-slate-200 last:border-0 text-[11px] sm:text-[12px]
        ${
          user.isMe
            ? 'font-black before:absolute before:inset-y-[2px] before:inset-x-0 before:bg-[#fde047]/70 before:-rotate-[0.3deg] before:scale-y-105 before:-z-10 before:shadow-[0_0_4px_rgba(253,224,71,0.8)]'
            : 'font-medium hover:bg-slate-50'
        }`}
    >
      <div className="w-[12%] text-center text-slate-800">{user.rank}</div>

      <div className="w-[20%] text-center text-[10px] sm:text-[11px] uppercase tracking-wider">
        <span style={{ color: divisionCfg.hex }}>{divisionCfg.label}</span>
      </div>

      <div className="flex-1 pl-3 flex items-center gap-1.5 truncate text-slate-800">
        <span className="truncate">{user.name ?? 'Anónimo'}</span>
        {user.isMe && (
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 shrink-0">
            Tú
          </span>
        )}
      </div>

      <div
        className={`text-right pr-2 text-[11px] sm:text-[12px] text-slate-900 ${
          showDelta ? 'w-[16%]' : 'w-[22%]'
        }`}
      >
        {formatScore(user.score)}
      </div>

      {showDelta && (
        <div className="w-[14%] text-right pr-2">
          <DeltaPill delta={user.delta} />
        </div>
      )}
    </motion.div>
  );
};
