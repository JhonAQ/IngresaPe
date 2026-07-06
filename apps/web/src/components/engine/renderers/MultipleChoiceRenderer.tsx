'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { RendererProps } from '../registry';
import type { MultipleChoiceView, MultipleChoiceAnswer } from '@ingresa-pe/domain';
import { LatexText } from '../../ui/LatexText';

export function MultipleChoiceRenderer({
  view,
  answer,
  status,
  feedback,
  onAnswer,
}: RendererProps<MultipleChoiceView, MultipleChoiceAnswer>) {
  const selectedOptionId = answer?.type === 'MULTIPLE_CHOICE' ? answer.selectedOptionId : null;

  return (
    <div className="flex flex-col gap-3">
      {view.options.map((opt) => {
        const isSelected = selectedOptionId === opt.id;

        const baseClasses =
          'w-full p-4 rounded-2xl border-2 border-b-[4px] text-center transition-all active:border-b-[2px] active:translate-y-[2px] flex items-center justify-center';
        const unselectedClasses =
          'border-[#e5e5e5] border-b-[#e5e5e5] bg-white hover:bg-slate-50';
        const selectedClasses =
          'border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]';

        const disabledClass =
          status !== 'idle' ? 'pointer-events-none opacity-60' : 'cursor-pointer';
        const finalOpacity =
          status === 'feedback' && isSelected ? 'opacity-100' : disabledClass;

        return (
          <motion.button
            key={opt.id}
            whileTap={status === 'idle' ? { scale: 0.98 } : {}}
            onClick={() => onAnswer({ type: 'MULTIPLE_CHOICE', selectedOptionId: opt.id })}
            className={`${baseClasses} ${
              isSelected ? selectedClasses : unselectedClasses
            } ${finalOpacity}`}
          >
            <span
              className={`font-bold text-[18px] ${
                isSelected ? 'text-[#1cb0f6]' : 'text-[#3c3c3c]'
              }`}
            >
              <LatexText
                text={opt.text}
                className={`font-bold text-[18px] ${
                  isSelected ? 'text-[#1cb0f6]' : 'text-[#3c3c3c]'
                }`}
              />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
