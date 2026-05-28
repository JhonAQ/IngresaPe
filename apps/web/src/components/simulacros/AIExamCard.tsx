'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Play } from 'lucide-react';
import { Button3D } from '../ui/Button3D';

interface AIExamCardProps {
  numQuestions: number;
  setNumQuestions: (num: number) => void;
  timeLimit: number;
  setTimeLimit: (mins: number) => void;
}

export const AIExamCard: React.FC<AIExamCardProps> = ({
  numQuestions,
  setNumQuestions,
  timeLimit,
  setTimeLimit,
}) => {
  const router = useRouter();

  return (
    <div className="px-5 mb-8">
      <div className="relative bg-[#020617] rounded-[2rem] p-5 border-2 border-slate-800 border-b-[8px] border-b-black shadow-2xl overflow-hidden group">
        {/* EFECTO BORDER BEAM (Haz de luz recorriendo el borde) */}
        <div className="absolute inset-0 pointer-events-none rounded-[2rem] overflow-hidden">
          <svg className="absolute inset-0 w-full h-full">
            <motion.rect
              width="100%"
              height="100%"
              rx="32"
              fill="none"
              stroke="url(#border-grad)"
              strokeWidth="3"
              strokeDasharray="100 400"
              animate={{ strokeDashoffset: [-500, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            />
            <defs>
              <linearGradient id="border-grad">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/20 px-2.5 py-1.5 rounded-xl backdrop-blur-md">
              <Sparkles size={12} className="text-cyan-400 fill-cyan-400" />
              <span className="text-cyan-400 font-black text-[9px] uppercase tracking-[0.2em]">
                IA Personalizada
              </span>
            </div>
            <Brain size={24} className="text-cyan-400/30" />
          </div>

          <h3 className="text-[22px] font-black text-white leading-tight mb-1">
            Simulacro IA
          </h3>
          <p className="text-slate-400 font-bold text-[12px] mb-5 leading-tight">
            Enfocado en tus{' '}
            <span className="text-cyan-300">temas más débiles</span>.
          </p>

          {/* CONFIG COMPACTA */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-black text-[9px] uppercase tracking-wider">
                Preguntas
              </span>
              <div className="flex gap-1.5">
                {[20, 40, 60, 80].map((v) => (
                  <button
                    key={v}
                    onClick={() => setNumQuestions(v)}
                    className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                      numQuestions === v
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-black text-[9px] uppercase tracking-wider">
                Tiempo (min)
              </span>
              <div className="flex gap-1.5">
                {[30, 60, 90, 120].map((v) => (
                  <button
                    key={v}
                    onClick={() => setTimeLimit(v)}
                    className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                      timeLimit === v
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button3D variant="neon" className="!py-3.5" onClick={() => router.push('/simulator')}>
            GENERAR AHORA <Play size={16} fill="currentColor" />
          </Button3D>
        </div>
      </div>
    </div>
  );
};;
