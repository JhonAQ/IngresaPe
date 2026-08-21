'use client';
import React from 'react';
import { History, ChevronRight, Crown } from 'lucide-react';
import { ArchiveExamCard } from './ArchiveExamCard';
import { useImmersiveOverlay } from '../dashboard/ImmersiveOverlayContext';
import type { ExamSummaryDto } from '@ingresa-pe/domain';

interface HistoryArchiveProps {
  pastExams: ExamSummaryDto[];
  isPremium?: boolean;
  onStartExam?: (examId: string) => void;
  startingExamId?: string;
}

export const HistoryArchive: React.FC<HistoryArchiveProps> = ({
  pastExams,
  isPremium = false,
  onStartExam,
  startingExamId,
}) => {
  const { open } = useImmersiveOverlay();

  const handleStart = (examId: string, locked: boolean) => {
    if (!onStartExam || startingExamId === examId) return;
    onStartExam(examId);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end px-7 mb-3">
        <h3 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.25em] flex items-center gap-2">
          <History size={14} /> Archivo Histórico
          <span className="flex items-center gap-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-1.5 py-0.5 rounded-md text-[8px] tracking-wider ml-1">
             <Crown size={8} className="fill-white" /> SUPER
          </span>
        </h3>
        <button
          onClick={() => open('archive')}
          className="text-blue-500 font-black text-[11px] uppercase flex items-center gap-0.5"
        >
          Ver todo <ChevronRight size={14} />
        </button>
      </div>
      <div className="mx-5 overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar gap-4 px-1 pb-4 snap-x">
          {pastExams.map((exam) => {
            const isLocked = !isPremium;
            const isStarting = startingExamId === exam.id;
            return (
              <ArchiveExamCard
                key={exam.id}
                exam={exam}
                isLocked={isLocked}
                isStarting={isStarting}
                onClick={() => handleStart(exam.id, isLocked)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
