'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EngineHeader, FeedbackDrawer, DinoMaxModal, ExitConfirmModal } from './SharedEngineUI';
import { useExitConfirm } from './useExitConfirm';

// ============================================================================
// DATOS MOCK PARA EL ENGINE
// ============================================================================
const quizData = [
  {
    id: 1,
    trick: 'Truquito de Despeje',
    prompt: 'Calcula el valor de X en la siguiente ecuación:',
    formula: '2x + 5 = 17',
    options: [
      { id: 'a', text: 'x = 4' },
      { id: 'b', text: 'x = 6' },
      { id: 'c', text: 'x = 8' },
      { id: 'd', text: 'x = 12' },
    ],
    correctAnswer: 'b',
    explanation:
      "¡Vamos paso a paso! Tenemos la ecuación: 2x + 5 = 17. Nuestro objetivo es dejar a la 'x' sola.\n\nPrimero, pasamos el 5 (que está sumando) al otro lado restando: 17 - 5 = 12. Ahora nos queda 2x = 12.\n\nComo el 2 está multiplicando a la x, lo pasamos dividiendo: 12 / 2 = 6. ¡Por lo tanto, x = 6! Sigue practicando.",
  },
  {
    id: 2,
    trick: 'Dato Frecuente UNSA',
    prompt: 'Selecciona la organela responsable de la respiración celular:',
    options: [
      { id: 'a', text: 'Aparato de Golgi' },
      { id: 'b', text: 'Lisosoma' },
      { id: 'c', text: 'Mitocondria' },
      { id: 'd', text: 'Ribosoma' },
    ],
    correctAnswer: 'c',
    explanation:
      "¡Atención aquí! La mitocondria es conocida como la 'central energética' de la célula eucariota. En ella ocurre la respiración celular, un proceso vital que toma la glucosa y el oxígeno para convertirlos en ATP (energía pura). ¡Recuérdalo para tu examen!",
  },
];

export function BasicQuizEngine({ onClose }: { onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'checked'>('idle');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lives, setLives] = useState(5);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const question = quizData[currentIndex];
  const progress = (currentIndex / quizData.length) * 100;

  const handleCloseRequest = () => setIsExitModalOpen(true);
  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    onClose();
  };
  const handleCancelExit = () => setIsExitModalOpen(false);

  useExitConfirm(isExitModalOpen, handleCloseRequest, handleCancelExit);

  const handleSelect = (id: string) => {
    if (status === 'idle') setSelectedOption(id);
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setStatus('checked');
    if (!correct) setLives((prev) => Math.max(0, prev - 1));
  };

  const handleContinue = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setStatus('idle');
      setIsCorrect(null);
    } else {
      alert('¡Lección Completada! Ganaste +15 monedas');
      onClose();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative bg-[#ffffff] h-[100dvh] flex flex-col font-sans border-x border-[#e5e5e5] overflow-hidden">
      <EngineHeader progress={progress} lives={lives} onClose={handleCloseRequest} />

      <main className="flex-1 overflow-y-auto hide-scrollbar px-5 pt-6 pb-40 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            <h2
              className={`font-black text-[24px] text-[#3c3c3c] leading-tight ${
                question.formula ? 'mb-6' : 'mb-8'
              }`}
            >
              {question.prompt}
            </h2>

            {question.formula && (
              <div className="mb-8 w-full bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-2xl p-6 flex justify-center items-center">
                <span className="font-black text-[32px] text-[#1cb0f6] tracking-wider">
                  {question.formula}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;

                const baseClasses =
                  'w-full p-4 rounded-2xl border-2 border-b-[4px] text-center transition-all active:border-b-[2px] active:translate-y-[2px] flex items-center justify-center';
                const unselectedClasses =
                  'border-[#e5e5e5] border-b-[#e5e5e5] bg-white hover:bg-slate-50';
                const selectedClasses =
                  'border-[#84d8ff] border-b-[#1899d6] bg-[#ddf4ff]';

                const disabledClass =
                  status === 'checked'
                    ? 'pointer-events-none opacity-60'
                    : 'cursor-pointer';
                const finalOpacity =
                  status === 'checked' && isSelected
                    ? 'opacity-100'
                    : disabledClass;

                return (
                  <motion.button
                    key={opt.id}
                    whileTap={status === 'idle' ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(opt.id)}
                    className={`${baseClasses} ${
                      isSelected ? selectedClasses : unselectedClasses
                    } ${finalOpacity}`}
                  >
                    <span
                      className={`font-bold text-[18px] ${
                        isSelected ? 'text-[#1cb0f6]' : 'text-[#3c3c3c]'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <FeedbackDrawer
        status={status}
        isCorrect={isCorrect}
        isCheckDisabled={!selectedOption}
        correctAnswerText={
          question.options.find((o) => o.id === question.correctAnswer)?.text
        }
        onCheck={handleCheck}
        onContinue={handleContinue}
        onOpenAI={() => setIsAiModalOpen(true)}
      />

      <DinoMaxModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        trick={question.trick}
        explanation={question.explanation}
      />

      <ExitConfirmModal
        isOpen={isExitModalOpen}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  );
}
