import React from 'react';
import { motion } from 'framer-motion';
import { type League, leagueOrder, leagueConfig } from '@ingresa-pe/domain';

interface LeagueCarouselProps {
  currentLeague: League;
}

export const LeagueCarousel: React.FC<LeagueCarouselProps> = ({
  currentLeague,
}) => {
  const currentIndex = leagueOrder.indexOf(currentLeague);

  return (
    <div className="w-full">
      <div className="flex justify-between gap-2">
        {leagueOrder.map((league, index) => {
          const config = leagueConfig[league];
          const isCurrent = league === currentLeague;
          const isPast = index < currentIndex;

          return (
            <motion.div
              key={league}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={`flex-1 min-w-0 rounded-[1rem] p-2 flex flex-col items-center text-center transition-all
                ${
                  isCurrent
                    ? `${config.bg} ${config.border} ${config.shadow}`
                    : isPast
                    ? 'bg-slate-50 opacity-70'
                    : 'bg-white opacity-55'
                }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-[16px] mb-1
                  ${isCurrent ? 'bg-white/70' : 'bg-white'}`}
              >
                {config.emoji}
              </div>
              <p
                className={`font-black text-[10px] leading-tight ${
                  isCurrent ? config.text : 'text-slate-600'
                }`}
              >
                {config.label}
              </p>
              {isCurrent && (
                <span className="mt-1 px-1.5 py-0.5 rounded-md bg-white/70 font-black text-[8px] uppercase tracking-wider text-primary-600"
                >
                  Tú
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
