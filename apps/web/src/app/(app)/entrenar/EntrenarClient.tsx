'use client';

import React, { useState } from 'react';
import { MINIGAMES } from '../../../data/entrenar';
import { HeaderTickets } from '../../../components/entrenar/HeaderTickets';
import { HeroDailyChallenge } from '../../../components/entrenar/HeroDailyChallenge';
import { MinigameCard } from '../../../components/entrenar/MinigameCard';

export function EntrenarClient() {
  const [tickets, setTickets] = useState(5);

  const handlePlay = (cost: number = 1) => {
    if (tickets >= cost) {
      setTickets(prev => prev - cost);
      // Aquí se navegará al engine de entrenamiento
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .duo-sheen {
          background-image: linear-gradient(
            -45deg, 
            rgba(255,255,255,0) 30%, 
            rgba(255,255,255,0.6) 45%, 
            rgba(255,255,255,0) 60%
          );
          background-size: 200% 200%;
        }
      `}} />

      <HeaderTickets tickets={tickets} />

      <div className="w-full flex-1 overflow-y-auto hide-scrollbar p-5 pt-4 pb-36 relative">

        <div className="pt-4 pb-6 flex justify-center">
          <h2 className="font-black text-[34px] leading-[1.1] tracking-tight text-center">
            <span className="text-[#3c3c3c]">Modo</span><br/>
            <span className="text-[#ce82ff]">Arcade</span>
          </h2>
        </div>

        <HeroDailyChallenge 
          tickets={tickets} 
          onPlay={() => handlePlay(1)} 
        />

        <div className="flex flex-col gap-10 mt-2">
          {MINIGAMES.map((game) => (
            <MinigameCard 
              key={game.id} 
              game={game} 
              tickets={tickets} 
              onPlay={() => handlePlay(game.cost)} 
            />
          ))}
        </div>

      </div>
    </>
  );
}