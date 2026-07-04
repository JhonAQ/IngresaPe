'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { SummaryRendererProps } from '../registry';
import type { KeyPointsBlock } from '@ingresa-pe/domain';

export function KeyPointsRenderer({ block }: SummaryRendererProps<KeyPointsBlock>) {
  return (
    <div className="space-y-3">
      {block.items.map((item, index) => (
        <div
          key={index}
          className="flex gap-3 bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm"
        >
          <div className="mt-0.5 flex-shrink-0 text-green-500">
            <CheckCircle2 size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 leading-tight">{item.title}</h4>
            <p className="text-slate-500 mt-1 text-sm font-medium leading-snug">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
