'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, LayoutGrid, Lock } from 'lucide-react';
import type { ExamSummaryDto } from '@ingresa-pe/domain';

interface ArchiveExamCardProps {
  exam: ExamSummaryDto;
  isLocked?: boolean;
  isStarting?: boolean;
  onClick?: () => void;
  variant?: 'carousel' | 'grid';
}

export const ArchiveExamCard: React.FC<ArchiveExamCardProps> = ({
  exam,
  isLocked = false,
  isStarting = false,
  onClick,
  variant = 'carousel',
}) => {
  const sizeClasses =
    variant === 'grid' ? 'w-[155px] h-[205px]' : 'w-[135px] h-[180px]';

  return (
    <motion.div
      whileTap={!isLocked && !isStarting && onClick ? { scale: 0.95 } : {}}
      onClick={!isLocked && !isStarting ? onClick : undefined}
      className={`snap-start shrink-0 ${sizeClasses} bg-white rounded-[1.5rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300 p-3.5 flex flex-col shadow-sm group relative
        ${isLocked || isStarting ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
    >
      {isLocked && (
        <div className="absolute top-3 right-3 w-7 h-7 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center z-10">
          <Lock size={14} strokeWidth={3} />
        </div>
      )}
      <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-2 border border-rose-100">
        <FileText size={16} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">
          {exam.type ?? 'EXAMEN'} {exam.phase ? `- FASE ${exam.phase}` : ''}
        </span>
        <h4 className="font-black text-slate-800 text-[12.5px] leading-tight mt-0.5 line-clamp-3">
          {exam.year}
        </h4>
      </div>
      <div className="mt-auto pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-slate-400 font-bold text-[9px] mb-2">
          <LayoutGrid size={10} strokeWidth={3} /> {exam.questionCount}{' '}
          Pregs
        </div>
        <div
          className={`w-full py-1.5 border rounded-lg flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-colors
          ${
            isLocked
              ? 'bg-slate-100 border-slate-200 text-slate-500'
              : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100'
          }`}
        >
          {isStarting ? '...' : isLocked ? 'Premium' : 'Iniciar'}
        </div>
      </div>
    </motion.div>
  );
};
