'use client';

import React, { useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import type { RendererProps } from '../registry';
import type { OrderingView, OrderingAnswer } from '@ingresa-pe/domain';
import { LatexText } from '../../ui/LatexText';

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleItems(
  items: OrderingView['items'],
  correctOrder: string[]
): OrderingView['items'] {
  let shuffled = shuffle(items);
  const shuffledIds = shuffled.map((i) => i.id);

  // Si el azar dejó todo en orden correcto, intercambiamos los dos primeros
  // para evitar empezar resuelto.
  if (
    shuffledIds.length > 1 &&
    shuffledIds.every((id, idx) => id === correctOrder[idx])
  ) {
    const swapped = shuffled.slice();
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    return swapped;
  }

  return shuffled;
}

export function OrderingRenderer({
  view,
  answer,
  status,
  feedback,
  onAnswer,
}: RendererProps<OrderingView, OrderingAnswer>) {
  const disabled = status !== 'idle';

  const initialItems = useMemo(() => {
    if (answer?.type === 'ORDERING') {
      const byId = new Map(view.items.map((i) => [i.id, i]));
      return answer.itemIds
        .map((id) => byId.get(id))
        .filter((i): i is OrderingView['items'][number] => !!i);
    }
    return shuffleItems(view.items, view.correctOrder);
  }, [view.items, view.correctOrder, answer]);

  const [items, setItems] = useState(initialItems);

  const handleReorder = (next: OrderingView['items']) => {
    setItems(next);
    onAnswer({ type: 'ORDERING', itemIds: next.map((i) => i.id) });
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="font-bold text-[#afafaf] text-[15px] uppercase tracking-widest">
        Ordena los elementos arrastrándolos
      </p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="flex flex-col gap-3"
      >
        {items.map((item, index) => (
          <SortableItem
            key={item.id}
            item={item}
            index={index}
            disabled={disabled}
            feedback={feedback}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

interface SortableItemProps {
  item: OrderingView['items'][number];
  index: number;
  disabled: boolean;
  feedback: RendererProps<OrderingView, OrderingAnswer>['feedback'];
}

function SortableItem({ item, index, disabled, feedback }: SortableItemProps) {
  const isCorrectPos =
    feedback?.correctOrder != null && feedback.correctOrder[index] === item.id;

  const baseClasses =
    'w-full relative touch-none flex items-center p-4 rounded-2xl border-2 border-b-[4px] transition-colors';

  const stateClasses = disabled
    ? isCorrectPos
      ? 'bg-[#d7ffb8] border-[#b5e589] border-b-[#58a700] cursor-default'
      : 'bg-[#ffdfe0] border-[#ffc2c4] border-b-[#ea2b2b] cursor-default'
    : 'bg-white border-[#e5e5e5] border-b-[#cfcfcf] cursor-grab active:cursor-grabbing hover:bg-slate-50';

  const iconColor = disabled
    ? isCorrectPos
      ? 'text-[#58a700]'
      : 'text-[#ea2b2b]'
    : 'text-[#cfcfcf]';

  const numberColor = disabled
    ? isCorrectPos
      ? 'text-[#58a700]'
      : 'text-[#ea2b2b]'
    : 'text-[#afafaf]';

  return (
    <Reorder.Item
      value={item}
      dragListener={!disabled}
      className={`${baseClasses} ${stateClasses}`}
      whileDrag={{
        scale: 1.05,
        boxShadow: '0px 15px 25px rgba(0,0,0,0.1)',
        zIndex: 50,
      }}
    >
      <div className={`shrink-0 mr-3 ${iconColor}`}>
        <GripVertical size={24} strokeWidth={2.5} />
      </div>

      <div
        className={`shrink-0 w-8 h-8 rounded-full bg-white/50 border border-[#e5e5e5] flex items-center justify-center font-black text-[14px] mr-3 ${numberColor}`}
      >
        {index + 1}
      </div>

      <span className="font-bold text-[16px] text-[#3c3c3c] leading-tight">
        <LatexText text={item.text} />
      </span>
    </Reorder.Item>
  );
}
