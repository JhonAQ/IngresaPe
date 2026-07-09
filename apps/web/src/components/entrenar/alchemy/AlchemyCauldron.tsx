'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlchemyCauldronSVG } from './AlchemyIcons';

interface AlchemyCauldronProps {
  bubbleIntensity: 'idle' | 'active' | 'error' | 'success';
}

export const AlchemyCauldron = forwardRef<HTMLDivElement, AlchemyCauldronProps>(
  ({ bubbleIntensity }, ref) => {
    return (
      <motion.div
        ref={ref}
        className="relative w-64 h-56 mx-auto mt-4 z-20"
        animate={
          bubbleIntensity === 'error'
            ? { x: [-12, 12, -8, 8, -4, 4, 0] }
            : bubbleIntensity === 'success'
              ? { scale: [1, 1.1, 1], y: [0, 10, 0] }
              : bubbleIntensity === 'active'
                ? { scale: [1, 1.02, 1] }
                : { scale: 1, x: 0, y: 0 }
        }
        transition={
          bubbleIntensity === 'error'
            ? { duration: 0.5, ease: 'easeInOut' }
            : bubbleIntensity === 'success'
              ? { duration: 0.6, ease: 'easeInOut' }
              : bubbleIntensity === 'active'
                ? { duration: 0.3, ease: 'easeInOut' }
                : { duration: 0.5, type: 'spring' }
        }
      >
        {/* Glow behind cauldron when active/success/error */}
        <div
          className={`absolute inset-0 blur-3xl -z-10 transition-opacity duration-300 ${
            bubbleIntensity === 'success'
              ? 'bg-[#58cc02] opacity-40'
              : bubbleIntensity === 'error'
                ? 'bg-[#ff4b4b] opacity-40'
                : 'bg-transparent opacity-0'
          }`}
          style={{ transform: 'scale(1.5) translateY(20px)' }}
        />

        {/* Cauldron SVG */}
        <AlchemyCauldronSVG bubbleIntensity={bubbleIntensity} />

        {/* 'Mouth' target indicator area (visual only, actual hitbox is the ref bounding box) */}
        {bubbleIntensity === 'idle' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-8 border-2 border-dashed border-white/20 rounded-[100%] animate-pulse pointer-events-none" />
        )}
      </motion.div>
    );
  }
);
AlchemyCauldron.displayName = 'AlchemyCauldron';
