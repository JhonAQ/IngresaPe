import React from 'react';
import { Shield, Flame, Zap, Hexagon } from 'lucide-react';

export const TopStatsBar = () => {
  return (
    <header className="bg-white/95 backdrop-blur-sm px-4 py-3 flex justify-between items-center border-b-2 border-slate-200 z-50 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#3b1c1c] border-2 border-amber-600 flex items-center justify-center text-white">
            <Shield size={16} className="fill-amber-500 text-amber-500"/>
        </div>
        <span className="font-black text-slate-800 text-[17px] tracking-tight">UNSA</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 font-black text-[14px] text-orange-500">
          <Flame size={18} className="fill-orange-500" /> 12
        </div>
        <div className="flex items-center gap-1 font-black text-[14px] text-yellow-400">
          <Zap size={18} className="fill-yellow-400" /> 2850
        </div>
        <div className="flex items-center gap-1 font-black text-[14px] text-sky-400">
          <Hexagon size={18} className="fill-sky-400" /> 450
        </div>
      </div>
    </header>
  );
};
