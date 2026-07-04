'use client';

import React from 'react';
import { Lightbulb, Brain, AlertTriangle } from 'lucide-react';
import type { SummaryRendererProps } from '../registry';
import type { TipBlock } from '@ingresa-pe/domain';

const variantConfig = {
  exam: {
    icon: Lightbulb,
    container: 'bg-amber-100 border-amber-300 text-amber-800',
    iconColor: 'text-amber-500',
  },
  memory: {
    icon: Brain,
    container: 'bg-purple-100 border-purple-300 text-purple-800',
    iconColor: 'text-purple-500',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-red-100 border-red-300 text-red-800',
    iconColor: 'text-red-500',
  },
};

export function TipRenderer({ block }: SummaryRendererProps<TipBlock>) {
  const variant = block.variant ?? 'exam';
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={`border-2 rounded-2xl p-4 flex gap-3 ${config.container}`}>
      <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div>
        {block.title && (
          <h4 className="font-black text-sm mb-0.5">{block.title}</h4>
        )}
        <p className="text-sm font-medium leading-snug opacity-90">{block.text}</p>
      </div>
    </div>
  );
}
