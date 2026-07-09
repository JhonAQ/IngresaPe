'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TimerBarProps {
  timeLeft: number;
  maxTime: number;
}

export function TimerBar({ timeLeft, maxTime }: TimerBarProps) {
  const percentage = Math.max(0, (timeLeft / maxTime) * 100);

  // Color changes based on remaining time
  const getColor = () => {
    if (percentage > 50) return '#58cc02'; // Green
    if (percentage > 25) return '#ffc800'; // Yellow
    return '#ff4b4b'; // Red
  };

  return (
    <div className="w-full px-6 flex flex-col items-center z-10 mb-4">
      <div className="w-full max-w-[320px] h-4 bg-black/40 rounded-full overflow-hidden p-[2px] shadow-inner backdrop-blur-sm border border-white/10">
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: `${percentage}%`,
            backgroundColor: getColor(),
          }}
          transition={{
            width: { duration: 1, ease: 'linear' },
            backgroundColor: { duration: 0.5 },
          }}
        />
      </div>
    </div>
  );
}
