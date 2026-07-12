'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Download } from 'lucide-react';
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
        className="relative overflow-hidden rounded-[1.5rem] border-2 border-slate-200 border-b-[4px] border-b-slate-300 bg-white p-4"
      >
        <div className="relative flex items-center gap-4">
          <div className="shrink-0">
            <motion.div
              className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/logo-sky.png"
                alt="Ingresa.pe"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-800 text-[16px] leading-tight mb-1">
              Instala la app
            </h3>
            <p className="text-slate-500 font-bold text-[12px] leading-snug mb-3">
              Practica sin conexión y accede más rápido.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <BenefitChip text="Sin internet" />
              <BenefitChip text="Un toque" />
            </div>

            <Button3D variant="primary" onClick={promptInstall} className="!py-2.5 !text-[12px]">
              <Download size={15} strokeWidth={3} />
              Agregar a inicio
            </Button3D>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BenefitChip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-50 text-primary-700 font-black text-[10px]">
      <Check size={10} strokeWidth={4} />
      {text}
    </div>
  );
}
