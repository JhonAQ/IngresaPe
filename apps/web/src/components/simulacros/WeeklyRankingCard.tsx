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
  Info,
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
    title: 'Fines de Semana',
    body: 'La arena de combate se abre de sábado a domingo. Solo tienes un intento oficial.',
    tone: 'blue',
  },
  {
    number: 2,
    title: 'Nivel Real',
    body: '2 horas de concentración total. Preguntas curadas al nivel del examen de admisión.',
    tone: 'rose',
  },
  {
    number: 3,
    title: 'Sube de División',
    body: 'Compite por puntos ELO. Los resultados y los ascensos se revelan el lunes.',
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0f2c]/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[360px] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border-b-[6px] border-slate-200"
          >
            {/* Header */}
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.1, bounce: 0.6 }}
                className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg transform rotate-3"
              >
                <Swords size={40} className="text-white drop-shadow-md" strokeWidth={2} />
              </motion.div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6 hide-scrollbar">
              <div className="text-center mb-6">
                <h2 className="font-black text-slate-800 text-[22px] leading-tight tracking-tight">
                  La Arena Oficial
                </h2>
                <p className="text-slate-500 font-bold text-[13px] mt-1 leading-snug">
                  Demuestra tu nivel frente a toda la comunidad.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {MODAL_STEPS.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100"
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[14px] font-black text-white shadow-sm ${
                        step.tone === 'blue' ? 'bg-blue-500' : 
                        step.tone === 'rose' ? 'bg-rose-500' : 'bg-amber-500'
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
                <div className="space-y-3">
                  <Button3D variant="brand" onClick={onStart} className="!py-3.5 text-[14px] w-full">
                    <Zap size={18} className="fill-white" /> EMPEZAR DESAFÍO
                  </Button3D>
                  <button
                    onClick={onClose}
                    className="w-full text-center text-[12px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors py-2"
                  >
                    Ahora no
                  </button>
                </div>
              ) : (
                <Button3D variant="secondary" onClick={onClose} className="!py-3.5 text-[14px] w-full">
                  ¡ENTENDIDO!
                </Button3D>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

// ============================================================================
// STUNNING PREMIUM CARDS (RE-DESIGNED)
// ============================================================================
export const WeeklyRankingCard: React.FC<WeeklyRankingCardProps> = ({
  season,
  onStartOfficial,
  isStarting,
}) => {
  const [showModal, setShowModal] = useState(false);

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
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 rounded-[2rem] p-5 border-[3px] border-indigo-400/50 border-b-[8px] border-b-indigo-700 shadow-[0_15px_30px_-10px_rgba(99,102,241,0.5)] cursor-pointer relative overflow-hidden group transition-all"
        >
          {/* Animated glow */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-fuchsia-400 rounded-full blur-[40px] opacity-40 group-hover:opacity-60 transition-opacity" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none drop-shadow-sm">
                Arena Abierta
              </span>
            </div>

            <button onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              <Info size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex gap-4 items-center mb-5 relative z-10">
            <div className="shrink-0 w-16 h-16 bg-white/10 backdrop-blur-md rounded-[1.2rem] flex items-center justify-center border-2 border-white/20 shadow-lg text-white transform group-hover:rotate-6 transition-transform">
              <Swords size={32} strokeWidth={2} className="drop-shadow-md text-cyan-300" />
            </div>
            <div>
              <h2 className="text-[22px] font-black text-white leading-tight tracking-tight drop-shadow-sm">
                Simulacro Oficial
              </h2>
              <p className="text-[13px] font-bold text-white/80 mt-1 line-clamp-2 leading-snug">
                El evento de fin de semana ha comenzado. Tienes un intento de 2 horas.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <Button3D variant="primary" className="!py-3.5 w-full bg-white text-indigo-600 border-b-slate-300 hover:bg-slate-50" disabled={isStarting}>
              {isStarting ? (
                'GENERANDO...'
              ) : (
                <span className="flex items-center gap-2">
                  <Play size={16} className="fill-indigo-600" /> INGRESAR AHORA
                </span>
              )}
            </Button3D>
          </div>
        </motion.div>

        <RankingPremiumModal isOpen={showModal} onClose={() => setShowModal(false)} onStart={handleModalStart} showStartAction={true} />
      </div>
    );
  }

  // ESTADO 2: RESULTADOS REVELADOS
  if (season.isRevealed) {
    return (
      <div className="px-5 mb-6">
        <motion.div
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] p-5 border-[3px] border-amber-300/50 border-b-[8px] border-b-orange-600 shadow-[0_15px_30px_-10px_rgba(245,158,11,0.5)] cursor-pointer relative overflow-hidden group transition-all"
        >
          {/* Sparkles Background */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute -right-20 -top-20 opacity-20 text-white pointer-events-none mix-blend-overlay">
            <Sparkles size={250} />
          </motion.div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full">
              <Trophy size={12} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none drop-shadow-sm">
                Resultados Listos
              </span>
            </div>

            <button onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              <Info size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex gap-4 items-center relative z-10">
            <div className="shrink-0 w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.2rem] flex items-center justify-center border-2 border-white/30 shadow-lg text-white transform group-hover:-translate-y-1 transition-transform">
              <Trophy size={32} strokeWidth={2.5} className="drop-shadow-md text-yellow-100" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-white leading-tight tracking-tight drop-shadow-sm">
                Ranking Actualizado
              </h2>
              <p className="text-[13px] font-bold text-white/90 mt-1 leading-snug">
                Tu nuevo ELO y división han sido calculados. Revisa la tabla de líderes.
              </p>
            </div>
          </div>
        </motion.div>

        <RankingPremiumModal isOpen={showModal} onClose={() => setShowModal(false)} showStartAction={false} />
      </div>
    );
  }

  // ESTADO 3: ENVIADO (ESPERANDO LUNES)
  if (season.isEventOpen && season.hasOfficialAttempt) {
    return (
      <div className="px-5 mb-6">
        <motion.div
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] p-5 border-[3px] border-emerald-300/50 border-b-[8px] border-b-teal-600 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] cursor-pointer relative overflow-hidden group transition-all"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full">
              <CheckCircle2 size={12} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none drop-shadow-sm">
                Misión Cumplida
              </span>
            </div>

            <button onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              <Info size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex gap-4 items-center relative z-10">
            <div className="shrink-0 w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.2rem] flex items-center justify-center border-2 border-white/30 shadow-lg text-white transform group-hover:scale-105 transition-transform">
              <CheckCircle2 size={32} strokeWidth={2.5} className="drop-shadow-md text-emerald-100" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-white leading-tight tracking-tight drop-shadow-sm">
                Simulacro Enviado
              </h2>
              <p className="text-[13px] font-bold text-white/90 mt-1 leading-snug">
                Tu puntaje está asegurado. Los resultados oficiales se revelan el lunes.
              </p>
            </div>
          </div>
        </motion.div>

        <RankingPremiumModal isOpen={showModal} onClose={() => setShowModal(false)} showStartAction={false} />
      </div>
    );
  }

  // ESTADO 4: CERRADO
  return (
    <div className="px-5 mb-6">
      <motion.div
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-slate-100 rounded-[2rem] p-5 border-[3px] border-slate-200 border-b-[8px] border-b-slate-300 shadow-sm cursor-pointer relative overflow-hidden group transition-all"
      >
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-full shadow-sm">
            <Clock size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              Próximamente
            </span>
          </div>

          <button onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors shadow-sm">
            <Info size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex gap-4 items-center relative z-10">
          <div className="shrink-0 w-16 h-16 bg-white border-2 border-slate-200 rounded-[1.2rem] flex items-center justify-center text-slate-400 shadow-sm group-hover:bg-slate-50 transition-colors">
            <CalendarDays size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[20px] font-black text-slate-700 leading-tight tracking-tight">
              Esperando el Sábado
            </h2>
            <p className="text-[13px] font-bold text-slate-500 mt-1 leading-snug">
              La arena de combate se abre todos los fines de semana. ¡Ve calentando!
            </p>
          </div>
        </div>
      </motion.div>

      <RankingPremiumModal isOpen={showModal} onClose={() => setShowModal(false)} showStartAction={false} />
    </div>
  );
};
