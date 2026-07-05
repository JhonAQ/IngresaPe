'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Dna, Sparkles, ChevronRight } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { useImmersiveOverlay } from '../dashboard/ImmersiveOverlayContext';
import { RadarChart } from './dna/RadarChart';

export function AcademicDNA() {
  const { data, isLoading } = trpc.profile.getAcademicDNA.useQuery();
  const { open } = useImmersiveOverlay();
  const [selectedAxisId, setSelectedAxisId] = useState<string | null>(null);

  const axes = useMemo(
    () =>
      data?.axes.map((a) => ({
        id: a.id,
        label: a.label,
        accuracy: a.accuracy,
        hasData: a.hasData,
      })) ?? [],
    [data]
  );

  // Seleccionar automáticamente el eje débil al cargar (o el primero con datos)
  useEffect(() => {
    if (!data || selectedAxisId) return;

    const weakAxis = data.axes.find((a) => a.id === data.weakAxisId);
    const firstWithData = data.axes.find((a) => a.hasData);
    setSelectedAxisId(weakAxis?.id ?? firstWithData?.id ?? data.axes[0]?.id ?? null);
  }, [data, selectedAxisId]);

  const handleOpenOverlay = (axisId?: string) => {
    if (axisId) {
      setSelectedAxisId(axisId);
      open('academicDna', { axisId });
    } else {
      open('academicDna');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 p-5 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/2 mb-4" />
        <div className="h-[260px] bg-slate-100 rounded-2xl mb-4" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!data || data.totalAnswers === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-5 pb-2">
          <div className="w-10 h-10 rounded-xl bg-duo-purple/15 flex items-center justify-center shrink-0">
            <Dna size={22} className="text-duo-purple" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-[18px] text-slate-800 leading-tight">
              Tu ADN Académico
            </h3>
            <p className="text-[12px] font-bold text-slate-400">Estadísticas globales</p>
          </div>
        </div>

        <div className="px-5 py-8 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold text-[14px] mb-1">
            Aún no tenemos suficientes datos
          </p>
          <p className="text-slate-400 text-[12px]">
            Responde preguntas en el path o rinde un simulacro para descubrir tu ADN académico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-duo-purple/15 flex items-center justify-center shrink-0">
            <Dna size={22} className="text-duo-purple" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-[18px] text-slate-800 leading-tight">
              Tu ADN Académico
            </h3>
            <p className="text-[12px] font-bold text-slate-400">Estadísticas globales</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenOverlay()}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-surface-100 text-duo-dark hover:bg-surface-200 active:scale-95 transition-colors"
          aria-label="Ver detalle completo del ADN"
        >
          <ChevronRight size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Radar chart */}
      <div className="flex justify-center py-3">
        <RadarChart
          axes={axes}
          selectedAxisId={selectedAxisId}
          onSelectAxis={(id) => handleOpenOverlay(id)}
          size={320}
        />
      </div>

      {/* Insight pills */}
      <div className="px-5 pb-5">
        <div className="flex flex-wrap gap-2 justify-center">
          {data.strongAxisId && (
            <span className="inline-flex items-center gap-1.5 bg-success-50 text-success-600 border border-success-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
              Fuerte: {data.axes.find((a) => a.id === data.strongAxisId)?.label}
            </span>
          )}
          {data.weakAxisId && (
            <span className="inline-flex items-center gap-1.5 bg-warning-50 text-warning-600 border border-warning-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
              Priorizar: {data.axes.find((a) => a.id === data.weakAxisId)?.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
