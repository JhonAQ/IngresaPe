import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, CheckCircle, XCircle, HelpCircle, RotateCcw, Home, Clock, FileSearch, Coins, Sparkles, Activity } from 'lucide-react';
import { Button3D } from '../ui/Button3D';
import type { ExamResultDto } from '@ingresa-pe/domain';

interface ExamResultScreenProps {
  result: ExamResultDto;
  examTitle?: string | null;
  onRetry: () => void;
  onHome: () => void;
}

export function ExamResultScreen({ result, examTitle, onRetry, onHome }: ExamResultScreenProps) {
  const [isGrading, setIsGrading] = useState(true);
  const [gradingText, setGradingText] = useState('Escaneando ficha óptica...');

  const totalQuestions = result.correctCount + result.incorrectCount + result.blankCount;
  const accuracy = totalQuestions > 0 ? Math.round((result.correctCount / totalQuestions) * 100) : 0;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  useEffect(() => {
    const t1 = setTimeout(() => setGradingText('Calculando puntaje final...'), 1200);
    const t2 = setTimeout(() => setIsGrading(false), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] flex flex-col items-center justify-center px-5 bg-slate-50 relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {isGrading ? (
          <motion.div
            key="grading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <div className="relative w-32 h-32 mb-8">
              {/* Outer spinning ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 border-4 border-slate-200 border-t-blue-500 rounded-full"
              />
              {/* Inner pulsing circle */}
              <motion.div 
                animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-4 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <Activity size={32} className="text-blue-500" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Evaluando Examen</h2>
            <p className="text-slate-500 font-bold animate-pulse">{gradingText}</p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full flex flex-col h-full py-8"
          >
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col items-center pt-4">
              
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2, bounce: 0.5 }}
                  className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto relative z-10"
                >
                  <Trophy size={48} className="text-white drop-shadow-md" />
                </motion.div>
                
                {/* Floating sparkles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-[-50%] text-emerald-400 opacity-20 pointer-events-none z-0 flex items-center justify-center"
                >
                  <Sparkles size={160} />
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6 w-full"
              >
                <h1 className="font-black text-[28px] text-slate-800 leading-tight mb-1">
                  ¡Resultados Listos!
                </h1>
                {examTitle && (
                  <p className="text-slate-500 font-bold text-[14px] px-4">{examTitle}</p>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full bg-white rounded-[2rem] p-5 border-2 border-slate-100 border-b-[6px] border-b-slate-200 shadow-sm mb-4"
              >
                <div className="flex items-center justify-center gap-4 mb-5 pb-5 border-b-2 border-slate-100 border-dashed">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Puntaje Total</p>
                    <div className="flex items-center justify-center gap-2">
                      <Target size={24} className="text-emerald-500" />
                      <span className="text-[36px] font-black text-emerald-500 leading-none">{result.score}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-12 bg-slate-200" />
                  
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Precisión</p>
                    <div className="flex items-center justify-center gap-1 h-[36px]">
                      <span className="text-[28px] font-black text-blue-500 leading-none">{accuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <StatBox
                    icon={<CheckCircle size={18} className="text-emerald-500" />}
                    value={result.correctCount}
                    label="Correctas"
                    color="emerald"
                  />
                  <StatBox
                    icon={<XCircle size={18} className="text-rose-500" />}
                    value={result.incorrectCount}
                    label="Incorrectas"
                    color="rose"
                  />
                  <StatBox
                    icon={<HelpCircle size={18} className="text-slate-400" />}
                    value={result.blankCount}
                    label="En Blanco"
                    color="slate"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-[12px]">
                    <Clock size={16} className="text-blue-500" /> 
                    Tiempo: {formatTime(result.timeUsedSeconds)}
                  </div>
                  {result.coinsEarned > 0 && (
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-[12px]">
                      +{result.coinsEarned} <Coins size={16} />
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full mb-6"
              >
                <button
                  onClick={() => alert("La revisión detallada pregunta por pregunta estará disponible próximamente.")}
                  className="w-full bg-blue-50 border-2 border-blue-100 text-blue-600 font-black text-[14px] uppercase tracking-widest py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <FileSearch size={18} strokeWidth={2.5} /> Revisar Respuestas
                </button>
              </motion.div>

            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-auto pt-4 flex flex-col gap-3 w-full pb-6"
            >
              <Button3D variant="primary" onClick={onRetry} className="!py-3.5 text-[14px]">
                <RotateCcw size={18} strokeWidth={2.5} /> REINTENTAR
              </Button3D>
              <Button3D variant="secondary" onClick={onHome} className="!py-3.5 text-[14px]">
                <Home size={18} strokeWidth={2.5} /> VOLVER AL INICIO
              </Button3D>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className={`rounded-2xl p-3 border-2 flex flex-col items-center justify-center h-24 ${colorClasses[color]}`}>
      <div className="mb-1">{icon}</div>
      <span className="text-xl font-black leading-none mb-1">{value}</span>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-70 text-center leading-tight">{label}</span>
    </div>
  );
}
