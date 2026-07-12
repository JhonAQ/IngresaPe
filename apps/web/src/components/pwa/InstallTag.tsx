'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Zap, Check, Download } from 'lucide-react';
import { useInstallPrompt } from './InstallPromptContext';
import { Button3D } from '../ui/Button3D';

export function InstallTag() {
  const { isInstallable, promptInstall } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div className="px-5 py-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative overflow-hidden rounded-[1.5rem] border-2 border-purple-200 border-b-[4px] border-b-purple-300 bg-gradient-to-b from-[#faf5ff] to-white p-5"
      >
        {/* Decorative sheen */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-purple-200/30 blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-20 h-20 rounded-full bg-amber-200/30 blur-2xl" />

        <div className="relative flex items-start gap-4">
          <div className="shrink-0">
            <PhoneIllustration />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-800 text-[16px] leading-tight mb-1">
              Instala la app
            </h3>
            <p className="text-slate-500 font-bold text-[12px] mb-3">
              Practica sin conexión y accede más rápido.
            </p>

            <div className="space-y-1.5 mb-4">
              <Benefit text="Sin conexión a internet" />
              <Benefit text="Abre con un toque" />
            </div>

            <Button3D variant="gold" onClick={promptInstall} className="!py-2.5 !text-[12px]">
              <Download size={15} strokeWidth={3} />
              Agregar a inicio
            </Button3D>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
        <Check size={10} strokeWidth={4} />
      </div>
      <span className="text-slate-600 font-bold text-[11px]">{text}</span>
    </div>
  );
}

function PhoneIllustration() {
  return (
    <div className="relative w-16 h-20">
      <div className="absolute inset-0 bg-purple-500 rounded-[1.2rem] shadow-[0_4px_0_0_#7e22ce] border-2 border-purple-400 flex flex-col items-center justify-center gap-1.5">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <img src="/icon-192.png" alt="" className="w-7 h-7 rounded-lg" />
        </div>
        <div className="w-6 h-1 rounded-full bg-white/30" />
      </div>

      {/* Floating badges */}
      <motion.div
        className="absolute -top-1 -right-2 w-7 h-7 rounded-full bg-green-400 text-white flex items-center justify-center shadow-md border-2 border-white"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <WifiOff size={12} strokeWidth={3} />
      </motion.div>

      <motion.div
        className="absolute -bottom-1 -left-2 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md border-2 border-white"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      >
        <Zap size={12} strokeWidth={3} />
      </motion.div>
    </div>
  );
}
