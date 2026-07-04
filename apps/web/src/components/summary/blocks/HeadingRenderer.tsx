'use client';

import React from 'react';
import type { SummaryRendererProps } from '../registry';
import type { HeadingBlock } from '@ingresa-pe/domain';

export function HeadingRenderer({ block }: SummaryRendererProps<HeadingBlock>) {
  const sizeClasses = {
    1: 'text-3xl font-black leading-tight',
    2: 'text-2xl font-black leading-tight',
    3: 'text-xl font-bold leading-snug',
  };

  return <h2 className={`text-slate-800 ${sizeClasses[block.level]}`}>{block.text}</h2>;
}
