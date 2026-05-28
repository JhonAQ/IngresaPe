'use client';

import React from 'react';
import { Flame, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { DuoTicket } from './ArcadeIcons';

interface HeaderTicketsProps {
  tickets: number;
}

export function HeaderTickets({ tickets }: HeaderTicketsProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b-2 border-[#e5e5e5] sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
        <div className="w-8 h-6 rounded border-2 border-[#e5e5e5] bg-blue-500 overflow-hidden relative shadow-sm">
           <div className="absolute top-0 bottom-0 left-1/3 right-1/3 bg-white"></div>
        </div>
        <span className="font-extrabold text-[#afafaf] text-[15px]">16</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 font-extrabold text-[#afafaf]">
          <Flame size={24} className="text-[#e5e5e5] fill-[#e5e5e5]" strokeWidth={2} /> 29
        </div>
        <div className="flex items-center gap-1 font-extrabold text-[#1cb0f6]">
          <Hexagon size={24} className="text-[#1cb0f6] fill-[#1cb0f6]" strokeWidth={2} /> 715
        </div>
        <motion.div 
          key={tickets}
          initial={{ scale: 1.3, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          className="flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform"
        >
          <DuoTicket className="w-7 h-7 drop-shadow-sm" />
          <span className="font-black text-[#ffc800] text-[17px] mt-0.5">{tickets}</span>
        </motion.div>
      </div>
    </header>
  );
}