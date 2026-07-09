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
    <div className="w-full overflow-hidden">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x pb-1">
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
              className={`shrink-0 snap-center w-[76px] rounded-[1rem] border-2 border-b-[4px] p-2 flex flex-col items-center text-center transition-all
                ${
                  isCurrent
                    ? `${config.bg} ${config.border} ${config.shadow}`
                    : isPast
                    ? 'bg-slate-50 border-slate-200 border-b-slate-300 opacity-70'
                    : 'bg-white border-slate-200 border-b-slate-300 opacity-55'
                }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-[16px] mb-1 border-2
                  ${isCurrent ? 'bg-white ' + config.border : 'bg-white border-slate-100'}`}
              >
                {config.emoji}
              </div>
              <p
                className={`font-black text-[11px] leading-tight ${
                  isCurrent ? config.text : 'text-slate-600'
                }`}
              >
                {config.label}
              </p>
              {isCurrent && (
                <span className="mt-1 px-1.5 py-0.5 rounded-md bg-white/70 font-black text-[8px] uppercase tracking-wider text-primary-600">
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
