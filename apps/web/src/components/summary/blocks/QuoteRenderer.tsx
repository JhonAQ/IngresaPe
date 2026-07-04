'use client';

import React from 'react';
import { Quote as QuoteIcon } from 'lucide-react';
import type { SummaryRendererProps } from '../registry';
import type { QuoteBlock } from '@ingresa-pe/domain';

export function QuoteRenderer({ block }: SummaryRendererProps<QuoteBlock>) {
  return (
    <blockquote className="relative bg-slate-100 rounded-2xl p-6 border-l-8 border-slate-300">
      <QuoteIcon
        size={32}
        className="absolute top-4 right-4 text-slate-300"
        strokeWidth={2.5}
      />
      <p className="text-slate-700 font-black text-lg leading-relaxed italic pr-8">
        “{block.text}”
      </p>
      {block.author && (
        <footer className="mt-3 text-sm font-bold text-slate-500">— {block.author}</footer>
      )}
    </blockquote>
  );
}
