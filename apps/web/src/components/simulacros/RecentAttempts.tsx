'use client';
import React from 'react';
import {
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Button3D } from '../ui/Button3D';
import type { ExamAttemptSummaryDto } from '@ingresa-pe/domain';

interface RecentAttemptsProps {
  attempts: ExamAttemptSummaryDto[];
}

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

export const RecentAttempts: React.FC<RecentAttemptsProps> = ({ attempts }) => {
  return (
    <div className="px-5 pb-12">
      <h3 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
        <BarChart3 size={14} /> Mis Intentos Recientes
      </h3>
      <div className="space-y-4">
        {attempts.length === 0 && (
          <div className="text-center py-8 rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-[13px]">
              Aún no has dado ningún simulacro.
            </p>
          </div>
        )}

        {attempts.map((attempt) => {
          const correct = attempt.correctCount ?? 0;
          const incorrect = attempt.incorrectCount ?? 0;
          const score = attempt.score ?? 0;
          const isCompleted = attempt.status === 'COMPLETED';

          return (
            <div
              key={attempt.id}
              className="bg-white rounded-[2rem] border-2 border-slate-100 border-b-[6px] border-b-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-5 pt-5 pb-3 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {isCompleted ? 'Completado' : 'En progreso'}
                    </span>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">
                      {formatRelativeDate(attempt.startedAt)}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 text-[17px] leading-tight">
                    {getAttemptTitle(attempt)}
                  </h4>
                </div>
                <div className="bg-blue-50 border-2 border-blue-100 px-3 py-2 rounded-2xl flex flex-col items-center">
                  <span className="text-[9px] font-black text-blue-400 uppercase mb-0.5">
                    Score
                  </span>
                  <span className="text-xl font-black text-blue-600 leading-none">
                    {score.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 flex items-center gap-6 border-y border-slate-50 bg-slate-50/50 text-slate-600 font-black text-[12px]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />{' '}
                  {correct}{' '}
                  <span className="text-slate-400 text-[9px]">BIEN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle size={14} className="text-rose-500" />{' '}
                  {incorrect}{' '}
                  <span className="text-slate-400 text-[9px]">MAL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />{' '}
                  {formatDuration(attempt.timeUsedSeconds)}
                </div>
              </div>
              <div className="p-4 flex gap-3">
                <Button3D variant="secondary" className="flex-1 !py-2.5">
                  Revisar Fallos
                </Button3D>
                <button className="w-12 h-12 bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 rounded-2xl flex items-center justify-center text-slate-400 active:translate-y-[2px] active:border-b-0 transition-transform">
                  <RotateCcw size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
