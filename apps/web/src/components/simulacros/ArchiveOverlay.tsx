'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Library, FileText } from 'lucide-react';
import { useImmersiveOverlay } from '../dashboard/ImmersiveOverlayContext';
import { ArchiveExamCard } from './ArchiveExamCard';
import { trpc } from '../../utils/trpc';

const filters = ['Todos', 'Ordinario', 'CEPRUNSA', '2024', '2023'];

export function ArchiveOverlay() {
  const { mode, close } = useImmersiveOverlay();
  const [activeFilter, setActiveFilter] = useState('Todos');

  const { data: profile } = trpc.profile.getMe.useQuery();
  const { data: exams = [], isLoading } = trpc.simulacro.getArchiveExams.useQuery();
  const startAttempt = trpc.simulacro.startArchiveAttempt.useMutation({
    onSuccess: (data) => {
      window.location.href = `/simulator?attemptId=${data.attemptId}`;
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const isOpen = mode === 'archive';
  const isPremium = profile?.isPremium ?? false;

  if (!isOpen) return null;

  const filteredExams = exams.filter((exam) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Ordinario') return exam.type === 'ORDINARIO';
    if (activeFilter === 'CEPRUNSA') return exam.type === 'CEPRUNSA';
    if (activeFilter === '2024') return exam.year === 2024;
    if (activeFilter === '2023') return exam.year === 2023;
    return true;
  });

  const handleStart = (examId: string, locked: boolean) => {
    if (locked || startAttempt.isPending) return;
    startAttempt.mutate({ examId });
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* Header sticky con X */}
      <header className="sticky top-0 z-50 bg-white px-4 pt-4 pb-3 border-b-2 border-slate-100 flex items-center gap-4">
        <button
          onClick={() => close()}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Cerrar"
        >
          <X size={24} strokeWidth={3} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Library size={22} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-[22px] leading-tight tracking-tight text-slate-800 truncate">
              Archivo Histórico
            </h2>
            <p className="text-[12px] font-bold text-slate-400 truncate">
              Exámenes reales de admisión pasados
            </p>
          </div>
        </div>
      </header>

      {/* Contenido scrollable */}
      <main className="flex-1 overflow-y-auto hide-scrollbar p-5 pb-8">
        {/* Filtros */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-4 -mx-5 px-5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 px-5 py-2.5 rounded-[12px] font-black text-[12px] uppercase tracking-widest transition-all border-2 border-b-[4px] active:border-b-[2px] active:translate-y-[2px]
                ${
                  activeFilter === filter
                    ? 'bg-error-500 text-white border-transparent border-b-error-600'
                    : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 border-b-slate-300'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Banner premium */}
        {!isPremium && (
          <div className="mb-5 bg-amber-50 border-2 border-amber-200 rounded-[1.5rem] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-black text-amber-800 text-[13px] leading-tight">
                Archivo histórico exclusivo para Premium
              </p>
              <p className="text-amber-700 font-bold text-[11px] mt-0.5">
                Suscríbete para acceder a exámenes reales de admisión pasados.
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 place-items-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-[155px] h-[205px] bg-slate-100 rounded-[1.5rem] animate-pulse"
              />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={28} className="text-slate-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              Nada por aquí
            </h3>
            <p className="text-[14px] font-bold text-slate-400">
              Cambia de pestaña para ver otros exámenes.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 place-items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredExams.map((exam, index) => {
                const isLocked = !isPremium;
                return (
                  <motion.div
                    key={exam.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <ArchiveExamCard
                      exam={exam}
                      isLocked={isLocked}
                      isStarting={
                        startAttempt.isPending &&
                        startAttempt.variables?.examId === exam.id
                      }
                      variant="grid"
                      onClick={() => handleStart(exam.id, isLocked)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
