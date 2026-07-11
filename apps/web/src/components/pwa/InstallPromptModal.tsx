'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { useInstallPrompt } from './InstallPromptContext';
import { Button3D } from '../ui/Button3D';

export function InstallPromptModal() {
  const { canShowModal, promptInstall, dismiss } = useInstallPrompt();
  const [mounted, setMounted] = useState(false);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    dismiss({ neverShowAgain });
  };

  const modal = (
    <AnimatePresence>
      {canShowModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[360px] bg-white rounded-[2rem] shadow-2xl p-6 text-center"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} strokeWidth={3} />
            </button>

            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-[0_6px_0_0_#911019] border-2 border-primary-500">
              <img
                src="/icon-192.png"
                alt="Ingresa.pe"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="font-black text-slate-800 text-[22px] leading-tight mb-2">
              Lleva Ingresa.pe en tu celular
            </h2>
            <p className="text-slate-500 font-bold text-[14px] mb-6">
              Practica sin conexión, sigue tu racha y llega más rápido a tu
              universidad.
            </p>

            <div className="space-y-3">
              <Button3D variant="brand" onClick={promptInstall}>
                <Download size={20} strokeWidth={3} />
                Instalar ahora
              </Button3D>

              <button
                onClick={handleDismiss}
                className="w-full py-3 font-black text-slate-400 text-[14px] hover:text-slate-600 transition-colors"
              >
                Ahora no
              </button>

              <label className="flex items-center justify-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={neverShowAgain}
                  onChange={(e) => setNeverShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-slate-400 font-bold text-[12px]">
                  No volver a mostrar
                </span>
              </label>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
