'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { SummaryBlock } from '@ingresa-pe/domain';
import { getSummaryRenderer } from './registry';

interface SummaryBlocksProps {
  blocks: SummaryBlock[];
  accentColor?: string;
}

export function SummaryBlocks({ blocks, accentColor }: SummaryBlocksProps) {
  if (!blocks.length) {
    return (
      <p className="text-slate-500 font-medium text-center py-8">
        No hay contenido de resumen disponible.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const Renderer = getSummaryRenderer(block.type) as React.ComponentType<{
          block: SummaryBlock;
          accentColor?: string;
        }>;

        return (
          <motion.div
            key={`${block.type}-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
          >
            <Renderer block={block} accentColor={accentColor} />
          </motion.div>
        );
      })}
    </div>
  );
}
