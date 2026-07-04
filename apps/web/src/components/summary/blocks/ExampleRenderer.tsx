'use client';

import React from 'react';
import type { SummaryRendererProps } from '../registry';
import type { ExampleBlock } from '@ingresa-pe/domain';
import { LatexText } from '../../ui/LatexText';

export function ExampleRenderer({ block }: SummaryRendererProps<ExampleBlock>) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-slate-800 px-5 py-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ejemplo resuelto</p>
        {block.title && <h4 className="font-black text-white text-lg">{block.title}</h4>}
      </div>
      <div className="bg-white p-5 space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Problema</p>
          <p className="text-slate-700 font-medium leading-relaxed">
            <LatexText text={block.problem} />
          </p>
        </div>
        <div className="bg-green-50 border-2 border-green-100 rounded-xl p-4">
          <p className="text-xs font-black uppercase tracking-widest text-green-600 mb-1">Solución</p>
          <p className="text-green-900 font-medium leading-relaxed">
            <LatexText text={block.solution} />
          </p>
        </div>
      </div>
    </div>
  );
}
