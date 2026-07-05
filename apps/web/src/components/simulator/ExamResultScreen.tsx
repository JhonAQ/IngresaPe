import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, CheckCircle, XCircle, HelpCircle, RotateCcw, Home } from 'lucide-react';
import { Button3D } from '../ui/Button3D';
import type { ExamResultDto } from '@ingresa-pe/domain';

interface ExamResultScreenProps {
  result: ExamResultDto;
  examTitle?: string | null;
  onRetry: () => void;
  onHome: () => void;
}

export function ExamResultScreen({ result, examTitle, onRetry, onHome }: ExamResultScreenProps) {
  const totalQuestions = result.correctCount + result.incorrectCount + result.blankCount;

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] flex flex-col items-center justify-center px-6 text-center bg-[#d7ffb8]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <Trophy size={80} className="text-[#58a700] mx-auto" />
      </motion.div>

      <h1 className="font-black text-[28px] text-[#58a700] mb-1">
        ¡Examen completado!
      </h1>
      {examTitle && (
        <p className="text-[#3c3c3c] font-bold text-[14px] mb-6">{examTitle}</p>
      )}

      <div className="bg-white rounded-[2rem] p-5 border-2 border-[#b6f09c] border-b-[6px] border-b-[#9bd884] shadow-sm w-full mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target size={28} className="text-[#58cc02]" />
          <span className="text-[40px] font-black text-[#58cc02] leading-none">{result.score}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBox
            icon={<CheckCircle size={18} className="text-emerald-500" />}
            value={result.correctCount}
            label="Bien"
            color="emerald"
          />
          <StatBox
            icon={<XCircle size={18} className="text-rose-500" />}
            value={result.incorrectCount}
            label="Mal"
            color="rose"
          />
          <StatBox
            icon={<HelpCircle size={18} className="text-slate-400" />}
            value={result.blankCount}
            label="Blanco"
            color="slate"
          />
        </div>

        {totalQuestions > 0 && (
          <p className="mt-4 text-slate-500 font-bold text-[12px]">
            Respondiste {totalQuestions - result.blankCount} de {totalQuestions} preguntas
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button3D variant="primary" onClick={onRetry}>
          <RotateCcw size={18} strokeWidth={3} /> Reintentar
        </Button3D>
        <Button3D variant="secondary" onClick={onHome}>
          <Home size={18} strokeWidth={3} /> Volver a simulacros
        </Button3D>
      </div>
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'emerald' | 'rose' | 'slate';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div className={`rounded-2xl p-3 border-2 flex flex-col items-center ${colorClasses[color]}`}>
      <div className="mb-1">{icon}</div>
      <span className="text-xl font-black leading-none">{value}</span>
      <span className="text-[9px] font-black uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
}
