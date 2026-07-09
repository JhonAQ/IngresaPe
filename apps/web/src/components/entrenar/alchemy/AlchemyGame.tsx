'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useAlchemy } from './useAlchemy';
import { AlchemyCauldron } from './AlchemyCauldron';
import { FormulaReveal } from './FormulaReveal';
import { AlchemyResults } from './AlchemyResults';
import { AlchemyCauldronSVG, SparkleStar } from './AlchemyIcons';
import { MagicParchment } from './MagicParchment';
import { DraggableRune } from './DraggableRune';
import { TimerBar } from './TimerBar';
import type { AlchemyIngredient } from '@ingresa-pe/domain';

// ============================================================================
// Intro Screen (Dark Theme)
// ============================================================================
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
      {/* Background sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            y: [0, -40, -80],
            x: (i % 2 === 0 ? 1 : -1) * (30 + i * 20),
          }}
          transition={{
            duration: 2.5 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute"
          style={{ left: `${20 + i * 10}%`, bottom: '20%' }}
        >
          <SparkleStar className="w-5 h-5" color={['#58cc02', '#1cb0f6', '#ce82ff'][i % 3]} />
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        className="w-64 h-56 mb-8"
      >
        <AlchemyCauldronSVG bubbleIntensity="active" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-black text-[38px] text-white text-center leading-tight mb-3 drop-shadow-md"
      >
        El Alquimista
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="font-bold text-slate-300 text-[16px] text-center mb-6 max-w-[280px]"
      >
        Arrastra las variables hacia el caldero para completar la receta antes de que estalle.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="w-full max-w-[300px] bg-[#58cc02] text-white font-black text-[18px] uppercase tracking-widest py-4 rounded-2xl border-b-[6px] border-[#458a02] active:border-b-0 active:translate-y-[6px] transition-all shadow-xl z-10"
      >
        INICIAR EXPERIMENTO
      </motion.button>
    </div>
  );
}

// ============================================================================
// Playing Screen (Drag & Drop)
// ============================================================================
function PlayingScreen({
  formula,
  availableIngredients,
  selectedIngredients,
  lastActionResult,
  lives,
  maxLives,
  timeLeft,
  maxTime,
  onSelect,
  tickTimer,
}: {
  formula: NonNullable<ReturnType<typeof useAlchemy>['state']['currentFormula']>;
  availableIngredients: ReturnType<typeof useAlchemy>['state']['availableIngredients'];
  selectedIngredients: ReturnType<typeof useAlchemy>['state']['selectedIngredients'];
  lastActionResult: ReturnType<typeof useAlchemy>['state']['lastActionResult'];
  lives: number;
  maxLives: number;
  timeLeft: number;
  maxTime: number;
  onSelect: (ingredient: AlchemyIngredient) => void;
  tickTimer: () => void;
}) {
  const cauldronRef = useRef<HTMLDivElement>(null);

  // Timer loop
  useEffect(() => {
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  // Check collision when a rune is dropped
  const handleDrop = useCallback(
    (ingredient: AlchemyIngredient, info: PanInfo) => {
      if (!cauldronRef.current) return;

      const cauldronRect = cauldronRef.current.getBoundingClientRect();
      const dropX = info.point.x;
      const dropY = info.point.y;

      // Expand the hitbox slightly to make it more forgiving
      const hitBoxPadding = 20;
      const hit =
        dropX >= cauldronRect.left - hitBoxPadding &&
        dropX <= cauldronRect.right + hitBoxPadding &&
        dropY >= cauldronRect.top - hitBoxPadding &&
        dropY <= cauldronRect.bottom + hitBoxPadding;

      if (hit) {
        onSelect(ingredient);
      }
    },
    [onSelect]
  );

  const bubbleIntensity =
    lastActionResult === 'complete'
      ? 'success'
      : lastActionResult === 'incorrect' || lastActionResult === 'timeUp'
        ? 'error'
        : lastActionResult === 'correct'
          ? 'active'
          : 'idle';

  // Filter out correctly dropped ingredients so they disappear from the board
  const activeRunes = availableIngredients.filter(
    (ing) => !selectedIngredients.some((sel) => sel.id === ing.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 transition-colors duration-300 ${
        lastActionResult === 'incorrect' || lastActionResult === 'timeUp'
          ? 'animate-[shake_0.5s_ease-in-out]'
          : ''
      }`}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px) rotate(-2deg); }
          75% { transform: translateX(10px) rotate(2deg); }
        }
      `}</style>

      {/* The Hint / Recipe Scroll */}
      <MagicParchment
        formula={formula}
        selectedIngredients={selectedIngredients}
        lives={lives}
        maxLives={maxLives}
      />

      {/* The Cauldron Dropzone */}
      <div className="flex-1 flex flex-col items-center justify-center mt-6">
        <TimerBar timeLeft={timeLeft} maxTime={maxTime} />
        <AlchemyCauldron ref={cauldronRef} bubbleIntensity={bubbleIntensity} />
      </div>

      {/* The scattered Runes */}
      <div className="relative h-48 w-full mt-auto mb-8 px-4 flex flex-wrap justify-center content-center gap-4 z-30">
        <AnimatePresence>
          {activeRunes.map((ingredient) => (
            <motion.div
              key={ingredient.id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, y: -50 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <DraggableRune
                ingredient={ingredient}
                onDrop={handleDrop}
                disabled={lastActionResult === 'complete' || lastActionResult === 'timeUp'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Close button - absolute top left */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white/70 transition-colors backdrop-blur-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main AlchemyGame Component
// ============================================================================
export function AlchemyGame() {
  const router = useRouter();
  const {
    state,
    startGame,
    selectIngredient,
    tickTimer,
    goToRoundSuccess,
    goToGameOver,
    nextRound,
    resetGame,
  } = useAlchemy();

  const handleClose = useCallback(() => {
    router.push('/entrenar');
  }, [router]);

  // Auto-transition after formula complete
  useEffect(() => {
    if (state.lastActionResult === 'complete' && state.phase === 'playing') {
      const timer = setTimeout(() => {
        goToRoundSuccess();
      }, 1000); // give time for the success animation
      return () => clearTimeout(timer);
    }
  }, [state.lastActionResult, state.phase, goToRoundSuccess]);

  // Auto-transition to game over when lives reach 0 or time runs out on last life
  useEffect(() => {
    if (state.lives <= 0 && state.phase === 'playing') {
      const timer = setTimeout(() => {
        goToGameOver();
      }, 800); // give time for the error shake animation
      return () => clearTimeout(timer);
    }
  }, [state.lives, state.phase, goToGameOver]);

  // Auto-transition to next round if time runs out but player has lives
  useEffect(() => {
    if (state.lastActionResult === 'timeUp' && state.lives > 0 && state.phase === 'playing') {
      const timer = setTimeout(() => {
        nextRound();
      }, 1500); // give time for the error explosion, then move on
      return () => clearTimeout(timer);
    }
  }, [state.lastActionResult, state.lives, state.phase, nextRound]);

  return (
    <div
      className="w-full max-w-md mx-auto relative bg-slate-900 flex flex-col font-sans overflow-hidden shadow-2xl"
      style={{ height: '100dvh' }}
    >
      <AnimatePresence mode="wait">
        {state.phase === 'intro' && (
          <motion.div key="intro" className="absolute inset-0 flex flex-col z-10">
            <IntroScreen onStart={startGame} />
          </motion.div>
        )}

        {state.phase === 'playing' && state.currentFormula && (
          <motion.div key={`round-${state.currentRoundIndex}`} className="absolute inset-0 flex flex-col z-10">
            <PlayingScreen
              formula={state.currentFormula}
              availableIngredients={state.availableIngredients}
              selectedIngredients={state.selectedIngredients}
              lastActionResult={state.lastActionResult}
              lives={state.lives}
              maxLives={state.maxLives}
              timeLeft={state.timeLeft}
              maxTime={state.maxTime}
              onSelect={selectIngredient}
              tickTimer={tickTimer}
            />
          </motion.div>
        )}

        {state.phase === 'roundSuccess' && state.currentFormula && (
          <motion.div
            key={`reveal-${state.currentRoundIndex}`}
            className="absolute inset-0 flex flex-col z-20 bg-white"
          >
            <FormulaReveal
              formula={state.currentFormula}
              onContinue={nextRound}
            />
          </motion.div>
        )}

        {(state.phase === 'completed' || state.phase === 'gameOver') && (
          <motion.div key="results" className="absolute inset-0 flex flex-col z-20">
            <AlchemyResults
              variant={state.phase === 'completed' ? 'completed' : 'gameOver'}
              formulasDiscovered={state.formulasDiscovered}
              totalRounds={state.totalRounds}
              xpEarned={state.xpEarned}
              coinsEarned={state.coinsEarned}
              livesRemaining={state.lives}
              onRetry={resetGame}
              onClose={handleClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
