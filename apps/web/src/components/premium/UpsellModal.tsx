'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Crown, Lock, Clock, X, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button3D } from './../ui/Button3D';

export type UpsellTriggerType = 'ENERGY' | 'SIMULACRO_LIMIT' | 'ARCHIVE_LOCKED' | 'GENERIC';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerType?: UpsellTriggerType;
}

const triggerContent = {
  ENERGY: {
    icon: <Zap size={32} className="text-amber-400" fill="currentColor" />,
    gradient: 'from-amber-400 to-orange-500',
    glow: 'rgba(251,191,36,0.3)',
    title: '¡Te quedaste sin energía!',
    desc: 'Los estudiantes PRO nunca se detienen. Consigue energía infinita y alcanza tu meta más rápido.',
    cta: 'OBTENER ENERGÍA INFINITA',
  },
  SIMULACRO_LIMIT: {
    icon: <Clock size={32} className="text-cyan-400" />,
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'rgba(34,211,238,0.3)',
    title: 'Límite Semanal Alcanzado',
    desc: 'Has usado tu simulacro gratuito de esta semana. Sube a Cachimbo PRO para desbloquear intentos ilimitados con IA.',
    cta: 'DESBLOQUEAR SIMULACROS',
  },
  ARCHIVE_LOCKED: {
    icon: <Lock size={32} className="text-rose-400" />,
    gradient: 'from-rose-400 to-pink-500',
    glow: 'rgba(251,113,133,0.3)',
    title: 'Archivo Histórico Bloqueado',
    desc: 'Los exámenes pasados completos son exclusivos para usuarios Cachimbo PRO. Desbloquea más de 50 exámenes oficiales.',
    cta: 'DESBLOQUEAR ARCHIVO',
  },
  GENERIC: {
    icon: <Crown size={32} className="text-cyan-300" fill="currentColor" />,
    gradient: 'from-cyan-400 to-purple-500',
    glow: 'rgba(34,211,238,0.3)',
    title: 'Asegura tu Ingreso',
    desc: 'Únete a Cachimbo PRO y multiplica tus opciones de ingreso con herramientas avanzadas y sin límites.',
    cta: 'VER PLANES PRO',
  },
};

export function UpsellModal({ isOpen, onClose, triggerType = 'GENERIC' }: UpsellModalProps) {
  const router = useRouter();
  const content = triggerContent[triggerType];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0a0f2c]/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#18183b] to-[#0a0f2c] rounded-[2rem] border-2 border-slate-700 p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
          style={{ boxShadow: `0 0 40px ${content.glow}` }}
        >
          {/* Top light beam */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-gradient-to-b from-white/10 to-transparent blur-[30px] rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 rounded-full transition-colors z-10"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          {/* Floating Icon Wrapper */}
          <div className="relative w-24 h-24 mb-6 mt-2">
            <div className={`absolute inset-0 bg-gradient-to-tr ${content.gradient} rounded-full blur-[15px] opacity-40 animate-pulse`} />
            <div className="relative w-full h-full bg-[#0a0f2c] rounded-[2rem] border-[3px] border-slate-700 flex items-center justify-center shadow-inner">
               {content.icon}
            </div>
            {/* Sparkles */}
            <svg className="absolute top-0 right-0 w-6 h-6 text-white animate-bounce drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <svg className="absolute bottom-2 -left-2 w-4 h-4 text-white animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </div>

          {/* Texts */}
          <h2 className="font-black text-white text-[22px] leading-tight mb-3 relative z-10">
            {content.title}
          </h2>
          <p className="text-indigo-200/90 font-bold text-[14px] leading-snug mb-8 relative z-10">
            {content.desc}
          </p>

          {/* CTA */}
          <div className="w-full relative z-10">
            <Button3D
              variant="neon"
              className="w-full !py-3.5 mb-3"
              onClick={() => {
                onClose();
                router.push('/premium');
              }}
            >
              {content.cta}
            </Button3D>

            <button
              onClick={onClose}
              className="font-black text-slate-500 hover:text-slate-300 text-[12px] uppercase tracking-widest transition-colors py-2"
            >
              No, gracias
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
