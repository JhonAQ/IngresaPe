'use client';

import React from 'react';
import type { SummaryRendererProps } from '../registry';
import type { ParagraphBlock } from '@ingresa-pe/domain';
import { LatexText } from '../../ui/LatexText';

export function ParagraphRenderer({ block }: SummaryRendererProps<ParagraphBlock>) {
  return (
    <p className="text-slate-600 font-medium leading-relaxed">
      <LatexText text={block.text} />
    </p>
  );
}
