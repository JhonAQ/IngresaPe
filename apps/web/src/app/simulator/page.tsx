'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TopBar,
  ProgressBar,
  QuestionHeader,
  ReadingContextCard,
  QuestionCard,
  FooterNavigation,
  AnswerBubbles,
  FichaOpticaModal,
  ExamResultScreen,
} from '../../components/simulator';
import { useSimulacro } from '../../components/simulator/useSimulacro';

export default function SimulatorPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center bg-[#f8f9fc]">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
      <SimulatorPage />
    </Suspense>
  );
}

function SimulatorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const attemptId = params.get('attemptId') ?? '';

  const {
    status,
    error,
    attempt,
    questions,
    currentIndex,
    currentQuestion,
    answers,
    markedIds,
    timeRemaining,
    isFirst,
    isLast,
    setAnswer,
    toggleMark,
    goTo,
    goNext,
    goPrev,
    submit,
    result,
  } = useSimulacro(attemptId);

  const [fichaAbierta, setFichaAbierta] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  useEffect(() => {
    if (!attemptId && status === 'loading') {
      // Sin attemptId, redirigir a simulacros
      router.replace('/simulacros');
    }
  }, [attemptId, status, router]);

  if (status === 'loading' || !currentQuestion) {
    return (
      <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center bg-[#f8f9fc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-black">Cargando examen...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center px-6 text-center bg-[#f8f9fc]">
        <div>
          <h1 className="font-black text-[22px] text-[#ea2b2b] mb-2">Ups, algo salió mal</h1>
          <p className="text-[#777777] mb-6">{error ?? 'No se pudo cargar el examen'}</p>
          <button
            onClick={() => router.push('/simulacros')}
            className="bg-[#ff4b4b] text-white font-black text-[16px] uppercase tracking-widest py-3.5 px-6 rounded-2xl border-b-[4px] border-[#df2b2b] active:border-b-0 active:translate-y-[4px] transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (status === 'completed' && result) {
    return (
      <ExamResultScreen
        result={result}
        examTitle={attempt?.examTitle}
        onRetry={() => router.refresh()}
        onHome={() => router.push('/simulacros')}
      />
    );
  }

  const selectedOptionId = currentQuestion ? answers[currentQuestion.id]?.selectedOptionId : undefined;

  return (
    <div className="w-full max-w-md mx-auto relative bg-[#f8f9fc] h-[100dvh] flex flex-col shadow-2xl overflow-hidden border-x border-slate-200">
      <TopBar
        tiempoRestante={timeRemaining}
        onClose={() => setExitConfirmOpen(true)}
      />

      <ProgressBar
        respondidas={Object.keys(answers).filter((k) => answers[k].selectedOptionId).length}
        total={questions.length}
      />

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 pb-36 custom-scrollbar relative">
        <div
          key={currentQuestion.id}
          className="animate-in slide-in-from-right-4 fade-in duration-300 w-full"
        >
          <QuestionHeader
            preguntaActual={currentIndex + 1}
            totalPreguntas={questions.length}
            area={currentQuestion.courseName}
            isMarcada={markedIds.includes(currentQuestion.id)}
            onToggleBandera={toggleMark}
          />

          <ReadingContextCard contexto={undefined} />

          <QuestionCard
            texto={currentQuestion.statement}
            opciones={currentQuestion.options}
            etiqueta={`${currentQuestion.topicName}`}
          />
        </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 bg-white z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <FooterNavigation
          onAnterior={goPrev}
          onPasar={goNext}
          onOpenFicha={() => setFichaAbierta(true)}
          isFirst={isFirst}
          isLast={isLast}
        />

        <AnswerBubbles
          questionNumber={currentIndex + 1}
          options={currentQuestion.options.map((o, i) => ({
            id: o.id,
            label: String.fromCharCode(65 + i),
          }))}
          selectedOptionId={selectedOptionId}
          onSelect={setAnswer}
        />
      </div>

      <FichaOpticaModal
        isOpen={fichaAbierta}
        onClose={() => setFichaAbierta(false)}
        questions={questions.map((q) => ({
          id: q.id,
          options: q.options.map((o, i) => ({
            id: o.id,
            label: String.fromCharCode(65 + i),
          })),
        }))}
        answers={answers}
        markedIds={markedIds}
        currentQuestionId={currentQuestion.id}
        onSelectQuestion={(index) => {
          goTo(index);
          setFichaAbierta(false);
        }}
        onSubmit={() => {
          setFichaAbierta(false);
          submit();
        }}
      />

      {exitConfirmOpen && (
        <ExitConfirmModal
          onConfirm={() => router.push('/simulacros')}
          onCancel={() => setExitConfirmOpen(false)}
        />
      )}
    </div>
  );
}

function ExitConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center px-5">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm text-center">
        <h3 className="font-black text-slate-800 text-[20px] mb-2">¿Abandonar examen?</h3>
        <p className="text-slate-500 font-bold text-[13px] mb-6">
          Tu progreso no se guardará y perderás el intento.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl active:scale-95 transition-transform"
          >
            Seguir
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#ff4b4b] text-white font-black py-3 rounded-2xl active:scale-95 transition-transform"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
