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

interface Attempt {
  id: number;
  title: string;
  date: string;
  score: number;
  correct: number;
  incorrect: number;
  timeUsed: string;
}

interface RecentAttemptsProps {
  attempts: Attempt[];
}

export const RecentAttempts: React.FC<RecentAttemptsProps> = ({ attempts }) => {
  return (
    <div className="px-5 pb-12">
      <h3 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
        <BarChart3 size={14} /> Mis Intentos Recientes
      </h3>
      <div className="space-y-4">
        {attempts.map((attempt) => (
          <div
            key={attempt.id}
            className="bg-white rounded-[2rem] border-2 border-slate-100 border-b-[6px] border-b-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-5 pt-5 pb-3 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                    Completado
                  </span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">
                    {attempt.date}
                  </span>
                </div>
                <h4 className="font-black text-slate-800 text-[17px] leading-tight">
                  {attempt.title}
                </h4>
              </div>
              <div className="bg-blue-50 border-2 border-blue-100 px-3 py-2 rounded-2xl flex flex-col items-center">
                <span className="text-[9px] font-black text-blue-400 uppercase mb-0.5">
                  Score
                </span>
                <span className="text-xl font-black text-blue-600 leading-none">
                  {attempt.score}
                </span>
              </div>
            </div>
            <div className="px-5 py-3 flex items-center gap-6 border-y border-slate-50 bg-slate-50/50 text-slate-600 font-black text-[12px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />{' '}
                {attempt.correct}{' '}
                <span className="text-slate-400 text-[9px]">BIEN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={14} className="text-rose-500" />{' '}
                {attempt.incorrect}{' '}
                <span className="text-slate-400 text-[9px]">MAL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />{' '}
                {attempt.timeUsed}
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
        ))}
      </div>
    </div>
  );
};
