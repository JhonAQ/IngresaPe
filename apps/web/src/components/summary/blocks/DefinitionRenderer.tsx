'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import type { SummaryRendererProps } from '../registry';
import type { DefinitionBlock } from '@ingresa-pe/domain';

export function DefinitionRenderer({ block }: SummaryRendererProps<DefinitionBlock>) {
  return (
    <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-indigo-400 mt-1">
          <Quote size={20} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">Definición</p>
          <h4 className="text-xl font-black text-indigo-900 leading-tight">{block.term}</h4>
          <p className="text-indigo-800 font-medium leading-relaxed mt-2">{block.definition}</p>
        </div>
      </div>
    </div>
  );
}
