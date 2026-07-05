'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, BookOpen, Target } from 'lucide-react';
import type { AcademicDnaAxisDto } from '@ingresa-pe/domain';
import { ProgressBar } from '@ingresa-pe/ui';

interface AxisDetailPanelProps {
  axis: AcademicDnaAxisDto | null;
  isStrong?: boolean;
  isWeak?: boolean;
}

export function AxisDetailPanel({ axis, isStrong, isWeak }: AxisDetailPanelProps) {
  if (!axis) {
    return (
      <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
        <p className="text-slate-400 font-bold text-[13px]">
          Selecciona un eje del radar para ver el detalle por curso.
        </p>
      </div>
    );
  }

  const sortedCourses = [...axis.courses].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={axis.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 overflow-hidden"
      >
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-duo-purple/15 flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-duo-purple" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-black text-[17px] text-slate-800 leading-tight">
                  {axis.label}
                </h4>
                <p className="text-[11px] font-bold text-slate-400">
                  {axis.total > 0
                    ? `${axis.correct} de ${axis.total} correctas`
                    : 'Sin datos aún'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[28px] font-black text-duo-purple leading-none">
                {axis.hasData ? Math.round(axis.accuracy) : '—'}
              </span>
              {axis.hasData && (
                <span className="text-[12px] font-black text-slate-400">%</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isStrong && (
              <span className="inline-flex items-center gap-1 bg-success-50 text-success-600 border border-success-100 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                <TrendingUp size={12} /> Fuerte en este eje
              </span>
            )}
            {isWeak && (
              <span className="inline-flex items-center gap-1 bg-warning-50 text-warning-600 border border-warning-100 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                <AlertTriangle size={12} /> Priorizar
              </span>
            )}
            {!isStrong && !isWeak && axis.hasData && (
              <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-100 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                <Target size={12} /> En progreso
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <h5 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] mb-4">
            Desglose por curso
          </h5>

          {sortedCourses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400 font-bold text-[13px]">
                Aún no hay respuestas registradas en este eje.
              </p>
              <p className="text-slate-400/70 text-[11px] mt-1">
                Practica o rinde simulacros para que aparezcan las métricas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCourses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-[13px] text-slate-700">
                      {course.name}
                    </span>
                    <span className="text-[11px] font-black text-slate-400">
                      {course.correct}/{course.total} · {Math.round(course.accuracy)}%
                    </span>
                  </div>
                  <ProgressBar
                    progress={Math.round(course.accuracy)}
                    size="sm"
                    indicatorColor={course.accuracy >= 70 ? 'success' : course.accuracy >= 40 ? 'warning' : 'error'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
