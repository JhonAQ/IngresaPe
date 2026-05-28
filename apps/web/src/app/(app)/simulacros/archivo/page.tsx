'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { DuoNotebook } from '../../../../components/simulacros/DuoNotebook';

// ============================================================================
// DATOS MOCK SIMPLIFICADOS
// ============================================================================
const examLibrary = [
  {
    id: 1,
    title: 'Admisión 2024',
    phase: 'FASE II',
    type: 'ORDINARIO',
    year: '2024',
    status: 'new',
    score: null,
  },
  {
    id: 2,
    title: 'Admisión 2024',
    phase: 'FASE I',
    type: 'ORDINARIO',
    year: '2024',
    status: 'completed',
    score: 65,
  },
  {
    id: 3,
    title: 'CEPRUNSA 2024',
    phase: 'II FASE',
    type: 'CEPRUNSA',
    year: '2024',
    status: 'new',
    score: null,
  },
  {
    id: 4,
    title: 'Extraordinario',
    phase: 'ÚNICA 2024',
    type: 'EXTRA',
    year: '2024',
    status: 'new',
    score: null,
  },
  {
    id: 5,
    title: 'Admisión 2023',
    phase: 'FASE II',
    type: 'ORDINARIO',
    year: '2023',
    status: 'completed',
    score: 82,
  },
  {
    id: 6,
    title: 'CEPRUNSA 2023',
    phase: 'I FASE',
    type: 'CEPRUNSA',
    year: '2023',
    status: 'locked',
    score: null,
  },
];

export default function ArchivoExamenesPage() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const filters = ['Todos', 'Ordinario', 'CEPRUNSA', '2024', '2023'];

  const filteredExams = examLibrary.filter((exam) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Ordinario') return exam.type === 'ORDINARIO';
    if (activeFilter === 'CEPRUNSA') return exam.type === 'CEPRUNSA';
    if (activeFilter === '2024') return exam.year === '2024';
    if (activeFilter === '2023') return exam.year === '2023';
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-32 bg-white relative">
      {/* HEADER Y FILTROS PEGADOS */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b-2 border-slate-100">
        <header className="flex items-center px-4 py-3 bg-white">
          <Link
            href="/simulacros"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors active:scale-95"
          >
            <ChevronLeft size={24} strokeWidth={3} />
            <span className="font-extrabold text-[13px] uppercase tracking-widest mt-0.5">
              Regresar
            </span>
          </Link>
        </header>

        {/* FILTROS CHUNKY */}
        <div className="px-5 pb-3 bg-white">
          <div className="flex overflow-x-auto hide-scrollbar gap-2">
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
        </div>
      </div>

      {/* TÍTULO DOS COLORES */}
      <div className="px-5 pt-6 pb-4 text-center">
        <h2 className="font-black text-[32px] leading-[1.1] tracking-tight">
          <span className="text-slate-800">Archivo</span>
          <br />
          <span className="text-error-500">Histórico</span>
        </h2>
      </div>

      {/* GRID DE EXÁMENES ESTILO TIENDA/LOGROS */}
      <div className="px-5 py-2">
        <AnimatePresence mode="popLayout">
          {filteredExams.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 gap-4">
              {filteredExams.map((exam, index) => {
                const isCompleted = exam.status === 'completed';
                const isLocked = exam.status === 'locked';

                return (
                  <motion.div
                    key={exam.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                    // LA TARJETA GORDA:
                    className={`bg-white rounded-[1.5rem] border-2 border-slate-200 border-b-[6px] p-4 flex flex-col items-center text-center transition-all cursor-pointer relative
                      ${
                        isLocked
                          ? 'opacity-70'
                          : 'active:border-b-[2px] active:translate-y-[4px] hover:bg-slate-50 border-b-slate-300'
                      }`}
                  >
                    {/* Ícono Masivo SVG Custom */}
                    <div className="mb-3 mt-1 pointer-events-none">
                      <DuoNotebook type={exam.type} status={exam.status} />
                    </div>

                    {/* Textos Simplificados y Súper Bolds */}
                    <h3
                      className={`font-black text-[15px] leading-tight ${
                        isLocked ? 'text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {exam.title}
                    </h3>
                    <p className="font-extrabold text-slate-400 text-[10px] uppercase tracking-widest mt-1">
                      {exam.phase}
                    </p>

                    {/* Distintivo Minimalista de Puntaje (Sin cajas feas) */}
                    {isCompleted && (
                      <div className="mt-2 text-yellow-500 font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-1 drop-shadow-sm">
                        ★ {exam.score}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 px-5 text-center col-span-2"
            >
              <h3 className="text-xl font-black text-slate-800 mb-2">
                Nada por aquí
              </h3>
              <p className="text-[14px] font-bold text-slate-400">
                Cambia de pestaña para ver otros exámenes.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
