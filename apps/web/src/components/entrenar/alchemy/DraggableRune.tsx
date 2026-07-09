'use client';

import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import type { AlchemyIngredient } from '@ingresa-pe/domain';

interface DraggableRuneProps {
  ingredient: AlchemyIngredient;
  onDrop: (ingredient: AlchemyIngredient, info: PanInfo) => void;
  disabled?: boolean;
}

export function DraggableRune({ ingredient, onDrop, disabled }: DraggableRuneProps) {
  // We use a slight random rotation to make them look scattered organically
  const randomRotate = React.useMemo(() => Math.random() * 20 - 10, []);

  return (
    <motion.div
      drag={!disabled}
      dragSnapToOrigin={true}
      dragElastic={0.2}
      whileDrag={{ scale: 1.2, zIndex: 50, rotate: 0, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        if (!disabled) {
          onDrop(ingredient, info);
        }
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: disabled ? 0 : 1, 
        scale: disabled ? 0 : 1,
        rotate: disabled ? 0 : randomRotate
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative flex items-center justify-center 
        w-16 h-16 rounded-full cursor-grab
        bg-gradient-to-br from-[#1c1f2e] to-[#2a2f45]
        border-2 border-[#454c6b] border-b-[4px]
        shadow-[0_4px_15px_rgba(0,0,0,0.5)]
        touch-none select-none
      `}
      style={{
        // Add a subtle inner glow
        boxShadow: 'inset 0 0 10px rgba(88, 204, 2, 0.2), 0 4px 15px rgba(0,0,0,0.5)',
      }}
    >
      {/* Outer magical ring */}
      <div className="absolute inset-1 rounded-full border border-[#58cc02]/30 border-dashed" />
      
      <span className="font-black text-[18px] text-[#a7f06a] drop-shadow-md z-10 pointer-events-none">
        {ingredient.label}
      </span>
    </motion.div>
  );
}
