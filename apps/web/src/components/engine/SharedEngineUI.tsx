'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, Check, Flag } from 'lucide-react';

// ============================================================================
// ARTE SVG CUSTOM (Chunky & Flat 3D)
// ============================================================================
export const ChunkyHeart = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 100 100" className={`drop-shadow-sm ${className}`}>
    <path
      d="M 50 90 L 15 50 C 5 40 5 20 20 10 C 30 5 40 10 50 20 C 60 10 70 5 80 10 C 95 20 95 40 85 50 Z"
      fill="#ff4b4b"
    />
    <path
      d="M 22 15 C 30 8 42 12 48 20"
      stroke="#ffffff"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

export const DuoBot = ({
  className = 'w-24 h-24',
  state = 'idle',
}: {
  className?: string;
  state?: string;
}) => {
  return (
    <svg viewBox="0 0 100 100" className={`drop-shadow-md ${className}`}>
      {/* Antena */}
      <rect x="46" y="5" width="8" height="20" rx="4" fill="#a568cc" />
      <motion.circle
        cx="50"
        cy="5"
        r="8"
        fill="#ce82ff"
        animate={
          state === 'thinking'
            ? { fill: ['#ce82ff', '#ffc800', '#ce82ff'], scale: [1, 1.2, 1] }
            : {}
        }
        transition={{ repeat: Infinity, duration: 1 }}
      />
      {/* Cabeza */}
      <rect x="15" y="30" width="70" height="60" rx="16" fill="#1899d6" />
      <rect x="15" y="20" width="70" height="60" rx="16" fill="#1cb0f6" />
      {/* Orejas */}
      <rect x="5" y="45" width="10" height="20" rx="4" fill="#a568cc" />
      <rect x="85" y="45" width="10" height="20" rx="4" fill="#a568cc" />
      {/* Pantalla Frontal */}
      <rect x="25" y="35" width="50" height="30" rx="8" fill="#1e293b" />
      <path
        d="M 25 45 C 25 38 30 35 35 35 L 75 35 L 55 65 L 25 65 Z"
        fill="#ffffff"
        opacity="0.1"
      />

      {/* Ojos Dinámicos */}
      {state === 'thinking' ? (
        <g>
          <motion.circle
            cx="35"
            cy="48"
            r="5"
            fill="#ffc800"
            animate={{ scale: [1, 0.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          <motion.circle
            cx="65"
            cy="48"
            r="5"
            fill="#ffc800"
            animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        </g>
      ) : state === 'happy' ? (
        <g>
          <path
            d="M 30 50 Q 35 40 40 50"
            stroke="#58cc02"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 60 50 Q 65 40 70 50"
            stroke="#58cc02"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ) : (
        <g>
          <circle cx="35" cy="48" r="5" fill="#58cc02" />
          <circle cx="65" cy="48" r="5" fill="#58cc02" />
        </g>
      )}
      <path
        d="M 22 30 L 40 30"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
};

export const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-2">
    {[0, 1, 2].map((dot) => (
      <motion.div
        key={dot}
        className="w-2.5 h-2.5 bg-[#ce82ff] rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: dot * 0.15,
        }}
      />
    ))}
  </div>
);

// ============================================================================
// COMPONENTES DE LAYOUT DEL MOTOR
// ============================================================================

interface EngineHeaderProps {
  progress: number;
  lives: number;
  onClose: () => void;
}

export function EngineHeader({ progress, lives, onClose }: EngineHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-2 bg-white z-20 shrink-0 gap-4">
      <button
        onClick={onClose}
        className="text-[#afafaf] hover:text-[#777777] transition-colors active:scale-95"
      >
        <X size={28} strokeWidth={3} />
      </button>
      <div className="flex-1 h-[16px] bg-[#e5e5e5] rounded-full relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 bottom-0 bg-[#58cc02] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div className="absolute top-[3px] left-2 right-2 h-[4px] bg-white/30 rounded-full"></div>
        </motion.div>
      </div>
      <div className="flex items-center gap-1.5 font-black text-[#ff4b4b]">
        <ChunkyHeart className="w-7 h-7" /> {lives}
      </div>
    </header>
  );
}

interface FeedbackDrawerProps {
  status: 'idle' | 'checked';
  isCorrect: boolean | null;
  isCheckDisabled: boolean;
  correctAnswerText?: string;
  onCheck: () => void;
  onContinue: () => void;
  onOpenAI: () => void;
}

export function FeedbackDrawer({
  status,
  isCorrect,
  isCheckDisabled,
  correctAnswerText,
  onCheck,
  onContinue,
  onOpenAI,
}: FeedbackDrawerProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <AnimatePresence mode="wait">
        {/* IDLE */}
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white border-t-2 border-[#e5e5e5] p-4 pb-safe"
          >
            <button
              onClick={onCheck}
              disabled={isCheckDisabled}
              className={`w-full font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] transition-all
                ${
                  !isCheckDisabled
                    ? 'bg-[#58cc02] text-white border-[#58a700] active:border-b-0 active:translate-y-[4px]'
                    : 'bg-[#e5e5e5] text-[#afafaf] border-[#e5e5e5] cursor-not-allowed'
                }`}
            >
              Comprobar
            </button>
          </motion.div>
        )}

        {/* ACIERTO */}
        {status === 'checked' && isCorrect && (
          <motion.div
            key="correct"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="bg-[#d7ffb8] border-t-2 border-[#b5e589] px-4 py-5 pb-safe shadow-[0_-10px_20px_rgba(88,204,2,0.1)] relative"
          >
            {/* Banderita Flotante sin caja */}
            <button className="absolute top-5 right-5 text-[#58a700]/40 hover:text-[#58a700] active:scale-95 transition-all">
              <Flag size={24} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                <Check size={20} strokeWidth={4} className="text-[#58cc02]" />
              </div>
              <h3 className="font-black text-[#58a700] text-[22px]">
                ¡Excelente!
              </h3>
            </div>

            <button
              onClick={onContinue}
              className="w-full bg-[#58cc02] text-white font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] border-[#58a700] active:border-b-0 active:translate-y-[4px] transition-all"
            >
              Continuar
            </button>
          </motion.div>
        )}

        {/* ERROR */}
        {status === 'checked' && !isCorrect && (
          <motion.div
            key="incorrect"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="bg-[#ffdfe0] border-t-2 border-[#ffc2c4] px-4 py-5 pb-safe shadow-[0_-10px_20px_rgba(255,75,75,0.1)] relative"
          >
            {/* Banderita Flotante sin caja */}
            <button className="absolute top-5 right-5 text-[#ea2b2b]/40 hover:text-[#ea2b2b] active:scale-95 transition-all">
              <Flag size={24} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <X size={20} strokeWidth={4} className="text-[#ea2b2b]" />
                </div>
                <h3 className="font-black text-[#ea2b2b] text-[22px]">
                  ¡Incorrecto!
                </h3>
              </div>
              <div className="pl-11">
                <p className="font-bold text-[#ea2b2b] text-[15px]">
                  Solución correcta:
                </p>
                <p className="font-black text-[#ea2b2b] text-[17px] leading-tight mt-0.5">
                  {correctAnswerText}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={onOpenAI}
                className="w-full bg-[#1e293b] text-[#ce82ff] font-black text-[15px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] border-[#0f172a] hover:bg-[#334155] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles size={20} className="fill-[#ce82ff]" />
                Explicar con IA
              </button>

              <button
                onClick={onContinue}
                className="w-full bg-[#ff4b4b] text-white font-black text-[15px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] border-[#df2b2b] hover:bg-[#ef4444] active:border-b-0 active:translate-y-[4px] transition-all"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DuoMaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  trick?: string;
  explanation: string;
}

export function DuoMaxModal({
  isOpen,
  onClose,
  trick,
  explanation,
}: DuoMaxModalProps) {
  const [aiState, setAiState] = useState('idle');
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAiState('thinking');
      setDisplayedText('');
      const timeout = setTimeout(() => setAiState('typing'), 1200);
      return () => clearTimeout(timeout);
    } else {
      setAiState('idle');
      setDisplayedText('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (aiState === 'typing') {
      let i = 0;
      setDisplayedText('');
      const textToType = explanation;

      const typingInterval = setInterval(() => {
        setDisplayedText(textToType.substring(0, i + 1));
        i++;
        if (i >= textToType.length) {
          clearInterval(typingInterval);
          setTimeout(() => setAiState('finished'), 400);
        }
      }, 15); // Velocidad rápida

      return () => clearInterval(typingInterval);
    }
  }, [aiState, explanation]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={aiState === 'finished' ? onClose : undefined}
            className="absolute inset-0 bg-[#0f172a]/30 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-full bg-[#111827] rounded-t-[2rem] pt-5 pb-safe px-5 border-t-2 border-[#1e293b] shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={22} className="text-[#ce82ff] fill-[#ce82ff]" />
                <span className="font-black text-white text-[18px]">
                  Duo Max
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-[#1e293b] rounded-full flex items-center justify-center text-white hover:bg-[#334155] transition-colors"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-[#ce82ff] blur-xl opacity-20 rounded-full"></div>
                <DuoBot
                  className="w-[72px] h-[72px] relative z-10"
                  state={aiState}
                />
              </div>

              <div className="flex-1 bg-[#1e293b] border-2 border-[#334155] rounded-2xl rounded-bl-none p-4 relative min-h-[90px] shadow-sm">
                {aiState === 'thinking' && (
                  <div className="h-full flex items-center pt-1">
                    <TypingDots />
                  </div>
                )}
                {(aiState === 'typing' || aiState === 'finished') && (
                  <div className="flex flex-col items-start">
                    {/* TAG DE TRUCO: SIN CÁPSULA, ESTILO DUOLINGO PURO */}
                    {trick && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 mb-2"
                      >
                        <Sparkles
                          size={16}
                          className="text-[#ffc800] fill-[#ffc800]"
                        />
                        <span className="font-black text-[#ffc800] text-[13px] uppercase tracking-widest">
                          {trick}
                        </span>
                      </motion.div>
                    )}
                    <p className="font-bold text-white/95 text-[15px] leading-relaxed whitespace-pre-wrap">
                      {displayedText}
                      {aiState === 'typing' && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          className="inline-block w-2.5 h-4 bg-[#ce82ff] ml-1 mb-[-2px] rounded-sm"
                        />
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 pb-2">
              {aiState === 'finished' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={onClose}
                  className="w-full bg-[#1cb0f6] text-white font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] border-[#1899d6] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} strokeWidth={3} />
                  ¡Entendido!
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
