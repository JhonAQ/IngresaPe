import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import type { RankingUserDto } from '@ingresa-pe/domain';

type Zone = 'promotion' | 'relegation' | 'safe';

interface RankRowProps {
  user: RankingUserDto;
  index: number;
  zone?: Zone;
}

export const RankRow: React.FC<RankRowProps> = ({ user, index, zone = 'safe' }) => {
  const effectiveZone = user.isMe ? 'safe' : zone;

  const zoneClasses = {
    promotion: 'border-l-4 border-l-success-500',
    relegation: 'border-l-4 border-l-error-500',
    safe: '',
  };

  const zoneDot = {
    promotion: 'bg-success-500',
    relegation: 'bg-error-500',
    safe: 'bg-transparent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-[1.2rem] border-2 transition-all
        ${
          user.isMe
            ? 'bg-primary-50 border-primary-500'
            : 'bg-white border-slate-100'
        } ${zoneClasses[effectiveZone]}`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[14px] shrink-0
          ${
            user.rank === 1
              ? 'bg-yellow-100 text-yellow-600'
              : user.rank === 2
              ? 'bg-slate-100 text-slate-600'
              : user.rank === 3
              ? 'bg-orange-100 text-orange-600'
              : 'bg-slate-50 text-slate-400'
          }`}
      >
        {user.rank}
      </div>

      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? ''}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User size={20} className="text-slate-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`font-black text-[14px] truncate ${
            user.isMe ? 'text-primary-700' : 'text-slate-800'
          }`}
        >
          {user.name ?? 'Anónimo'}
          {user.isMe && (
            <span className="ml-1.5 text-[10px] font-black uppercase tracking-wider text-primary-500">
              Tú
            </span>
          )}
        </p>
        {user.career && (
          <p className="text-slate-400 font-bold text-[10px] truncate">
            {user.career.name}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-right shrink-0">
        <div
          className={`w-2 h-2 rounded-full ${zoneDot[effectiveZone]}`}
          title={
            zone === 'promotion'
              ? 'Zona de ascenso'
              : zone === 'relegation'
              ? 'Zona de descenso'
              : ''
          }
        />
        <div>
          <p className="font-black text-[14px] text-slate-800">
            {user.weeklyPtje.toFixed(1)}
          </p>
          <p className="text-slate-400 font-bold text-[9px] uppercase">Ptje</p>
        </div>
      </div>
    </motion.div>
  );
};
