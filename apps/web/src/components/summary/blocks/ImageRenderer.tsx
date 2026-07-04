'use client';

import React from 'react';
import type { SummaryRendererProps } from '../registry';
import type { ImageBlock } from '@ingresa-pe/domain';

export function ImageRenderer({ block }: SummaryRendererProps<ImageBlock>) {
  return (
    <figure className="space-y-2">
      <img
        src={block.src}
        alt={block.alt}
        className="w-full h-48 object-cover rounded-2xl border-2 border-slate-300"
      />
      {block.caption && (
        <figcaption className="text-center text-xs font-bold text-slate-500">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
