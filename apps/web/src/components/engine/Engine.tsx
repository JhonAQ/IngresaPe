'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEngine } from './useEngine';
import { useExitConfirm } from './useExitConfirm';
import { getQuestionRenderer } from './registry';
import {
  EngineHeader,
  FeedbackDrawer,
  DinoMaxModal,
  ExitConfirmModal,
} from './SharedEngineUI';
import { LatexText } from '../ui/LatexText';
import { EngineSkeleton } from '../ui/skeleton';
import { CompletionScreen } from './CompletionScreen';
import { NodeFailedScreen } from './NodeFailedScreen';
import type { MatchingView, FillInBlankView } from '@ingresa-pe/domain';
import type { ComponentType } from 'react';

export function Engine() {
  const router = useRouter();
  const params = useSearchParams();
  const topicId = params.get('topicId');
  const courseId = params.get('courseId');
  const nodeIndex = Math.max(0, parseInt(params.get('nodeIndex') ?? '0', 10));
  const nodeSize = Math.max(1, parseInt(params.get('nodeSize') ?? '7', 10));

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const {
    status,
    error,
    currentQuestion,
    progress,
    lives,
    answer,
    feedback,
    questions,
    correctCount,
    totalRewards,
    durationSeconds,
    streakIncremented,
    setAnswer,
    submit,
    continueNext,
    onClose: handleConfirmExit,
  } = useEngine(topicId ?? '', courseId, {
    nodeIndex,
    nodeSize,
    onClose: () => {
      if (courseId) {
        router.replace(`/dashboard?courseId=${courseId}`);
      } else {
        router.replace('/cursos');
      }
    },
  });

  const handleCloseRequest = () => setIsExitModalOpen(true);
  const handleCancelExit = () => setIsExitModalOpen(false);

  useExitConfirm(isExitModalOpen, handleCloseRequest, handleCancelExit);

  const isMatching = currentQuestion?.type === 'MATCHING';
  const matchingTotal = isMatching
    ? (currentQuestion.content as MatchingView).pairs.length
    : 0;

  const isTrueFalseSwipe = currentQuestion?.type === 'TRUE_FALSE_SWIPE';
  const isFillInBlank = currentQuestion?.type === 'FILL_IN_BLANK';
  const fillBlankSlotCount = isFillInBlank
    ? (
        (currentQuestion.content as FillInBlankView).sentence.match(
          /\[slot\]/g
        ) ?? []
      ).length
    : 0;

  useEffect(() => {
    if (status !== 'idle') return;

    if (
      isMatching &&
      answer?.type === 'MATCHING' &&
      answer.matchedPairIds.length === matchingTotal
    ) {
      submit();
    }

    if (isTrueFalseSwipe && answer?.type === 'TRUE_FALSE_SWIPE') {
      submit();
    }
  }, [isMatching, isTrueFalseSwipe, answer, matchingTotal, status, submit]);

  if (!topicId) {
    return (
      <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-black text-[22px] text-[#3c3c3c] mb-2">
            Falta el tema
          </h1>
          <p className="text-[#777777] mb-6">
            Selecciona un tema desde el dashboard para empezar a practicar.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#58cc02] text-white font-black text-[16px] uppercase tracking-widest py-3.5 px-6 rounded-2xl border-b-[4px] border-[#58a700] active:border-b-0 active:translate-y-[4px] transition-all"
          >
            Ir al dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return <EngineSkeleton />;
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-black text-[22px] text-[#ea2b2b] mb-2">
            Ups, algo salió mal
          </h1>
          <p className="text-[#777777] mb-6">
            {error ?? 'No se pudieron cargar las preguntas'}
          </p>
          <button
            onClick={handleConfirmExit}
            className="bg-[#ff4b4b] text-white font-black text-[16px] uppercase tracking-widest py-3.5 px-6 rounded-2xl border-b-[4px] border-[#df2b2b] active:border-b-0 active:translate-y-[4px] transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <NodeFailedScreen
        onClose={handleConfirmExit}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (status === 'completed' || !currentQuestion) {
    return (
      <CompletionScreen
        onClose={handleConfirmExit}
        correctCount={correctCount}
        totalQuestions={questions.length}
        xpGained={totalRewards.xp}
        coinsGained={totalRewards.coins}
        durationSeconds={durationSeconds}
        streakIncremented={streakIncremented}
      />
    );
  }

  const Renderer = getQuestionRenderer(
    currentQuestion.type
  ) as ComponentType<any>;

  const isAnswerComplete =
    !!answer &&
    (answer.type !== 'FILL_IN_BLANK' ||
      answer.selectedWordIds.length === fillBlankSlotCount);

  const showAIFeedback = currentQuestion?.type !== 'MATCHING';

  const isCheckDisabled = !isAnswerComplete || status === 'submitting';

  return (
    <div className="w-full max-w-md mx-auto relative bg-[#ffffff] h-[100dvh] flex flex-col font-sans border-x border-[#e5e5e5] overflow-hidden">
      <EngineHeader
        progress={progress}
        lives={lives}
        onClose={handleCloseRequest}
      />

      <main className="flex-1 overflow-y-auto hide-scrollbar px-5 pt-6 pb-40 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            <h2 className="font-black text-[24px] text-[#3c3c3c] leading-tight mb-8">
              <LatexText text={currentQuestion.statement} />
            </h2>

            <Renderer
              view={currentQuestion.content}
              answer={answer}
              status={
                status === 'submitting'
                  ? 'submitting'
                  : status === 'feedback'
                  ? 'feedback'
                  : 'idle'
              }
              feedback={feedback}
              onAnswer={setAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <FeedbackDrawer
        status={status === 'feedback' ? 'checked' : 'idle'}
        isCorrect={feedback?.isCorrect ?? null}
        isCheckDisabled={isCheckDisabled}
        correctAnswerText={feedback?.correctAnswerText}
        hideCheck={isMatching || isTrueFalseSwipe}
        showAIFeedback={showAIFeedback}
        onCheck={submit}
        onContinue={continueNext}
        onOpenAI={() => setIsAiModalOpen(true)}
      />

      <DinoMaxModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        trick="Explicación paso a paso"
        explanation={
          feedback?.explanation ??
          currentQuestion.explanation ??
          'Sigue practicando para dominar este tema.'
        }
      />

      <ExitConfirmModal
        isOpen={isExitModalOpen}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  );
}

// Mantener compatibilidad con import antiguo si alguien sigue usando BasicQuizEngine.
export { BasicQuizEngine } from './BasicQuizEngine';
