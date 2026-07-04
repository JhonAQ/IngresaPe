'use client';

import React from 'react';
import { BlockMath } from 'react-katex';
import type { SummaryRendererProps } from '../registry';
import type { FormulaBlock } from '@ingresa-pe/domain';
import 'katex/dist/katex.min.css';

export function FormulaRenderer({ block }: SummaryRendererProps<FormulaBlock>) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      {block.label && (
        <p className="text-slate-400 text-[10px] font-black mb-3 uppercase tracking-widest">
          {block.label}
        </p>
      )}
      <div className="text-white overflow-x-auto">
        <BlockMath
          math={block.latex}
          renderError={(error) => (
            <span className="text-red-400 text-sm font-medium">{error.message}</span>
          )}
        />
      </div>
    </div>
  );
}
