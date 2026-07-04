'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEngine } from './useEngine';
import { getQuestionRenderer } from './registry';
import { EngineHeader, FeedbackDrawer, DuoMaxModal } from './SharedEngineUI';
import { LatexText } from '../ui/LatexText';
import type { ComponentType } from 'react';

export function Engine() {
  const router = useRouter();
  const params = useSearchParams();
  const topicId = params.get('topicId');
  const courseId = params.get('courseId');

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const {
    status,
    error,
    currentQuestion,
    progress,
    lives,
    answer,
    feedback,
    setAnswer,
    submit,
    continueNext,
    onClose,
  } = useEngine(topicId ?? '', courseId, {
    limit: 5,
    onClose: () => router.back(),
  });

  if (!topicId) {
    return (
      <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-black text-[22px] text-[#3c3c3c] mb-2">Falta el tema</h1>
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
    return (
      <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center">
        <div className="animate-bounce font-black text-[#58cc02] text-[20px]">Cargando preguntas…</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-black text-[22px] text-[#ea2b2b] mb-2">Ups, algo salió mal</h1>
          <p className="text-[#777777] mb-6">{error ?? 'No se pudieron cargar las preguntas'}</p>
          <button
            onClick={onClose}
            className="bg-[#ff4b4b] text-white font-black text-[16px] uppercase tracking-widest py-3.5 px-6 rounded-2xl border-b-[4px] border-[#df2b2b] active:border-b-0 active:translate-y-[4px] transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (status === 'completed' || !currentQuestion) {
    return (
      <CompletionScreen
        onClose={onClose}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const Renderer = getQuestionRenderer(currentQuestion.type) as ComponentType<any>;
  const isCheckDisabled = !answer || status === 'submitting';

  return (
    <div className="w-full max-w-md mx-auto relative bg-[#ffffff] h-[100dvh] flex flex-col font-sans border-x border-[#e5e5e5] overflow-hidden">
      <EngineHeader progress={progress} lives={lives} onClose={onClose} />

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
              status={status === 'submitting' ? 'submitting' : status === 'feedback' ? 'feedback' : 'idle'}
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
        onCheck={submit}
        onContinue={continueNext}
        onOpenAI={() => setIsAiModalOpen(true)}
      />

      <DuoMaxModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        trick="Explicación paso a paso"
        explanation={feedback?.explanation ?? currentQuestion.explanation ?? 'Sigue practicando para dominar este tema.'}
      />
    </div>
  );
}

function CompletionScreen({
  onClose,
  onRetry,
}: {
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] flex flex-col items-center justify-center px-6 text-center bg-[#d7ffb8]">
      <div className="mb-6 text-[80px]">🏆</div>
      <h1 className="font-black text-[28px] text-[#58a700] mb-3">¡Lección completada!</h1>
      <p className="text-[#3c3c3c] font-bold mb-8">
        Terminaste este set de preguntas. Vuelve mañana para seguir practicando.
      </p>
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onRetry}
          className="w-full bg-[#58cc02] text-white font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] border-[#58a700] active:border-b-0 active:translate-y-[4px] transition-all"
        >
          Repetir
        </button>
        <button
          onClick={onClose}
          className="w-full bg-white text-[#3c3c3c] font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[4px] border-[#e5e5e5] active:border-b-0 active:translate-y-[4px] transition-all"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

// Mantener compatibilidad con import antiguo si alguien sigue usando BasicQuizEngine.
export { BasicQuizEngine } from './BasicQuizEngine';
