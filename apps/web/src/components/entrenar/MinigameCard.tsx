'use client';

import React from 'react';
import { MinigameData } from '../../data/entrenar';
import { DuoTicket, ChunkyHeart, ChunkyTimer } from './ArcadeIcons';

interface MinigameCardProps {
  game: MinigameData;
  tickets: number;
  onPlay: () => void;
}

export function MinigameCard({ game, tickets, onPlay }: MinigameCardProps) {
  const hasTickets = tickets >= game.cost;
  const Icon = game.id === 'speed' ? ChunkyTimer : ChunkyHeart;

  return (
    <div className="relative w-full rounded-[1.5rem] border-2 border-[#e5e5e5] border-b-[6px] bg-white p-5 pt-8 flex flex-col mt-2">
      <div className="absolute -top-3.5 left-6 z-20">
        <span
          className="inline-block font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full bg-white"
          style={{ color: game.color }}
        >
          {game.subtitle}
        </span>
      </div>

      <div className="relative z-10 flex-1 pr-20 min-h-[90px] mb-4">
        <h3 className="font-black text-[22px] text-[#3c3c3c] leading-none mb-2">
          {game.title}
        </h3>
        <p className="font-bold text-[#afafaf] text-[13px] leading-snug">
          {game.description}
        </p>
      </div>

      <div className="absolute top-0 -right-2 w-[110px] h-[110px] rotate-[-5deg] pointer-events-none z-10">
        <Icon />
      </div>

      <button
        onClick={onPlay}
        disabled={!hasTickets}
        className="relative z-20 w-full font-black text-[16px] uppercase tracking-widest py-4 rounded-2xl active:translate-y-[5px] transition-all flex justify-center items-center gap-1.5"
        style={
          hasTickets
            ? {
                backgroundColor: game.color,
                color: 'white',
                borderBottom: `5px solid ${game.shadow}`,
              }
            : {
                backgroundColor: '#e5e5e5',
                color: '#afafaf',
                borderBottom: '5px solid #cfcfcf',
                cursor: 'not-allowed',
              }
        }
      >
        JUGAR
        {hasTickets && (
          <div className="flex items-center gap-1 ml-1 drop-shadow-sm">
            <DuoTicket className="w-5 h-5" />
            <span className="text-white text-[15px] -mt-0.5">-{game.cost}</span>
          </div>
        )}
      </button>
    </div>
  );
}
