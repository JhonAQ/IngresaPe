import React from 'react';
import { motion } from 'framer-motion';
import { Crown, User } from 'lucide-react';
import type { RankingUserDto } from '@ingresa-pe/domain';

interface PodiumCardProps {
  user: RankingUserDto;
  position: 1 | 2 | 3;
  delay?: number;
}

const config = {
  1: {
    height: 'h-[170px]',
    order: 'order-2',
    medal: 'bg-gradient-to-b from-yellow-300 to-yellow-500',
    border: 'border-yellow-400',
    shadow: 'border-b-yellow-600',
    crown: true,
    size: 'w-16 h-16',
    rankSize: 'text-[28px]',
  },
  2: {
    height: 'h-[150px]',
    order: 'order-1',
    medal: 'bg-gradient-to-b from-slate-200 to-slate-400',
    border: 'border-slate-300',
    shadow: 'border-b-slate-500',
    crown: false,
    size: 'w-14 h-14',
    rankSize: 'text-[24px]',
  },
  3: {
    height: 'h-[140px]',
    order: 'order-3',
    medal: 'bg-gradient-to-b from-orange-300 to-orange-500',
    border: 'border-orange-400',
    shadow: 'border-b-orange-700',
    crown: false,
    size: 'w-14 h-14',
    rankSize: 'text-[24px]',
  },
};

export const PodiumCard: React.FC<PodiumCardProps> = ({
  user,
  position,
  delay = 0,
}) => {
  const c = config[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${c.order} flex flex-col items-center`}
    >
      <div className="relative mb-2">
        <div
          className={`${c.size} rounded-full bg-white p-1 shadow-lg border-2 ${c.border} flex items-center justify-center overflow-hidden`}
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? ''}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={position === 1 ? 32 : 28} className="text-slate-300" />
          )}
        </div>
        {c.crown && (
          <div className="absolute -top-3 -right-1 text-yellow-500">
            <Crown size={22} fill="currentColor" />
          </div>
        )}
      </div>

      <p className="font-black text-slate-800 text-[13px] leading-tight text-center max-w-[90px] truncate">
        {user.name ?? 'Anónimo'}
      </p>
      <p className="text-slate-400 font-bold text-[10px] mb-2">
        {user.score.toFixed(1)} Ptje
      </p>

      <div
        className={`${c.height} w-[90px] ${c.medal} rounded-t-2xl border-2 ${c.border} border-b-[6px] ${c.shadow} flex items-start justify-center pt-3 mt-auto`}
      >
        <span className={`font-black text-white ${c.rankSize}`}>
          #{position}
        </span>
      </div>
    </motion.div>
  );
};
