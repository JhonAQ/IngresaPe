'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AppIconHeroProps {
  size?: number;
  showRing?: boolean;
  className?: string;
}

export function AppIconHero({
  size = 80,
  showRing = true,
  className = '',
}: AppIconHeroProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {showRing && (
        <>
          <motion.div
            className="absolute inset-0 rounded-2xl bg-amber-400/30"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-[-4px] rounded-2xl border-2 border-amber-400/40"
            animate={{ scale: [1, 1.08, 1], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </>
      )}

      <motion.div
        className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_6px_0_0_#911019] border-2 border-primary-500"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src="/icon-192.png"
          alt="Ingresa.pe"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}
