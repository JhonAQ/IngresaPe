'use client';

import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { SummaryRendererProps } from '../registry';
import type { CalloutBlock } from '@ingresa-pe/domain';

const toneConfig = {
  info: {
    icon: Info,
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    iconColor: 'text-blue-500',
  },
  success: {
    icon: CheckCircle2,
    container: 'bg-green-50 border-green-200 text-green-900',
    iconColor: 'text-green-500',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    iconColor: 'text-amber-500',
  },
  danger: {
    icon: XCircle,
    container: 'bg-red-50 border-red-200 text-red-900',
    iconColor: 'text-red-500',
  },
};

export function CalloutRenderer({ block }: SummaryRendererProps<CalloutBlock>) {
  const tone = block.tone ?? 'info';
  const config = toneConfig[tone];
  const Icon = config.icon;

  return (
    <div className={`border-2 rounded-2xl p-4 flex gap-3 ${config.container}`}>
      <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
        <Icon size={22} strokeWidth={2.5} />
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
