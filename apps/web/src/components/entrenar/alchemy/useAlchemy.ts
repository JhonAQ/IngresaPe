'use client';

import { useState, useCallback, useMemo } from 'react';
import type { AlchemyFormula, AlchemyIngredient } from '@ingresa-pe/domain';
import { ALCHEMY_FORMULAS } from '@ingresa-pe/domain';

// ============================================================================
// Types
// ============================================================================

export type AlchemyPhase =
  | 'intro'
  | 'playing'
  | 'roundSuccess'
  | 'gameOver'
  | 'completed';

export interface AlchemyState {
  phase: AlchemyPhase;
  currentRoundIndex: number;
  totalRounds: number;
  lives: number;
  maxLives: number;
  timeLeft: number; // added for timer
  maxTime: number; // added for timer
  score: number;
  xpEarned: number;
  coinsEarned: number;
  formulasDiscovered: AlchemyFormula[];
  currentFormula: AlchemyFormula | null;
  availableIngredients: AlchemyIngredient[];
  selectedIngredients: AlchemyIngredient[];
  incorrectIds: string[];
  lastActionResult: 'correct' | 'incorrect' | 'complete' | 'timeUp' | null;
}

// ============================================================================
// Helpers
// ============================================================================

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandomFormulas(count: number): AlchemyFormula[] {
  const shuffled = shuffleArray(ALCHEMY_FORMULAS);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ============================================================================
// Hook
// ============================================================================

const TOTAL_ROUNDS = 5;
const MAX_LIVES = 3;
const ROUND_TIME = 45; // 45 seconds per round
const XP_PER_FORMULA = 15;
const COINS_PER_FORMULA = 5;
const BONUS_PERFECT = 25;

export function useAlchemy() {
  const [formulas] = useState<AlchemyFormula[]>(() =>
    pickRandomFormulas(TOTAL_ROUNDS)
  );

  const [state, setState] = useState<AlchemyState>({
    phase: 'intro',
    currentRoundIndex: 0,
    totalRounds: Math.min(TOTAL_ROUNDS, formulas.length),
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    timeLeft: ROUND_TIME,
    maxTime: ROUND_TIME,
    score: 0,
    xpEarned: 0,
    coinsEarned: 0,
    formulasDiscovered: [],
    currentFormula: null,
    availableIngredients: [],
    selectedIngredients: [],
    incorrectIds: [],
    lastActionResult: null,
  });

  const correctIds = useMemo(() => {
    if (!state.currentFormula) return new Set<string>();
    return new Set(state.currentFormula.correctIngredients.map((i) => i.id));
  }, [state.currentFormula]);

  const startGame = useCallback(() => {
    const formula = formulas[0];
    const allIngredients = shuffleArray([
      ...formula.correctIngredients,
      ...formula.distractors,
    ]);

    setState((prev) => ({
      ...prev,
      phase: 'playing',
      currentRoundIndex: 0,
      currentFormula: formula,
      availableIngredients: allIngredients,
      selectedIngredients: [],
      incorrectIds: [],
      lastActionResult: null,
      timeLeft: ROUND_TIME,
    }));
  }, [formulas]);

  const tickTimer = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'playing' || prev.timeLeft <= 0 || prev.lastActionResult === 'complete') {
        return prev;
      }
      
      const newTime = prev.timeLeft - 1;
      
      if (newTime <= 0) {
        // Time is up!
        const newLives = prev.lives - 1;
        return {
          ...prev,
          timeLeft: 0,
          lives: Math.max(0, newLives),
          lastActionResult: 'timeUp',
        };
      }
      
      return {
        ...prev,
        timeLeft: newTime,
      };
    });
  }, []);

  const selectIngredient = useCallback(
    (ingredient: AlchemyIngredient) => {
      setState((prev) => {
        if (prev.phase !== 'playing' || !prev.currentFormula) return prev;

        // Already selected or already marked incorrect
        if (
          prev.selectedIngredients.some((i) => i.id === ingredient.id) ||
          prev.incorrectIds.includes(ingredient.id)
        ) {
          return prev;
        }

        const isCorrect = correctIds.has(ingredient.id);

        if (isCorrect) {
          const newSelected = [...prev.selectedIngredients, ingredient];
          const allCorrectSelected =
            newSelected.length ===
            prev.currentFormula.correctIngredients.length;

          if (allCorrectSelected) {
            const newXp = prev.xpEarned + XP_PER_FORMULA;
            const newCoins = prev.coinsEarned + COINS_PER_FORMULA;
            return {
              ...prev,
              selectedIngredients: newSelected,
              lastActionResult: 'complete',
              score: prev.score + 1,
              xpEarned: newXp,
              coinsEarned: newCoins,
              formulasDiscovered: [
                ...prev.formulasDiscovered,
                prev.currentFormula,
              ],
              // We'll transition to roundSuccess after a short delay in the component
            };
          }

          return {
            ...prev,
            selectedIngredients: newSelected,
            lastActionResult: 'correct',
          };
        } else {
          // Incorrect
          const newLives = prev.lives - 1;
          const newIncorrectIds = [...prev.incorrectIds, ingredient.id];

          if (newLives <= 0) {
            return {
              ...prev,
              lives: 0,
              incorrectIds: newIncorrectIds,
              lastActionResult: 'incorrect',
              // Will transition to gameOver
            };
          }

          return {
            ...prev,
            lives: newLives,
            incorrectIds: newIncorrectIds,
            lastActionResult: 'incorrect',
          };
        }
      });
    },
    [correctIds]
  );

  const goToRoundSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'roundSuccess',
    }));
  }, []);

  const goToGameOver = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'gameOver',
    }));
  }, []);

  const nextRound = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentRoundIndex + 1;

      if (nextIndex >= prev.totalRounds) {
        // Game completed!
        const bonusXp =
          prev.lives === prev.maxLives ? BONUS_PERFECT : 0;
        return {
          ...prev,
          phase: 'completed' as AlchemyPhase,
          xpEarned: prev.xpEarned + bonusXp,
        };
      }

      const formula = formulas[nextIndex];
      const allIngredients = shuffleArray([
        ...formula.correctIngredients,
        ...formula.distractors,
      ]);

      return {
        ...prev,
        phase: 'playing' as AlchemyPhase,
        currentRoundIndex: nextIndex,
        currentFormula: formula,
        availableIngredients: allIngredients,
        selectedIngredients: [],
        incorrectIds: [],
        lastActionResult: null,
        timeLeft: ROUND_TIME,
      };
    });
  }, [formulas]);

  const resetGame = useCallback(() => {
    const newFormulas = pickRandomFormulas(TOTAL_ROUNDS);
    const formula = newFormulas[0];
    const allIngredients = shuffleArray([
      ...formula.correctIngredients,
      ...formula.distractors,
    ]);

    setState({
      phase: 'intro',
      currentRoundIndex: 0,
      totalRounds: Math.min(TOTAL_ROUNDS, newFormulas.length),
      lives: MAX_LIVES,
      maxLives: MAX_LIVES,
      timeLeft: ROUND_TIME,
      maxTime: ROUND_TIME,
      score: 0,
      xpEarned: 0,
      coinsEarned: 0,
      formulasDiscovered: [],
      currentFormula: formula,
      availableIngredients: allIngredients,
      selectedIngredients: [],
      incorrectIds: [],
      lastActionResult: null,
    });
  }, []);

  return {
    state,
    startGame,
    selectIngredient,
    tickTimer,
    goToRoundSuccess,
    goToGameOver,
    nextRound,
    resetGame,
  };
}

