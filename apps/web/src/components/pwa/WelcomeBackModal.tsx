'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, WifiOff, Zap, Sparkles } from 'lucide-react';
import { useInstallPrompt } from './InstallPromptContext';
import { AppIconHero } from './AppIconHero';
import { Button3D } from '../ui/Button3D';
import { recordWelcomeBackShown } from '../../lib/activityStorage';

export function WelcomeBackModal() {
  const { showWelcomeBack, closeWelcomeBack, promptInstall, dismiss } = useInstallPrompt();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    recordWelcomeBackShown();
    dismiss();
    closeWelcomeBack();
  };

  const handleInstall = async () => {
    await promptInstall();
    recordWelcomeBackShown();
    closeWelcomeBack();
  };

  const modal = (
    <AnimatePresence>
      {showWelcomeBack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[360px] bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {/* Header gradient */}
            <div className="relative bg-gradient-to-b from-[#f3e8ff] to-white px-6 pt-6 pb-4 text-center">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 text-slate-400 flex items-center justify-center hover:bg-white hover:text-slate-600 transition-colors shadow-sm"
                aria-label="Cerrar"
              >
                <X size={18} strokeWidth={3} />
              </button>

              <div className="flex justify-center mb-3">
                <AppIconHero size={72} />
              </div>

              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200">
                <Sparkles size={12} strokeWidth={3} />
                ¡Bienvenido de vuelta!
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 text-center">
              <h2 className="font-black text-slate-800 text-[22px] leading-tight mb-2">
                Sigue donde lo dejaste
              </h2>
              <p className="text-slate-500 font-bold text-[14px] mb-5">
                Instala Ingresa.pe en tu celular para practicar sin conexión y no
                perder tu racha.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <Benefit icon={WifiOff} text="Práctica offline" />
                <Benefit icon={Zap} text="Rápido de abrir" />
              </div>

              <div className="space-y-3">
                <Button3D variant="gold" onClick={handleInstall}>
                  Instalar ahora
                </Button3D>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 font-black text-slate-400 text-[14px] hover:text-slate-600 transition-colors"
                >
                  Más tarde
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

function Benefit({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-2xl border-2 border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <span className="text-slate-600 font-bold text-[12px] leading-tight">{text}</span>
    </div>
  );
}
