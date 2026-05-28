'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Flame } from 'lucide-react';

interface GoalCardProps {
  career: string;
  currentScore: number;
  targetScore: number;
  isLoaded: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  career,
  currentScore,
  targetScore,
  isLoaded,
}) => {
  const pointsNeeded = (targetScore - currentScore).toFixed(1);
  const targetPercentage = Math.min((currentScore / targetScore) * 100, 100);

  return (
    <div className="px-5 mb-6">
      <div className="bg-white rounded-[1.8rem] p-4 border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-[0_3px_0_0_#1d4ed8]">
              <Target size={22} strokeWidth={3} />
            </div>
            <h2 className="text-[19px] font-black text-slate-800 leading-tight">
              {career}
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Puntaje
            </span>
            <span className="text-xl font-black text-blue-600 leading-none">
              {currentScore}
            </span>
          </div>
        </div>

        {/* Barra de Progreso Avanzada */}
        <div className="h-4 w-full bg-slate-100 rounded-full p-0.5 border border-slate-200 mb-2.5 relative overflow-visible">
          {/* Llenado Principal */}
          <motion.div
            initial={{ width: 0 }}
            animate={isLoaded ? { width: `${targetPercentage}%` } : {}}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className="h-full bg-blue-600 rounded-full relative overflow-hidden"
          >
            {/* Flujo interno de partículas */}
            <motion.div
              animate={{ x: ['-100%', '150%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-[1px]"
            />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-white/20 rounded-full" />
          </motion.div>

          {/* EL CABEZAL DE PROPULSIÓN (Plasma Flare) */}
          <motion.div
            initial={{ left: 0 }}
            animate={isLoaded ? { left: `${targetPercentage}%` } : {}}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-1/2 -translate-y-1/2 -ml-1 flex items-center z-10 pointer-events-none"
          >
            {/* Estelas de energía hacia ADELANTE (Derecha) */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, 40],
                  opacity: [0.7, 0],
                  scaleX: [1, 3],
                  width: [4, 25],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.25,
                  ease: 'easeOut',
                }}
                className="absolute left-0 h-[2.5px] bg-blue-400/60 blur-[1.5px] rounded-full"
                style={{ top: `${(i - 1) * 5}px` }}
              />
            ))}

            {/* El Flare Central (Sin círculos blancos sólidos) */}
            <motion.div
              animate={{
                opacity: [0.6, 1, 0.6],
                boxShadow: [
                  '0 0 10px 1px rgba(255,255,255,0.7)',
                  '0 0 25px 5px rgba(59,130,246,1)',
                  '0 0 10px 1px rgba(255,255,255,0.7)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-1 h-3 bg-white/90 blur-[0.5px] rounded-full"
            />
          </motion.div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold">
          <div className="flex items-center gap-1 text-slate-400">
            <Flame size={14} className="text-orange-500 fill-orange-500" />
            Faltan{' '}
            <span className="text-red-500 font-black">{pointsNeeded} pts</span>
          </div>
          <span className="text-slate-400 uppercase tracking-widest">
            Meta: {targetScore}
          </span>
        </div>
      </div>
    </div>
  );
};
