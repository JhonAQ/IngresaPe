'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MINIGAMES } from '@ingresa-pe/domain';
import { HeroDailyChallenge } from '../../../components/entrenar/HeroDailyChallenge';
import { MinigameCard } from '../../../components/entrenar/MinigameCard';

export function EntrenarClient() {
  const router = useRouter();
  const [tickets, setTickets] = useState(5);

  const handlePlay = (gameId: string, cost = 1) => {
    if (tickets >= cost) {
      setTickets((prev) => prev - cost);

      // Navigate to the alchemy minigame
      if (gameId === 'alchemy') {
        router.push('/entrenar/alquimista');
      }
    }
  };

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar p-5 pt-4 pb-bottom-nav relative">
      <div className="pt-4 pb-6 flex justify-center">
        <h2 className="font-black text-[34px] leading-[1.1] tracking-tight text-center">
          <span className="text-duo-dark">Modo</span>
          <br />
          <span className="text-duo-purple">Arcade</span>
        </h2>
      </div>

      <HeroDailyChallenge tickets={tickets} onPlay={() => handlePlay('daily', 1)} />

      <div className="flex flex-col gap-10 mt-2">
        {MINIGAMES.map((game) => (
          <MinigameCard
            key={game.id}
            game={game}
            tickets={tickets}
            onPlay={() => handlePlay(game.id, game.cost)}
          />
        ))}
      </div>
    </main>
  );
}
