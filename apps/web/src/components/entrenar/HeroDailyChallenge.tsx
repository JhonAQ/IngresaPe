'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DuoTicket, ChunkyArcade } from './ArcadeIcons';

interface HeroDailyChallengeProps {
  tickets: number;
  onPlay: () => void;
}

export function HeroDailyChallenge({ tickets, onPlay }: HeroDailyChallengeProps) {
  return (
    <motion.div 
      whileTap={tickets > 0 ? { scale: 0.98 } : {}}
      className="w-full bg-[#ce82ff] rounded-[1.5rem] border-b-[8px] border-b-[#a568cc] p-6 pt-8 flex flex-col mb-10 relative cursor-pointer"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] pointer-events-none z-0">
         <div className="absolute inset-0 duo-sheen"></div>
      </div>
      
      <div className="absolute -top-3.5 left-6 z-20">
        <span className="inline-block font-black text-[#a568cc] bg-white text-[12px] uppercase tracking-widest px-4 py-1.5 rounded-full">
          ★ Evento Diario ★
        </span>
      </div>

      <div className="relative z-10 flex-1 pr-24 min-h-[90px]">
        <h3 className="font-black text-[26px] text-white leading-tight mb-2 drop-shadow-sm">
          Fiebre de Lectura
        </h3>
        <p className="font-bold text-white/90 text-[14px] leading-snug">
          Gana el TRIPLE de monedas superando retos de comprensión.
        </p>
      </div>

      <div className="absolute top-2 -right-4 w-36 h-36 rotate-[5deg] z-10 pointer-events-none">
        <ChunkyArcade />
      </div>

      <button 
        onClick={onPlay}
        disabled={tickets === 0}
        className={`mt-4 relative z-20 w-full font-black text-[16px] uppercase tracking-widest py-4 rounded-2xl border-b-[5px] active:border-b-0 active:translate-y-[5px] transition-all flex justify-center items-center gap-1.5
          ${tickets > 0 
            ? 'bg-white text-[#ce82ff] border-[#e5e5e5]' 
            : 'bg-[#e5e5e5] text-[#afafaf] border-[#cfcfcf] cursor-not-allowed'}`}
      >
        JUGAR 
        {tickets > 0 && (
          <div className="flex items-center gap-1 ml-1">
            <DuoTicket className="w-5 h-5"/>
            <span className="text-[#cc9f00] text-[15px] -mt-0.5">-1</span>
          </div>
        )}
      </button>
    </motion.div>
  );
}