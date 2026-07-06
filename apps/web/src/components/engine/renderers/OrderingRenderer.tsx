'use client';

import React, { useState } from 'react';
import type { RendererProps } from '../registry';
import type { OrderingView, OrderingAnswer } from '@ingresa-pe/domain';

export function OrderingRenderer({
  view,
  answer,
  status,
  feedback,
  onAnswer,
}: RendererProps<OrderingView, OrderingAnswer>) {
  const [items, setItems] = useState(view.items);
  const disabled = status !== 'idle';

  const moveItem = (index: number, direction: number) => {
    if (disabled) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(newIndex, 0, moved);
    setItems(next);
    onAnswer({ type: 'ORDERING', itemIds: next.map((i) => i.id) });
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-4 rounded-2xl border-2 border-b-[4px] border-[#e5e5e5] bg-white"
        >
          <div className="flex-1 font-bold text-[#3c3c3c] text-[16px]">{item.text}</div>
          <div className="flex gap-1">
            <button
              disabled={disabled || index === 0}
              onClick={() => moveItem(index, -1)}
              className="w-9 h-9 rounded-xl bg-[#e5e5e5] font-black text-[#3c3c3c] disabled:opacity-40"
            >
              ↑
            </button>
            <button
              disabled={disabled || index === items.length - 1}
              onClick={() => moveItem(index, 1)}
              className="w-9 h-9 rounded-xl bg-[#e5e5e5] font-black text-[#3c3c3c] disabled:opacity-40"
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
