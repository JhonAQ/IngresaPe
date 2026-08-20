'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Swords,
  Clock,
  CheckCircle2,
  X,
  Play,
  CalendarDays,
  Sparkles,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { Button3D } from '../ui/Button3D';

export interface SeasonInfo {
  isRevealed: boolean;
  isEventOpen: boolean;
  hasOfficialAttempt: boolean;
}

interface WeeklyRankingCardProps {
  season: SeasonInfo;
  onStartOfficial: () => void;
  isStarting: boolean;
}

const SEEN_KEY = 'ranking_modal_v5_premium';

// ============================================================================
// STUNNING MODAL EXPLANATION
// ============================================================================
const MODAL_STEPS = [
  {
    number: 1,
    title: 'Solo fines de semana',
    body: 'La arena se abre sábado y domingo. Tienes un único intento oficial.',
    tone: 'blue',
  },
  {
    number: 2,
    title: 'Condiciones reales',
    body: '2 horas, sin pausas. Preguntas curadas al nivel del examen de admisión.',
    tone: 'rose',
  },
  {
    number: 3,
    title: 'Sube de división',
    body: 'Compite por ELO. Los resultados y tu nueva división se revelan el lunes.',
    tone: 'amber',
  },
] as const;

function RankingPremiumModal({
  isOpen,
  onClose,
  onStart,
  showStartAction,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStart?: () => void;
  showStartAction: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/30"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative w-full max-w-[360px] bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden border-b-[6px] border-slate-200"
          >
            {/* Header limpio tipo Duo */}
            <div className="relative h-40 w-full overflow-hidden bg-primary-500 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-white rounded-full" />
                <div className="absolute top-12 -right-10 w-28 h-28 bg-white rounded-full" />
                <div className="absolute -bottom-14 left-1/3 w-40 h-40 bg-white rounded-full" />
              </div>

              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>

              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.1, bounce: 0.5 }}
                className="relative z-10"
              >
                <Swords size={64} className="text-white" strokeWidth={2} />
              </motion.div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6 hide-scrollbar">
              <div className="text-center mb-5">
                <h2 className="font-black text-slate-800 text-[22px] leading-tight tracking-tight">
                  La Arena Oficial
                </h2>
                <p className="text-slate-500 font-bold text-[13px] mt-1 leading-snug">
                  Demuestra tu nivel real frente a toda la comunidad.
                </p>
              </div>

              <div className="space-y-2.5 mb-5">
                {MODAL_STEPS.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-start gap-3.5 p-3 rounded-[1.2rem] bg-slate-50"
                  >
                    <div
                      className={`shrink-0 w-7 h-7 mt-0.5 rounded-full flex items-center justify-center text-[12px] font-black text-white ${
                        step.tone === 'blue'
                          ? 'bg-blue-500'
                          : step.tone === 'rose'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    >
                      {step.number}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-[14px]">
                        {step.title}
                      </h3>
                      <p className="text-slate-500 font-bold text-[12px] leading-snug mt-0.5">
                        {step.body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {showStartAction ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="space-y-2.5"
                >
                  <Button3D
                    variant="brand"
                    onClick={onStart}
                    className="!py-3.5 text-[13px]"
                  >
                    <Zap size={18} className="fill-white" /> EMPEZAR DESAFÍO
                  </Button3D>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full text-center text-[13px] font-black text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Ahora no
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Button3D
                    variant="secondary"
                    onClick={onClose}
                    className="!py-3.5 text-[13px]"
                  >
                    ¡Entendido!
                  </Button3D>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

// ============================================================================
// STUNNING PREMIUM CARD
// ============================================================================
export const WeeklyRankingCard: React.FC<WeeklyRankingCardProps> = ({
  season,
  onStartOfficial,
  isStarting,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Determinar si debemos mostrar el modal por primera vez en toda la tarjeta
  const handleCardClick = () => {
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) {
      setShowModal(true);
      localStorage.setItem(SEEN_KEY, 'true');
    } else {
      if (season.isEventOpen && !season.hasOfficialAttempt && !isStarting) {
        onStartOfficial();
      } else {
        setShowModal(true);
      }
    }
  };

  const handleModalStart = () => {
    setShowModal(false);
    onStartOfficial();
  };

  // ESTADO 1: EVENTO ABIERTO (LISTO PARA DAR)
  if (season.isEventOpen && !season.hasOfficialAttempt) {
    return (
      <div className="px-5 mb-6">
        <motion.div
          onClick={handleCardClick}
          whileHover={{ scale: 1.01, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-[2rem] p-5 border-[3px] border-primary-100 border-b-[8px] border-b-primary-200 shadow-[0_10px_30px_-10px_rgba(225,29,72,0.2)] cursor-pointer relative overflow-hidden group transition-all"
        >
          {/* Animated background glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-20 -top-20 w-64 h-64 bg-primary-400 rounded-full blur-[60px] pointer-events-none"
          />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                Evento Activo
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
              <ShieldAlert size={14} strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex gap-4 items-center mb-5 relative z-10">
            <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-rose-600 rounded-[1.4rem] flex items-center justify-center shadow-lg shadow-primary-500/30 text-white transform group-hover:rotate-3 transition-transform">
              <Swords size={32} strokeWidth={2} className="drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-[22px] font-black text-slate-800 leading-tight tracking-tight">
                Arena de Simulacros
              </h2>
              <p className="text-[13px] font-bold text-slate-500 mt-1 line-clamp-2 leading-snug">
                Demuestra tu nivel este fin de semana. Tienes un único intento
                de 2 horas.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <Button3D variant="brand" className="!py-3.5" disabled={isStarting}>
              {isStarting ? (
                'Generando Arena...'
              ) : (
                <span className="flex items-center gap-2">
                  <Play size={16} className="fill-white" /> INGRESAR AHORA
                </span>
              )}
            </Button3D>
          </div>
        </motion.div>

        <RankingPremiumModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onStart={handleModalStart}
          showStartAction={true}
        />
      </div>
    );
  }

  // ESTADO 2: RESULTADOS REVELADOS
  if (season.isRevealed) {
    return (
      <div className="px-5 mb-6">
        <motion.div
          onClick={handleCardClick}
          whileHover={{ scale: 1.01, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-[2rem] p-5 border-[3px] border-amber-100 border-b-[8px] border-b-amber-200 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)] cursor-pointer relative overflow-hidden group transition-all"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-16 -top-16 opacity-[0.03] text-amber-500 pointer-events-none"
          >
            <Sparkles size={200} />
          </motion.div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-full">
              <Trophy size={12} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                Resultados Listos
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
              <ShieldAlert size={14} strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex gap-4 items-center relative z-10">
            <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[1.4rem] flex items-center justify-center shadow-lg shadow-amber-500/30 text-white transform group-hover:-translate-y-1 transition-transform">
              <Trophy size={32} strokeWidth={2.5} className="drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-slate-800 leading-tight tracking-tight">
                Ranking Actualizado
              </h2>
              <p className="text-[13px] font-bold text-slate-500 mt-1 leading-snug">
                Tu nuevo ELO y división han sido calculados. Revisa la tabla
                oficial.
              </p>
            </div>
          </div>
        </motion.div>

        <RankingPremiumModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          showStartAction={false}
        />
      </div>
    );
  }

  // ESTADO 3: ENVIADO (ESPERANDO LUNES)
  if (season.isEventOpen && season.hasOfficialAttempt) {
    return (
      <div className="px-5 mb-6">
        <motion.div
          onClick={handleCardClick}
          whileHover={{ scale: 1.01, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-[2rem] p-5 border-[3px] border-emerald-100 border-b-[8px] border-b-emerald-200 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.2)] cursor-pointer relative overflow-hidden group transition-all"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle2 size={12} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                Misión Cumplida
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <ShieldAlert size={14} strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex gap-4 items-center relative z-10">
            <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[1.4rem] flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white transform group-hover:scale-105 transition-transform">
              <CheckCircle2
                size={32}
                strokeWidth={2.5}
                className="drop-shadow-md"
              />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-slate-800 leading-tight tracking-tight">
                Simulacro Enviado
              </h2>
              <p className="text-[13px] font-bold text-slate-500 mt-1 leading-snug">
                Tu puntaje está asegurado. Los resultados oficiales se revelan
                el lunes.
              </p>
            </div>
          </div>
        </motion.div>

        <RankingPremiumModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          showStartAction={false}
        />
      </div>
    );
  }

  // ESTADO 4: CERRADO
  return (
    <div className="px-5 mb-6">
      <motion.div
        onClick={handleCardClick}
        whileHover={{ scale: 1.01, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-[2rem] p-5 border-[3px] border-slate-100 border-b-[8px] border-b-slate-200 shadow-sm cursor-pointer relative overflow-hidden group transition-all"
      >
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-full">
            <Clock size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              Próximamente
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
            <ShieldAlert size={14} strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex gap-4 items-center relative z-10">
          <div className="shrink-0 w-16 h-16 bg-slate-100 border-2 border-slate-200 rounded-[1.4rem] flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
            <CalendarDays size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[20px] font-black text-slate-800 leading-tight tracking-tight">
              Esperando el Sábado
            </h2>
            <p className="text-[13px] font-bold text-slate-500 mt-1 leading-snug">
              La arena de ranking se abre todos los fines de semana. ¡Prepárate!
            </p>
          </div>
        </div>
      </motion.div>

      <RankingPremiumModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        showStartAction={false}
      />
    </div>
  );
};
