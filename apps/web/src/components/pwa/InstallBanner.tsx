'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { useInstallPrompt } from './InstallPromptContext';

export function InstallBanner() {
  const { canShowBanner, promptInstall, dismiss } = useInstallPrompt();

  return (
    <AnimatePresence>
      {canShowBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative z-10 bg-primary-500 text-white border-b-4 border-primary-700"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <img
              src="/icon-192.png"
              alt=""
              className="w-10 h-10 rounded-xl bg-white/20"
            />
            <div className="flex-1 min-w-0">
              <p className="font-black text-[14px] leading-tight">
                Instala Ingresa.pe
              </p>
              <p className="text-white/90 font-bold text-[11px]">
                Practica sin conexión y sigue tu racha.
              </p>
            </div>

            <button
              onClick={promptInstall}
              className="shrink-0 bg-white text-primary-600 font-black text-[12px] px-3 py-2 rounded-xl border-b-[3px] border-slate-200 active:border-b-0 active:translate-y-[3px] transition-all flex items-center gap-1"
            >
              <Download size={14} strokeWidth={3} />
              Instalar
            </button>

            <button
              onClick={() => dismiss()}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Cerrar"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
