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
    <div className="overflow-hidden -mx-5 px-5">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x pb-2">
        {leagueOrder.map((league, index) => {
          const config = leagueConfig[league];
          const isCurrent = league === currentLeague;
          const isPast = index < currentIndex;
          const isFuture = index > currentIndex;

          return (
            <motion.div
              key={league}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className={`shrink-0 snap-start w-[110px] rounded-[1.2rem] border-2 border-b-[5px] p-3 flex flex-col items-center text-center transition-all
                ${
                  isCurrent
                    ? `${config.bg} ${config.border} ${config.shadow} scale-105`
                    : isPast
                    ? 'bg-slate-50 border-slate-200 border-b-slate-300 opacity-70'
                    : 'bg-white border-slate-200 border-b-slate-300 opacity-60'
                }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] mb-2 border-2
                  ${isCurrent ? 'bg-white ' + config.border : 'bg-white border-slate-100'}
                  ${isFuture ? 'grayscale' : ''}`}
              >
                {config.emoji}
              </div>
              <p
                className={`font-black text-[13px] leading-tight ${
                  isCurrent ? config.text : 'text-slate-600'
                }`}
              >
                {config.label}
              </p>
              {isCurrent && (
                <span className="mt-1.5 px-2 py-0.5 rounded-lg bg-white/70 font-black text-[9px] uppercase tracking-wider text-primary-600">
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
