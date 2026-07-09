'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LatexText } from '../../ui/LatexText';
import { SparkleStar } from './AlchemyIcons';
import type { AlchemyFormula } from '@ingresa-pe/domain';

interface AlchemyResultsProps {
  variant: 'completed' | 'gameOver';
  formulasDiscovered: AlchemyFormula[];
  totalRounds: number;
  xpEarned: number;
  coinsEarned: number;
  livesRemaining: number;
  onRetry: () => void;
  onClose: () => void;
}

export function AlchemyResults({
  variant,
  formulasDiscovered,
  totalRounds,
  xpEarned,
  coinsEarned,
  livesRemaining,
  onRetry,
  onClose,
}: AlchemyResultsProps) {
  const isCompleted = variant === 'completed';
  const isPerfect = isCompleted && livesRemaining === 3;

  return (
    <div
      className={`flex-1 flex flex-col items-center px-6 pt-10 pb-8 overflow-y-auto hide-scrollbar ${
        isCompleted ? 'bg-[#d7ffb8]' : 'bg-[#ffdfe0]'
      }`}
    >
      {/* Emoji / icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="mb-4 text-[72px]"
      >
        {isPerfect ? '🏆' : isCompleted ? '🧪' : '💔'}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`font-black text-[28px] mb-2 text-center ${
          isCompleted ? 'text-[#458a02]' : 'text-[#ea2b2b]'
        }`}
      >
        {isPerfect
          ? '¡Alquimista Perfecto!'
          : isCompleted
            ? '¡Pociones completadas!'
            : '¡Se acabaron las vidas!'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="font-bold text-[#3c3c3c] text-center mb-6 text-[14px]"
      >
        {isCompleted
          ? `Descubriste ${formulasDiscovered.length} de ${totalRounds} fórmulas`
          : 'Perdiste todas las vidas. ¡Inténtalo de nuevo!'}
      </motion.p>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-6 mb-8"
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <SparkleStar className="w-5 h-5" color="#ffc800" />
            <span className="font-black text-[22px] text-[#ffc800]">
              {xpEarned}
            </span>
          </div>
          <span className="font-bold text-[11px] text-[#afafaf] uppercase tracking-wider">
            XP
          </span>
        </div>
        <div className="w-px h-8 bg-[#e5e5e5]" />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span className="text-[18px]">🪙</span>
            <span className="font-black text-[22px] text-[#ff9600]">
              {coinsEarned}
            </span>
          </div>
          <span className="font-bold text-[11px] text-[#afafaf] uppercase tracking-wider">
            Monedas
          </span>
        </div>
        <div className="w-px h-8 bg-[#e5e5e5]" />
        <div className="flex flex-col items-center">
          <span className="font-black text-[22px] text-[#58cc02]">
            {formulasDiscovered.length}/{totalRounds}
          </span>
          <span className="font-bold text-[11px] text-[#afafaf] uppercase tracking-wider">
            Fórmulas
          </span>
        </div>
      </motion.div>

      {/* Discovered formulas list */}
      {formulasDiscovered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full mb-8"
        >
          <h3 className="font-black text-[13px] text-[#afafaf] uppercase tracking-widest mb-3 text-center">
            Fórmulas descubiertas
          </h3>
          <div className="flex flex-col gap-2">
            {formulasDiscovered.map((formula, i) => (
              <motion.div
                key={formula.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="bg-white rounded-2xl border-2 border-[#e5e5e5] border-b-[4px] px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-[14px] text-[#3c3c3c]">
                    {formula.name}
                  </span>
                  <span className="ml-2 font-bold text-[11px] text-[#afafaf] uppercase">
                    {formula.course}
                  </span>
                </div>
                <span className="font-bold text-[14px] text-[#3c3c3c]">
                  <LatexText text={`$${formula.formulaLatex}$`} />
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full mt-auto"
      >
        <button
          onClick={onRetry}
          className={`w-full font-black text-[16px] uppercase tracking-widest py-4 rounded-2xl border-b-[5px] active:border-b-0 active:translate-y-[5px] transition-all ${
            isCompleted
              ? 'bg-[#58cc02] text-white border-[#458a02]'
              : 'bg-[#ff4b4b] text-white border-[#df2b2b]'
          }`}
        >
          {isCompleted ? 'JUGAR DE NUEVO' : 'REINTENTAR'}
        </button>
        <button
          onClick={onClose}
          className="w-full bg-white text-[#3c3c3c] font-black text-[16px] uppercase tracking-widest py-4 rounded-2xl border-b-[5px] border-[#e5e5e5] active:border-b-0 active:translate-y-[5px] transition-all"
        >
          VOLVER
        </button>
      </motion.div>
    </div>
  );
}
