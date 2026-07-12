'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Sparkles } from 'lucide-react';
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
          className="relative z-10 overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-primary-50 via-white to-primary-100 border-b border-primary-200/50">
            {/* Decorative orbs */}
            <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-primary-200/40 blur-2xl" />
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary-200/40 blur-2xl" />

            <div className="relative flex items-center gap-3 px-4 py-3">
              <div className="relative shrink-0">
                <img
                  src="/logo-sky.png"
                  alt=""
                  className="w-11 h-11 rounded-xl shadow-sm"
                />
                <motion.div
                  className="absolute inset-[-3px] rounded-xl border-2 border-primary-400/50"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-primary-500" strokeWidth={3} />
                  <p className="font-black text-slate-800 text-[13px] leading-tight">
                    Agrega Ingresa.pe a tu inicio
                  </p>
                </div>
                <p className="text-slate-500 font-bold text-[11px]">
                  Practica sin conexión y no pierdas tu racha.
                </p>
              </div>

              <button
                onClick={promptInstall}
                className="shrink-0 h-9 px-3 bg-primary-500 text-white font-black text-[11px] rounded-xl border-b-[3px] border-primary-600 active:border-b-0 active:translate-y-[3px] transition-all flex items-center gap-1.5"
              >
                <Download size={13} strokeWidth={3} />
                Instalar
              </button>

              <button
                onClick={() => dismiss()}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                aria-label="Cerrar"
              >
                <X size={15} strokeWidth={3} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
