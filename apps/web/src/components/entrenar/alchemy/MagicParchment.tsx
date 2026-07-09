'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { AlchemyFormula, AlchemyIngredient } from '@ingresa-pe/domain';
import { LatexText } from '../../ui/LatexText';

interface MagicParchmentProps {
  formula: AlchemyFormula;
  selectedIngredients: AlchemyIngredient[];
  lives: number;
  maxLives: number;
}

export function MagicParchment({ formula, selectedIngredients, lives, maxLives }: MagicParchmentProps) {
  const selectedIds = new Set(selectedIngredients.map((i) => i.id));

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative w-full max-w-[340px] mx-auto mt-6 z-10"
    >
      {/* Scroll decorations top/bottom */}
      <div className="absolute -top-3 left-0 right-0 h-6 bg-[#d4c5a9] rounded-full border-2 border-[#8b7355] shadow-md z-0" />
      <div className="absolute -bottom-3 left-0 right-0 h-6 bg-[#d4c5a9] rounded-full border-2 border-[#8b7355] shadow-md z-0" />

      {/* Main parchment body */}
      <div className="relative bg-[#f4e8d3] border-x-2 border-[#8b7355] px-4 py-6 shadow-lg min-h-[140px] flex flex-col items-center justify-center text-center z-10">
        
        {/* Course ribbon */}
        <div className="absolute -top-4 bg-[#6c4298] border-2 border-[#4a2768] px-4 py-1 rounded-sm shadow-sm rotate-[-2deg]">
          <span className="font-black text-[10px] text-white uppercase tracking-widest">
            {formula.course}
          </span>
        </div>

        {/* Lives / Status */}
        <div className="absolute top-2 right-3 flex gap-1">
          {Array.from({ length: maxLives }).map((_, i) => (
            <motion.span
              key={i}
              initial={false}
              animate={{ scale: i < lives ? 1 : 0.6, opacity: i < lives ? 1 : 0.3 }}
              className="text-[16px]"
            >
              ❤️
            </motion.span>
          ))}
        </div>

        {/* The Formula Name */}
        <h2 className="font-black text-[#8b7355] text-[18px] uppercase tracking-wide mt-2">
          {formula.name}
        </h2>

        {/* The Hint */}
        <h3 className="font-bold text-[#5c4a3d] text-[16px] leading-snug mt-1 mb-4">
          {formula.hint}
        </h3>

        {/* The Blueprint (Formula Slots) */}
        <div className="flex flex-wrap items-center justify-center gap-3 bg-[#e8dbbf] px-5 py-4 rounded-xl border border-[#d4c5a9] shadow-inner">
          {formula.blueprint.map((element, index) => {
            if (element.type === 'operator') {
              return (
                <span key={`op-${index}`} className="font-black text-[22px] text-[#5c4a3d]">
                  {element.label}
                </span>
              );
            }

            const isFilled = selectedIds.has(element.id);

            return (
              <div
                key={`var-slot-${element.id}`}
                className={`relative flex items-center justify-center min-w-[44px] h-[44px] rounded-md transition-all duration-300 ${
                  isFilled ? 'bg-transparent' : 'border-2 border-dashed border-[#8b7355]/40 bg-black/5'
                }`}
              >
                {isFilled ? (
                  <>
                    {/* The magical particle flying up from cauldron */}
                    <motion.div
                      className="absolute w-5 h-5 rounded-full bg-white shadow-[0_0_20px_8px_rgba(88,204,2,0.9)] z-50 pointer-events-none"
                      initial={{ y: 250, opacity: 0, scale: 0 }}
                      animate={{ 
                        y: 0, 
                        opacity: [0, 1, 1, 0], 
                        scale: [0, 1.5, 1, 3] 
                      }}
                      transition={{ 
                        duration: 0.45, 
                        ease: 'easeOut'
                      }}
                    />

                    {/* The Revealed Answer (Illuminates upon particle impact) */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-[#58cc02] rounded-md shadow-sm border-2 border-[#458a02]"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: [1, 1.25, 1], opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.4, ease: 'easeInOut' }}
                    >
                      <span className="font-black text-[20px] text-white drop-shadow-sm">
                        {element.label}
                      </span>
                    </motion.div>
                  </>
                ) : (
                  <span className="font-black text-[20px] text-[#8b7355]/40">?</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
