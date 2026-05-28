'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { History, ChevronRight, FileText, LayoutGrid } from 'lucide-react';

interface PastExam {
  id: number;
  title: string;
  type: string;
  questions: number;
}

interface HistoryArchiveProps {
  pastExams: PastExam[];
}

export const HistoryArchive: React.FC<HistoryArchiveProps> = ({
  pastExams,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-end px-7 mb-3">
        <h3 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.25em] flex items-center gap-2">
          <History size={14} /> Archivo Histórico
        </h3>
        <Link
          href="/simulacros/archivo"
          className="text-blue-500 font-black text-[11px] uppercase flex items-center gap-0.5"
        >
          Ver todo <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mx-5 overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar gap-4 px-1 pb-4 snap-x">
          {pastExams.map((exam) => (
            <motion.div
              key={exam.id}
              whileTap={{ scale: 0.95 }}
              className="snap-start shrink-0 w-[135px] h-[180px] bg-white rounded-[1.5rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300 p-3.5 flex flex-col shadow-sm cursor-pointer group"
            >
              <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-2 border border-rose-100">
                <FileText size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">
                  FASE {exam.id % 2 === 0 ? 'I' : 'II'}
                </span>
                <h4 className="font-black text-slate-800 text-[12.5px] leading-tight mt-0.5 line-clamp-3">
                  Admisión {exam.id > 102 ? '2023' : '2024'}
                </h4>
              </div>
              <div className="mt-auto pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-slate-400 font-bold text-[9px] mb-2">
                  <LayoutGrid size={10} strokeWidth={3} /> {exam.questions}{' '}
                  Pregs
                </div>
                <div className="w-full py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  Iniciar
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
