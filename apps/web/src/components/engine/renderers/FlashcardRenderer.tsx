'use client';

import React from 'react';
import type { RendererProps } from '../registry';
import type { FlashcardView, FlashcardAnswer } from '@ingresa-pe/domain';

export function FlashcardRenderer({
  view,
  answer,
  status,
  feedback,
  onAnswer,
}: RendererProps<FlashcardView, FlashcardAnswer>) {
  const remembered = answer?.type === 'FLASHCARD' ? answer.remembered : null;
  const disabled = status !== 'idle';

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full bg-[#fff4e5] border-2 border-[#ffc800] border-b-[4px] rounded-2xl p-6 text-center">
        <p className="font-black text-[#3c3c3c] text-[20px] mb-2">{view.front}</p>
        <p className="font-bold text-[#ff9600] text-[15px]">¿Recordaste la respuesta?</p>
      </div>

      <div className="flex gap-3">
        <button
          disabled={disabled}
          onClick={() => onAnswer({ type: 'FLASHCARD', remembered: false })}
          className={`flex-1 p-4 rounded-2xl border-2 border-b-[4px] font-black text-[16px] transition-all ${
            remembered === false
              ? 'bg-[#ffdfe0] border-[#ff4b4b] border-b-[#df2b2b] text-[#ea2b2b]'
              : 'bg-white border-[#e5e5e5] border-b-[#e5e5e5] text-[#3c3c3c] hover:bg-slate-50'
          } ${disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer active:border-b-[2px] active:translate-y-[2px]'}`}
        >
          No recordé
        </button>
        <button
          disabled={disabled}
          onClick={() => onAnswer({ type: 'FLASHCARD', remembered: true })}
          className={`flex-1 p-4 rounded-2xl border-2 border-b-[4px] font-black text-[16px] transition-all ${
            remembered === true
              ? 'bg-[#d7ffb8] border-[#58cc02] border-b-[#58a700] text-[#58a700]'
              : 'bg-white border-[#e5e5e5] border-b-[#e5e5e5] text-[#3c3c3c] hover:bg-slate-50'
          } ${disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer active:border-b-[2px] active:translate-y-[2px]'}`}
        >
          Recordé
        </button>
      </div>
    </div>
  );
}
