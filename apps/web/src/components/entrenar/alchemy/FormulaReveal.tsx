'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SparkleStar } from './AlchemyIcons';
import { LatexText } from '../../ui/LatexText';
import type { AlchemyFormula } from '@ingresa-pe/domain';

interface FormulaRevealProps {
  formula: AlchemyFormula;
  onContinue: () => void;
}

// Generate random particle positions
const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 280 - 140,
  y: Math.random() * -200 - 40,
  rotation: Math.random() * 360,
  scale: 0.4 + Math.random() * 0.8,
  delay: Math.random() * 0.4,
  color: ['#ffc800', '#58cc02', '#ff9600', '#1cb0f6'][
    Math.floor(Math.random() * 4)
  ],
}));

export function FormulaReveal({ formula, onContinue }: FormulaRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center flex-1 px-6 py-8 relative overflow-hidden"
    >
      {/* Sparkle particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, p.scale, 0],
            x: p.x,
            y: p.y,
            rotate: p.rotation,
          }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: 'easeOut',
          }}
          className="absolute left-1/2 top-1/2 pointer-events-none"
        >
          <SparkleStar className="w-5 h-5" color={p.color} />
        </motion.div>
      ))}

      {/* Course badge */}
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="inline-block font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#58cc02] text-white mb-4"
      >
        {formula.course}
      </motion.span>

      {/* Formula name */}
      <motion.h2
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="font-black text-[24px] text-[#3c3c3c] text-center mb-4"
      >
        {formula.name}
      </motion.h2>

      {/* Formula in LaTeX */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 12,
          delay: 0.3,
        }}
        className="bg-[#f7fff0] border-2 border-[#58cc02] border-b-[5px] rounded-2xl px-8 py-6 mb-8 shadow-sm"
      >
        <span className="font-black text-[28px] text-[#3c3c3c]">
          <LatexText text={`$$${formula.formulaLatex}$$`} />
        </span>
      </motion.div>

      {/* Success message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-bold text-[#58cc02] text-[16px] mb-6 text-center"
      >
        ¡Fórmula descubierta! +15 XP
      </motion.p>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onContinue}
        className="w-full bg-[#58cc02] text-white font-black text-[16px] uppercase tracking-widest py-4 rounded-2xl border-b-[5px] border-[#458a02] active:border-b-0 active:translate-y-[5px] transition-all"
      >
        CONTINUAR
      </motion.button>
    </motion.div>
  );
}
