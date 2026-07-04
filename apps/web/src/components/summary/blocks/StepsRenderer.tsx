'use client';

import React from 'react';
import type { SummaryRendererProps } from '../registry';
import type { StepsBlock } from '@ingresa-pe/domain';

export function StepsRenderer({ block }: SummaryRendererProps<StepsBlock>) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-slate-200" />
      <div className="space-y-4">
        {block.items.map((item, index) => (
          <div key={index} className="relative flex gap-4">
            <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-black shadow-md">
              {index + 1}
            </div>
            <div className="flex-1 bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
              <h4 className="font-black text-slate-800 leading-tight">{item.title}</h4>
              <p className="text-slate-500 text-sm font-medium leading-snug mt-1">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
