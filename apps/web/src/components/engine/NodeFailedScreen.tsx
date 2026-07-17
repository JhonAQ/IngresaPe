'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home } from 'lucide-react';
import { HeartIcon } from '@ingresa-pe/ui';

interface NodeFailedScreenProps {
  onClose: () => void;
  onRetry: () => void;
}

export function NodeFailedScreen({ onClose, onRetry }: NodeFailedScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-[#0f172a]/40 backdrop-blur-[2px]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl border-b-[6px] border-[#e5e5e5] text-center"
        >
          <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-9 h-9" />
          </div>

          <h2 className="font-black text-[22px] text-[#3c3c3c] mb-2">
            ¡Se acabaron las vidas!
          </h2>
          <p className="text-[#777777] font-bold text-[15px] mb-6 leading-snug">
            Perdiste todas las vidas de este nodo. Regresa al path y vuelve a
            intentarlo cuando quieras.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full bg-[#ff4b4b] text-white font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] border-[#df2b2b] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
            >
              <Home size={18} strokeWidth={3} />
              Volver al path
            </button>
            <button
              onClick={onRetry}
              className="w-full bg-white text-[#1cb0f6] font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] border-[#e5e5e5] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} strokeWidth={3} />
              Reintentar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
