'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
  const [fadingIds, setFadingIds] = useState<string[]>([]);
  const [fadedIds, setFadedIds] = useState<string[]>([]);

  // Cuando un par se empareja, lo marcamos verde y luego lo desvanecemos poco a poco.
  useEffect(() => {
    const newlyMatched = matchedPairIds.filter((id) => !fadingIds.includes(id));
    if (newlyMatched.length === 0) return;

    setFadingIds((prev) => [...prev, ...newlyMatched]);

    const timer = window.setTimeout(() => {
      setFadedIds((prev) => [...prev, ...newlyMatched]);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [matchedPairIds, fadingIds]);

  const isMatched = (id: string) => matchedPairIds.includes(id);
  const isFaded = (id: string) => fadedIds.includes(id);
  const isSelected = (id: string, side: 'left' | 'right') =>
    selected?.id === id && selected?.side === side;
  const isMismatched = (id: string, side: 'left' | 'right') =>
    (side === 'left' && mismatch?.leftId === id) ||
    (side === 'right' && mismatch?.rightId === id);

  const triggerMismatch = (leftId: string, rightId: string) => {
    setMismatch({ leftId, rightId });
    window.setTimeout(() => setMismatch(null), 550);
  };

  const confirmMatch = (id: string) => {
    if (isMatched(id)) return;
    const next = [...matchedPairIds, id];
    setSelected(null);
    onAnswer({ type: 'MATCHING', matchedPairIds: next });
  };

  const handleItemClick = (side: 'left' | 'right', id: string) => {
    if (disabled || isMatched(id) || isFaded(id)) return;

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
      setSelected(null);
    }
  };

  const baseButtonClasses =
    'w-full p-4 rounded-2xl border-2 border-b-[4px] text-center flex items-center justify-center overflow-hidden';

  const getItemClasses = (id: string, side: 'left' | 'right') => {
    if (isMismatched(id, side)) {
      return `${baseButtonClasses} border-[#ff4b4b] border-b-[#df2b2b] bg-[#ffdfe0] cursor-default`;
    }
    if (isFaded(id)) {
      return `${baseButtonClasses} border-[#58cc02] border-b-[#58a700] bg-[#d7ffb8] opacity-0 pointer-events-none cursor-default transition-opacity duration-700`;
    }
    if (isMatched(id)) {
      return `${baseButtonClasses} border-[#58cc02] border-b-[#58a700] bg-[#d7ffb8] cursor-default transition-opacity duration-700`;
    }
    if (isSelected(id, side)) {
      return `${baseButtonClasses} border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]`;
    }
    return `${baseButtonClasses} border-[#e5e5e5] border-b-[#e5e5e5] bg-white hover:bg-slate-50 cursor-pointer transition-colors`;
  };

  const getTextColor = (id: string, side: 'left' | 'right') => {
    if (isMismatched(id, side)) return 'text-[#ea2b2b]';
    if (isMatched(id) || isFaded(id)) return 'text-[#58a700]';
    if (isSelected(id, side)) return 'text-[#1cb0f6]';
    return 'text-[#3c3c3c]';
  };

  const renderItem = (side: 'left' | 'right', item: MatchingItem) => {
    const id = item.id;
    const shake = isMismatched(id, side)
      ? side === 'left'
        ? { x: [0, -10, 10, -10, 10, -5, 5, 0] }
        : { x: [0, 10, -10, 10, -10, 5, -5, 0] }
      : { x: 0 };

    return (
      <motion.button
        key={id}
        animate={shake}
        transition={{ duration: 0.45 }}
        whileTap={
          !disabled && !isMatched(id) && !isFaded(id) ? { scale: 0.96 } : {}
        }
        onClick={() => handleItemClick(side, id)}
        className={getItemClasses(id, side)}
      >
        <span className={`font-bold text-[16px] ${getTextColor(id, side)}`}>
          <LatexText text={item.text} />
        </span>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-4">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => renderItem('left', item))}
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-3">
          {rightItems.map((item) => renderItem('right', item))}
        </div>
      </div>
    </div>
  );
}
