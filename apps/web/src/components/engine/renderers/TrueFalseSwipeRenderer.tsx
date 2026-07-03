'use client';

import React from 'react';
import type { RendererProps } from '../registry';
import type { TrueFalseView, TrueFalseAnswer } from '@ingresa-pe/domain';

export function TrueFalseSwipeRenderer({
  view,
  answer,
  status,
  onAnswer,
}: RendererProps<TrueFalseView, TrueFalseAnswer>) {
  const selected = answer?.type === 'TRUE_FALSE_SWIPE' ? answer.isTrue : null;
  const trueLabel = view.trueLabel ?? 'Verdadero';
  const falseLabel = view.falseLabel ?? 'Falso';
  const disabled = status !== 'idle';

  return (
    <div className="flex flex-col gap-4">
      <button
        disabled={disabled}
        onClick={() => onAnswer({ type: 'TRUE_FALSE_SWIPE', isTrue: true })}
        className={`w-full p-5 rounded-2xl border-2 border-b-[4px] font-black text-[18px] transition-all ${
          selected === true
            ? 'bg-[#d7ffb8] border-[#58cc02] border-b-[#58a700] text-[#58a700]'
            : 'bg-white border-[#e5e5e5] border-b-[#e5e5e5] text-[#3c3c3c] hover:bg-slate-50'
        } ${disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer active:border-b-[2px] active:translate-y-[2px]'}`}
      >
        {trueLabel}
      </button>
      <button
        disabled={disabled}
        onClick={() => onAnswer({ type: 'TRUE_FALSE_SWIPE', isTrue: false })}
        className={`w-full p-5 rounded-2xl border-2 border-b-[4px] font-black text-[18px] transition-all ${
          selected === false
            ? 'bg-[#ffdfe0] border-[#ff4b4b] border-b-[#df2b2b] text-[#ea2b2b]'
            : 'bg-white border-[#e5e5e5] border-b-[#e5e5e5] text-[#3c3c3c] hover:bg-slate-50'
        } ${disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer active:border-b-[2px] active:translate-y-[2px]'}`}
      >
        {falseLabel}
      </button>
    </div>
  );
}
