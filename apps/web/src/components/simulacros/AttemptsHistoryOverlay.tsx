'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useImmersiveOverlay } from '../dashboard/ImmersiveOverlayContext';
import { trpc } from '../../utils/trpc';
import type { ExamAttemptSummaryDto } from '@ingresa-pe/domain';

function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getAttemptTitle(attempt: ExamAttemptSummaryDto): string {
  if (attempt.mode === 'ARCHIVE' && attempt.examTitle) {
    return attempt.examTitle;
  }
  return attempt.mode === 'GENERATED' ? 'Simulacro IA' : 'Simulacro';
}

export function AttemptsHistoryOverlay() {
  const { mode, close } = useImmersiveOverlay();
  const { data: attempts = [], isLoading } = trpc.simulacro.getRecentAttempts.useQuery();

  const isOpen = mode === 'attemptsHistory';

  if (!isOpen) return null;

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
            <BarChart3 size={22} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-[22px] leading-tight tracking-tight text-slate-800 truncate">
              Historial de intentos
            </h2>
            <p className="text-[12px] font-bold text-slate-400 truncate">
              Todos tus simulacros y exámenes
            </p>
          </div>
        </div>
      </header>

      {/* Contenido scrollable */}
      <main className="flex-1 overflow-y-auto hide-scrollbar p-5 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] bg-slate-100 rounded-[1.5rem] animate-pulse"
              />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={28} className="text-slate-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              Aún no has dado ningún simulacro
            </h3>
            <p className="text-[14px] font-bold text-slate-400">
              Completa tu primer intento para verlo aquí.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {attempts.map((attempt, index) => {
                const isCompleted = attempt.status === 'COMPLETED';
                const correct = attempt.correctCount ?? 0;
                const incorrect = attempt.incorrectCount ?? 0;
                const score = attempt.score ?? 0;

                return (
                  <motion.div
                    key={attempt.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-[1.5rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300 p-3.5 flex flex-col shadow-sm active:border-b-[2px] active:translate-y-[4px] transition-all"
                  >
                    {/* Icono */}
                    <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-2 border border-rose-100">
                      <FileText size={16} strokeWidth={2.5} />
                    </div>

                    {/* Tipo / Estado */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest ${
                          isCompleted ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      >
                        {isCompleted ? 'Completado' : 'En progreso'}
                      </span>
                      <h4 className="font-black text-slate-800 text-[12.5px] leading-tight mt-0.5 line-clamp-2">
                        {getAttemptTitle(attempt)}
                      </h4>
                      <p className="text-slate-400 font-bold text-[9px] mt-0.5">
                        {formatRelativeDate(attempt.startedAt)}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Score
                        </span>
                        <span className="text-lg font-black text-blue-600 leading-none">
                          {score.toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[9px] mb-3">
                        <span className="flex items-center gap-0.5">
                          <CheckCircle size={10} className="text-emerald-500" /> {correct}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <XCircle size={10} className="text-rose-500" /> {incorrect}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} /> {formatDuration(attempt.timeUsedSeconds)}
                        </span>
                      </div>

                      <button
                        className="w-full py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-blue-50 hover:text-blue-500 hover:border-blue-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: navegar a revisión del intento
                        }}
                      >
                        <RotateCcw size={10} strokeWidth={3} />
                        {isCompleted ? 'Revisar' : 'Continuar'}
                      </button>
                    </div>
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
