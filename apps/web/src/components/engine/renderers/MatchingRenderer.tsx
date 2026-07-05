'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RendererProps } from '../registry';
import type { MatchingView, MatchingAnswer } from '@ingresa-pe/domain';
import { LatexText } from '../../ui/LatexText';

interface MatchingItem {
  id: string;
  text: string;
}

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function MatchingRenderer({
  view,
  answer,
  status,
  onAnswer,
}: RendererProps<MatchingView, MatchingAnswer>) {
  const disabled = status !== 'idle';
  const matchedPairIds = answer?.type === 'MATCHING' ? answer.matchedPairIds : [];

  const leftItems = useMemo<MatchingItem[]>(
    () => shuffle(view.pairs.map((p) => ({ id: p.id, text: p.left }))),
    [view.pairs]
  );
  const rightItems = useMemo<MatchingItem[]>(
    () => shuffle(view.pairs.map((p) => ({ id: p.id, text: p.right }))),
    [view.pairs]
  );

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);

  const isMatched = (id: string) => matchedPairIds.includes(id);

  const triggerShake = (id: string) => {
    setShakingId(id);
    window.setTimeout(() => setShakingId(null), 400);
  };

  const confirmMatch = (id: string) => {
    if (isMatched(id)) return;
    const next = [...matchedPairIds, id];
    onAnswer({ type: 'MATCHING', matchedPairIds: next });
    setSelectedLeftId(null);
    setSelectedRightId(null);
  };

  const handleLeftClick = (id: string) => {
    if (disabled || isMatched(id)) return;

    if (selectedRightId) {
      if (selectedRightId === id) {
        confirmMatch(id);
      } else {
        triggerShake(id);
      }
      setSelectedRightId(null);
      return;
    }

    setSelectedLeftId((prev) => (prev === id ? null : id));
  };

  const handleRightClick = (id: string) => {
    if (disabled || isMatched(id)) return;

    if (selectedLeftId) {
      if (selectedLeftId === id) {
        confirmMatch(id);
      } else {
        triggerShake(id);
      }
      setSelectedLeftId(null);
      return;
    }

    setSelectedRightId((prev) => (prev === id ? null : id));
  };

  const baseButtonClasses =
    'w-full p-4 rounded-2xl border-2 border-b-[4px] text-center transition-all active:border-b-[2px] active:translate-y-[2px] flex items-center justify-center';

  const getItemClasses = (side: 'left' | 'right', id: string) => {
    const matched = isMatched(id);
    const selected =
      (side === 'left' && selectedLeftId === id) ||
      (side === 'right' && selectedRightId === id);

    if (matched) {
      return `${baseButtonClasses} border-[#58cc02] border-b-[#58a700] bg-[#d7ffb8] cursor-default`;
    }
    if (selected) {
      return `${baseButtonClasses} border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]`;
    }
    return `${baseButtonClasses} border-[#e5e5e5] border-b-[#e5e5e5] bg-white hover:bg-slate-50 cursor-pointer`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => {
            const matched = isMatched(item.id);
            return (
              <motion.button
                key={item.id}
                animate={
                  shakingId === item.id
                    ? { x: [0, -6, 6, -6, 6, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.35 }}
                whileTap={!disabled && !matched ? { scale: 0.98 } : {}}
                onClick={() => handleLeftClick(item.id)}
                className={getItemClasses('left', item.id)}
              >
                <span
                  className={`font-bold text-[16px] ${
                    matched
                      ? 'text-[#58a700]'
                      : selectedLeftId === item.id
                      ? 'text-[#1cb0f6]'
                      : 'text-[#3c3c3c]'
                  }`}
                >
                  <LatexText text={item.text} />
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-3">
          {rightItems.map((item) => {
            const matched = isMatched(item.id);
            return (
              <motion.button
                key={item.id}
                animate={
                  shakingId === item.id
                    ? { x: [0, -6, 6, -6, 6, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.35 }}
                whileTap={!disabled && !matched ? { scale: 0.98 } : {}}
                onClick={() => handleRightClick(item.id)}
                className={getItemClasses('right', item.id)}
              >
                <span
                  className={`font-bold text-[16px] ${
                    matched
                      ? 'text-[#58a700]'
                      : selectedRightId === item.id
                      ? 'text-[#1cb0f6]'
                      : 'text-[#3c3c3c]'
                  }`}
                >
                  <LatexText text={item.text} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Pares completados */}
      <AnimatePresence>
        {matchedPairIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {view.pairs
              .filter((p) => matchedPairIds.includes(p.id))
              .map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#d7ffb8] border-2 border-[#58cc02] text-[#58a700] font-black text-[12px]"
                >
                  <LatexText text={p.left} /> → <LatexText text={p.right} />
                </span>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
