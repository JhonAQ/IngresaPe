'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

  const [selected, setSelected] = useState<{ id: string; side: 'left' | 'right' } | null>(
    null
  );
  const [mismatch, setMismatch] = useState<{ leftId: string; rightId: string } | null>(
    null
  );
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  // Desaparecer lentamente los pares ya emparejados (estilo Duolingo).
  useEffect(() => {
    const newlyMatched = matchedPairIds.filter((id) => !removedIds.includes(id));
    if (newlyMatched.length === 0) return;

    const timer = window.setTimeout(() => {
      setRemovedIds((prev) => [...prev, ...newlyMatched]);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [matchedPairIds, removedIds]);

  const isMatched = (id: string) => matchedPairIds.includes(id);
  const isRemoved = (id: string) => removedIds.includes(id);
  const isMismatched = (id: string) =>
    mismatch?.leftId === id || mismatch?.rightId === id;

  const triggerMismatch = (leftId: string, rightId: string) => {
    setMismatch({ leftId, rightId });
    window.setTimeout(() => setMismatch(null), 550);
  };

  const confirmMatch = (id: string) => {
    if (isMatched(id)) return;
    const next = [...matchedPairIds, id];
    onAnswer({ type: 'MATCHING', matchedPairIds: next });
  };

  const handleItemClick = (side: 'left' | 'right', id: string) => {
    if (disabled || isMatched(id) || isRemoved(id)) return;

    if (!selected) {
      setSelected({ id, side });
      return;
    }

    // Deseleccionar si toca el mismo item.
    if (selected.id === id && selected.side === side) {
      setSelected(null);
      return;
    }

    // Cambiar selección dentro del mismo lado.
    if (selected.side === side) {
      setSelected({ id, side });
      return;
    }

    // Selección cruzada.
    if (selected.id === id) {
      confirmMatch(id);
    } else {
      const leftId = selected.side === 'left' ? selected.id : id;
      const rightId = selected.side === 'left' ? id : selected.id;
      triggerMismatch(leftId, rightId);
    }
    setSelected(null);
  };

  const baseButtonClasses =
    'w-full p-4 rounded-2xl border-2 border-b-[4px] text-center flex items-center justify-center overflow-hidden';

  const getItemClasses = (id: string) => {
    if (isMismatched(id)) {
      return `${baseButtonClasses} border-[#ff4b4b] border-b-[#df2b2b] bg-[#ffdfe0] cursor-default`;
    }
    if (isMatched(id)) {
      return `${baseButtonClasses} border-[#58cc02] border-b-[#58a700] bg-[#d7ffb8] cursor-default`;
    }
    if (selected?.id === id) {
      return `${baseButtonClasses} border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]`;
    }
    return `${baseButtonClasses} border-[#e5e5e5] border-b-[#e5e5e5] bg-white hover:bg-slate-50 cursor-pointer transition-colors`;
  };

  const getTextColor = (id: string) => {
    if (isMismatched(id)) return 'text-[#ea2b2b]';
    if (isMatched(id)) return 'text-[#58a700]';
    if (selected?.id === id) return 'text-[#1cb0f6]';
    return 'text-[#3c3c3c]';
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-4">
        {/* Columna izquierda */}
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-3">
            {leftItems
              .filter((item) => !isRemoved(item.id))
              .map((item) => (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    isMatched(item.id)
                      ? { opacity: 0, scale: 0, x: 0 }
                      : isMismatched(item.id)
                      ? { x: [0, -10, 10, -10, 10, -5, 5, 0] }
                      : { opacity: 1, scale: 1, x: 0 }
                  }
                  exit={{ opacity: 0, scale: 0 }}
                  transition={
                    isMismatched(item.id)
                      ? { duration: 0.45 }
                      : { layout: { type: 'spring', stiffness: 300, damping: 25 } }
                  }
                  whileTap={
                    !disabled && !isMatched(item.id) ? { scale: 0.96 } : {}
                  }
                  onClick={() => handleItemClick('left', item.id)}
                  className={getItemClasses(item.id)}
                >
                  <span className={`font-bold text-[16px] ${getTextColor(item.id)}`}>
                    <LatexText text={item.text} />
                  </span>
                </motion.button>
              ))}
          </div>
        </AnimatePresence>

        {/* Columna derecha */}
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-3">
            {rightItems
              .filter((item) => !isRemoved(item.id))
              .map((item) => (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    isMatched(item.id)
                      ? { opacity: 0, scale: 0, x: 0 }
                      : isMismatched(item.id)
                      ? { x: [0, 10, -10, 10, -10, 5, -5, 0] }
                      : { opacity: 1, scale: 1, x: 0 }
                  }
                  exit={{ opacity: 0, scale: 0 }}
                  transition={
                    isMismatched(item.id)
                      ? { duration: 0.45 }
                      : { layout: { type: 'spring', stiffness: 300, damping: 25 } }
                  }
                  whileTap={
                    !disabled && !isMatched(item.id) ? { scale: 0.96 } : {}
                  }
                  onClick={() => handleItemClick('right', item.id)}
                  className={getItemClasses(item.id)}
                >
                  <span className={`font-bold text-[16px] ${getTextColor(item.id)}`}>
                    <LatexText text={item.text} />
                  </span>
                </motion.button>
              ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
