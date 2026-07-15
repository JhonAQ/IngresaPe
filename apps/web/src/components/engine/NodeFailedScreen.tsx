'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, Lightbulb } from 'lucide-react';
import { Button3D } from '../ui/Button3D';

interface NodeFailedScreenProps {
  onClose: () => void;
  onRetry: () => void;
}

function SadEggIcon({ className = 'w-32 h-32' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`drop-shadow-xl ${className}`}>
      {/* Shell */}
      <ellipse cx="50" cy="52" rx="38" ry="46" fill="#e5e7eb" />
      <ellipse cx="50" cy="50" rx="38" ry="46" fill="#f3f4f6" />
      <ellipse cx="50" cy="50" rx="30" ry="38" fill="#ffffff" opacity="0.6" />

      {/* Cracks */}
      <path
        d="M 28 28 L 35 40 L 30 48"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 72 32 L 65 42 L 70 50"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Eyes */}
      <circle cx="36" cy="52" r="4" fill="#4b5563" />
      <circle cx="64" cy="52" r="4" fill="#4b5563" />

      {/* Tears */}
      <path
        d="M 36 58 C 36 58 33 66 36 68 C 39 66 36 58 36 58"
        fill="#60a5fa"
      />
      <path
        d="M 64 58 C 64 58 61 66 64 68 C 67 66 64 58 64 58"
        fill="#60a5fa"
      />

      {/* Mouth */}
      <path
        d="M 42 70 Q 50 66 58 70"
        fill="none"
        stroke="#4b5563"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TIPS = [
  'Repasa el resumen del tema antes de volver a intentarlo.',
  'Leer la explicación de cada pregunta te ayuda a no repetir el error.',
  'No pasa nada: cada intento cuenta como práctica.',
  'Tómate un respiro y vuelve con calma.',
];

function TipCard({ show }: { show: boolean }) {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-full bg-white border-2 border-[#e5e5e5] border-b-[6px] rounded-[1.5rem] p-4 flex items-start gap-4"
        >
          <div className="w-12 h-12 bg-[#fff2e0] rounded-2xl flex items-center justify-center border-2 border-[#ff9600]/20 shrink-0">
            <Lightbulb size={24} className="text-[#ff9600]" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-black text-[#3c3c3c] text-[16px] leading-tight mb-1">
              Consejo
            </h3>
            <p className="font-bold text-[#777777] text-[13px] leading-snug">
              {tip}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NodeFailedScreen({ onClose, onRetry }: NodeFailedScreenProps) {
  const [showText, setShowText] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowText(true), 600),
      setTimeout(() => setShowTip(true), 1100),
      setTimeout(() => setShowButtons(true), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] flex flex-col items-center justify-center px-6 text-center bg-[#fff1f1]">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative z-10"
        >
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SadEggIcon className="w-36 h-36" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="font-black text-[30px] text-[#ea2b2b] tracking-tight mt-6 drop-shadow-sm text-center leading-none"
        >
          ¡Se acabaron
          <br />
          las vidas!
        </motion.h1>
      </div>

      {/* Message */}
      <AnimatePresence>
        {showText && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#3c3c3c] font-bold text-[15px] max-w-[280px] mb-6 leading-snug"
          >
            Perdiste todas las vidas de este nodo. No se marcará como
            completado, pero puedes intentarlo de nuevo cuando quieras.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Tip */}
      <div className="w-full max-w-[340px] mb-6">
        <TipCard show={showTip} />
      </div>

      {/* Buttons */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col gap-3 w-full max-w-[340px]"
          >
            <Button3D variant="danger" onClick={onRetry}>
              <RotateCcw size={18} strokeWidth={3} /> Reintentar
            </Button3D>
            <Button3D variant="secondary" onClick={onClose}>
              <Home size={18} strokeWidth={3} /> Volver
            </Button3D>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
