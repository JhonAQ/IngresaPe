'use client';

import React from 'react';
import { Settings, User, Crown } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  university: string;
  level: number;
  currentXp: number;
  xpToNext: number;
  isPro?: boolean;
}

export function ProfileHeader({ name, university, level, currentXp, xpToNext, isPro }: ProfileHeaderProps) {
  const xpPercent = Math.min((currentXp / xpToNext) * 100, 100);

  return (
    <div className="relative bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 pt-6 pb-12 px-5">
      {/* Settings button */}
      <button className="absolute top-5 right-5 w-9 h-9 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors active:scale-95 z-20">
        <Settings size={18} strokeWidth={2.5} />
      </button>

      {/* Avatar section */}
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          {/* Avatar circle */}
          <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-[3px] border-slate-500 flex items-center justify-center shadow-lg">
            <User size={44} className="text-slate-400" strokeWidth={1.5} />
          </div>
          
          {/* PRO Badge */}
          {isPro && (
            <div className="absolute -bottom-1 -left-1 bg-gradient-to-r from-amber-500 to-amber-400 text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border-2 border-slate-800">
              <Crown size={10} strokeWidth={3} className="fill-white" />
              PRO
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="text-white font-black text-[22px] tracking-tight leading-tight">{name}</h1>

        {/* University tag */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success-500" />
          <span className="text-success-400 font-bold text-[13px]">{university}</span>
        </div>

        {/* Level bar */}
        <div className="mt-4 w-full max-w-[240px]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="bg-amber-500/20 px-2.5 py-0.5 rounded-full">
              <span className="text-amber-400 font-black text-[11px] uppercase tracking-widest">Nivel {level}</span>
            </div>
            <span className="text-slate-400 font-bold text-[11px]">{currentXp} XP al Nivel {level + 1}</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700 relative"
              style={{ width: `${xpPercent}%` }}
            >
              <div className="absolute top-[2px] left-2 right-2 h-[3px] bg-white/25 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
