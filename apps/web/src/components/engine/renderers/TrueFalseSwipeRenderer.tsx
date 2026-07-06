'use client';

import React from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type MotionValue,
} from 'framer-motion';
import type { RendererProps } from '../registry';
import type { TrueFalseView, TrueFalseAnswer, SwipeCategory } from '@ingresa-pe/domain';
import { LatexText } from '../../ui/LatexText';

const SWIPE_THRESHOLD = 80;
const SWIPE_MAX = 160;

interface ModernTrueFalseView extends TrueFalseView {
  category: { left: SwipeCategory; right: SwipeCategory };
}

export function TrueFalseSwipeRenderer({
  view,
  answer,
  status,
  onAnswer,
}: RendererProps<TrueFalseView, TrueFalseAnswer>) {
  const isModern = view.category != null;

  if (!isModern) {
    return (
      <LegacyTrueFalseButtons
        view={view}
        answer={answer}
        status={status}
        onAnswer={onAnswer}
      />
    );
  }

  return (
    <SwipeArcade
      view={view as ModernTrueFalseView}
      answer={answer}
      status={status}
      onAnswer={onAnswer}
    />
  );
}

// =============================================================================
// LEGACY: botones Verdadero / Falso
// =============================================================================

function LegacyTrueFalseButtons({
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

// =============================================================================
// ARCADE: tarjeta deslizable con labels, stamps y botones de acción
// =============================================================================

function SwipeArcade({
  view,
  answer,
  status,
  onAnswer,
}: RendererProps<ModernTrueFalseView, TrueFalseAnswer>) {
  const disabled = status !== 'idle';
  const selectedSide =
    answer?.type === 'TRUE_FALSE_SWIPE' ? answer.side : undefined;

  const x = useMotionValue(0);
  const controls = useAnimation();

  const leftProgress = useTransform(x, (v) =>
    Math.max(0, Math.min(1, -v / SWIPE_THRESHOLD))
  );
  const rightProgress = useTransform(x, (v) =>
    Math.max(0, Math.min(1, v / SWIPE_THRESHOLD))
  );

  const cardRotate = useTransform(x, [-SWIPE_MAX, SWIPE_MAX], [-10, 10]);
  const cardScale = useTransform(
    x,
    [-SWIPE_MAX, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, SWIPE_MAX],
    [0.96, 0.99, 1, 0.99, 0.96]
  );

  const { left, right } = view.category;
  const cardText = view.cardText?.trim() || 'Desliza hacia la categoría correcta';

  const commit = (side: 'left' | 'right') => {
    if (disabled || selectedSide) return;
    // Pequeño movimiento de confirmación y volvemos al centro para que el stamp
    // quede visible sin salirse de la pantalla.
    void controls.start({
      x: side === 'right' ? 28 : -28,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    });
    onAnswer({ type: 'TRUE_FALSE_SWIPE', side });
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (disabled || selectedSide) return;
    if (info.offset.x > SWIPE_THRESHOLD) {
      commit('right');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      commit('left');
    } else {
      void controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Área de swipe */}
      <div className="relative flex-1 flex items-center justify-center min-h-[260px] overflow-visible">
        {/* Labels laterales */}
        <SwipeLabel category={left} progress={leftProgress} align="left" />
        <SwipeLabel category={right} progress={rightProgress} align="right" />

        {/* Tarjeta arrastrable */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x, rotate: cardRotate, scale: cardScale }}
          className="relative z-10 w-[260px] min-h-[260px] bg-white rounded-[2rem] shadow-[0_12px_0_#e5e5e5] border-2 border-[#e5e5e5] flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing"
        >
          {/* Stamp superpuesto */}
          <SwipeStamp side="left" category={left} progress={leftProgress} selected={selectedSide === 'left'} />
          <SwipeStamp side="right" category={right} progress={rightProgress} selected={selectedSide === 'right'} />

          {/* Contenido de la tarjeta */}
          <div className="text-center">
            <p className="font-black text-[22px] text-[#3c3c3c] leading-tight">
              <LatexText text={cardText} />
            </p>
          </div>

          {/* Indicador de arrastre */}
          <div className="absolute bottom-4 w-12 h-1.5 bg-[#e5e5e5] rounded-full" />
        </motion.div>
      </div>

      {/* Botones de acción */}
      <SwipeActionButtons
        left={left}
        right={right}
        selectedSide={selectedSide}
        disabled={disabled}
        onSelect={commit}
      />
    </div>
  );
}

// =============================================================================
// SUBCOMPONENTES
// =============================================================================

interface SwipeLabelProps {
  category: SwipeCategory;
  progress: MotionValue<number>;
  align: 'left' | 'right';
}

function SwipeLabel({ category, progress, align }: SwipeLabelProps) {
  const opacity = useTransform(progress, [0, 1], [0.65, 1]);
  const scale = useTransform(progress, [0, 1], [0.9, 1.12]);

  return (
    <motion.div
      style={{
        opacity,
        scale,
        transformOrigin: align === 'left' ? 'left center' : 'right center',
      }}
      className={`absolute top-1/2 -translate-y-1/2 z-0 px-3.5 py-2 rounded-xl border-2 border-b-[4px] bg-white shadow-[0_4px_0_#e5e5e5] whitespace-nowrap ${
        align === 'left' ? 'left-4' : 'right-4'
      }`}
    >
      <span
        className="font-black text-[15px] uppercase tracking-wider"
        style={{ color: category.darkColor }}
      >
        {category.label}
      </span>
    </motion.div>
  );
}

interface SwipeStampProps {
  side: 'left' | 'right';
  category: SwipeCategory;
  progress: MotionValue<number>;
  selected: boolean;
}

function SwipeStamp({ side, category, progress, selected }: SwipeStampProps) {
  const opacity = useTransform(progress, [0, 0.5, 1], [0, 1, 1]);

  return (
    <motion.div
      style={{ opacity: selected ? 1 : opacity }}
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
        side === 'left' ? '-rotate-12' : 'rotate-12'
      }`}
    >
      <div
        className="px-5 py-3 rounded-2xl border-4 border-dashed font-black text-[28px] uppercase tracking-widest backdrop-blur-sm"
        style={{
          color: category.darkColor,
          borderColor: category.color,
          backgroundColor: `${category.color}33`,
        }}
      >
        {category.label}
      </div>
    </motion.div>
  );
}

interface SwipeActionButtonsProps {
  left: SwipeCategory;
  right: SwipeCategory;
  selectedSide?: 'left' | 'right';
  disabled: boolean;
  onSelect: (side: 'left' | 'right') => void;
}

function SwipeActionButtons({
  left,
  right,
  selectedSide,
  disabled,
  onSelect,
}: SwipeActionButtonsProps) {
  const makeStyle = (category: SwipeCategory) => ({
    backgroundColor: category.color,
    borderBottomColor: category.darkColor,
  });

  return (
    <div className="flex items-center justify-center gap-4 mt-6 mb-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('left')}
        style={makeStyle(left)}
        className={`flex-1 py-3.5 rounded-2xl border-b-[4px] font-black text-[15px] uppercase tracking-widest text-white transition-all active:border-b-0 active:translate-y-[4px] ${
          disabled ? 'opacity-60 pointer-events-none' : ''
        } ${selectedSide === 'left' ? 'ring-4 ring-white/50' : ''}`}
      >
        ← {left.label}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('right')}
        style={makeStyle(right)}
        className={`flex-1 py-3.5 rounded-2xl border-b-[4px] font-black text-[15px] uppercase tracking-widest text-white transition-all active:border-b-0 active:translate-y-[4px] ${
          disabled ? 'opacity-60 pointer-events-none' : ''
        } ${selectedSide === 'right' ? 'ring-4 ring-white/50' : ''}`}
      >
        {right.label} →
      </button>
    </div>
  );
}
