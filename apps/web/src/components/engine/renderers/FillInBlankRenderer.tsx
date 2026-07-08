'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { RendererProps } from '../registry';
import type { FillInBlankView, FillInBlankAnswer } from '@ingresa-pe/domain';
import { LatexText } from '../../ui/LatexText';

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function FillInBlankRenderer({
  view,
  answer,
  status,
  onAnswer,
}: RendererProps<FillInBlankView, FillInBlankAnswer>) {
  const disabled = status !== 'idle';
  const slotCount = useMemo(
    () => (view.sentence.match(/\[slot\]/g) ?? []).length,
    [view.sentence]
  );

  // Estabilizar el banco para que no se re-baraje en cada render si view.bank
  // cambia de referencia (lo cual proviene de un objeto nuevo por pregunta).
  const bankKey = useMemo(() => view.bank.map((w) => w.id).join(','), [view.bank]);
  const shuffledBank = useMemo(() => shuffle(view.bank), [bankKey]);
  const bankById = useMemo(
    () => new Map(view.bank.map((w) => [w.id, w])),
    [bankKey]
  );

  const [slots, setSlots] = useState<((typeof view.bank)[number] | null)[]>(
    () => {
      if (answer?.type === 'FILL_IN_BLANK') {
        return answer.selectedWordIds.map((id) => bankById.get(id) ?? null);
      }
      return Array(slotCount).fill(null);
    }
  );

  const usedIds = useMemo(
    () => new Set(slots.filter(Boolean).map((s) => s!.id)),
    [slots]
  );

  const updateSlots = (
    next: ((typeof view.bank)[number] | null)[]
  ) => {
    setSlots(next);
    onAnswer({
      type: 'FILL_IN_BLANK',
      selectedWordIds: next
        .map((s) => s?.id)
        .filter((id): id is string => !!id),
    });
  };

  const fillSlot = (word: (typeof view.bank)[number]) => {
    if (disabled) return;
    const idx = slots.findIndex((s) => s === null);
    if (idx === -1) return;
    const next = [...slots];
    next[idx] = word;
    updateSlots(next);
  };

  const clearSlot = (idx: number) => {
    if (disabled) return;
    const next = [...slots];
    next[idx] = null;
    updateSlots(next);
  };

  const parts = view.sentence.split(/\[slot\]/);

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full bg-white border-2 border-[#e5e5e5] border-b-[4px] rounded-[1.5rem] p-5 shadow-sm">
        <div className="w-full text-[18px] leading-[3rem] text-[#3c3c3c]">
          {parts.map((part, i) => (
            <span key={i} className="inline">
              <span className="font-bold whitespace-pre-wrap align-middle">
                <LatexText text={part} />
              </span>
              {i < slotCount && (
                <span
                  className="inline-flex relative mx-1 align-middle"
                  style={{ minWidth: '120px', height: '44px' }}
                >
                  {/* Molde vacío */}
                  <span className="absolute inset-0 bg-[#f7f7f7] rounded-xl border-b-[3px] border-[#e5e5e5] shadow-inner pointer-events-none" />

                  {slots[i] ? (
                    <motion.button
                      layoutId={`word-block-${slots[i]!.id}`}
                      onClick={() => clearSlot(i)}
                      whileTap={!disabled ? { scale: 0.9 } : {}}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`absolute inset-0 w-full h-full border-2 border-b-[4px] rounded-xl font-black text-[16px] flex items-center justify-center z-20 bg-white border-[#84d8ff] text-[#1cb0f6] ${
                        disabled ? 'pointer-events-none' : 'active:border-b-[2px] active:translate-y-[2px]'
                      }`}
                    >
                      {slots[i]!.text}
                    </motion.button>
                  ) : null}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {shuffledBank.map((word) => {
          const isUsed = usedIds.has(word.id);
          return (
            <div key={word.id} className="relative inline-flex h-[46px]">
              {/* Fantasma para mantener el espacio */}
              <div
                className={`bg-[#f0f0f0] rounded-xl border-2 border-transparent px-4 flex items-center justify-center font-black text-[17px] text-transparent transition-opacity shadow-inner ${
                  isUsed ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {word.text}
              </div>

              {!isUsed && (
                <motion.button
                  layoutId={`word-block-${word.id}`}
                  onClick={() => fillSlot(word)}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  disabled={disabled}
                  className="absolute inset-0 w-full h-full bg-white border-2 border-b-[4px] border-[#e5e5e5] rounded-xl px-4 flex items-center justify-center font-black text-[17px] text-[#3c3c3c] hover:bg-slate-50 active:border-b-[2px] active:translate-y-[2px] z-10"
                >
                  {word.text}
                </motion.button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
