import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { type League, leagueOrder, leagueConfig } from '@ingresa-pe/domain';

interface LeagueLadderProps {
  currentLeague: League;
}

export const LeagueLadder: React.FC<LeagueLadderProps> = ({ currentLeague }) => {
  const currentIndex = leagueOrder.indexOf(currentLeague);

  return (
    <div className="bg-white rounded-[1.5rem] border-2 border-slate-200 border-b-[5px] border-b-slate-300 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary-50 border-2 border-primary-200 flex items-center justify-center text-primary-600">
          <Star size={18} fill="currentColor" />
        </div>
        <div>
          <p className="font-black text-slate-800 text-[15px] leading-tight">Camino de ligas</p>
          <p className="text-slate-400 font-bold text-[11px]">
            Sube de liga ganando XP cada semana
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[22px] top-4 bottom-4 w-1 bg-slate-100 rounded-full" />

        <div className="space-y-2.5 relative">
          {leagueOrder.map((league, index) => {
            const config = leagueConfig[league];
            const isCurrent = league === currentLeague;
            const isPast = index < currentIndex;
            const isFuture = index > currentIndex;

            return (
              <motion.div
                key={league}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.08 }}
                className={`flex items-center gap-3 rounded-2xl border-2 border-b-[4px] p-3 transition-all
                  ${
                    isCurrent
                      ? `${config.bg} ${config.border} ${config.shadow}`
                      : isPast
                      ? 'bg-slate-50 border-slate-200 border-b-slate-300'
                      : 'bg-white border-slate-200 border-b-slate-300 opacity-75'
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-[20px] shrink-0 border-2
                    ${
                      isCurrent
                        ? `bg-white ${config.border}`
                        : isPast
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50 border-slate-200 grayscale'
                    }`}
                >
                  {isPast ? (
                    <Check size={18} className={config.text} />
                  ) : (
                    <span className={isFuture ? 'grayscale' : ''}>{config.emoji}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-black text-[14px] truncate ${
                      isCurrent ? config.text : 'text-slate-600'
                    }`}
                  >
                    {config.label}
                  </p>
                  <p className="text-slate-400 font-bold text-[10px] truncate">
                    {index === 0 && 'Liga de inicio'}
                    {index === 1 && 'Primeros pasos'}
                    {index === 2 && 'Intermedios'}
                    {index === 3 && 'Experimentados'}
                    {index === 4 && 'Liga máxima'}
                  </p>
                </div>

                {isCurrent && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/70 border border-white/50 font-black text-[10px] uppercase tracking-wider text-primary-600">
                    Tú
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
