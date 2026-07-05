'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { X, Dna } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { useImmersiveOverlay } from '../dashboard/ImmersiveOverlayContext';
import { RadarChart } from './dna/RadarChart';
import { AxisDetailPanel } from './dna/AxisDetailPanel';

export function AcademicDnaOverlay() {
  const { mode, payload, close } = useImmersiveOverlay();
  const { data, isLoading } = trpc.profile.getAcademicDNA.useQuery();
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const isOpen = mode === 'academicDna';

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

  const payloadAxisId = useMemo(() => {
    if (!payload || typeof payload !== 'object') return null;
    return (payload as { axisId?: string }).axisId ?? null;
  }, [payload]);

  // Scroll al eje seleccionado cuando se abre el overlay
  useEffect(() => {
    if (!isOpen || !data || !payloadAxisId) return;

    const timer = setTimeout(() => {
      const el = refs.current[payloadAxisId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, data, payloadAxisId]);

  const handleSelectAxis = (id: string) => {
    const el = refs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isOpen) return null;

  if (isLoading || !data) {
    return (
      <div className="absolute inset-0 z-50 bg-white flex flex-col">
        <header className="sticky top-0 z-50 bg-white px-4 pt-4 pb-3 border-b-2 border-duo-border flex items-center gap-4">
          <button
            onClick={() => close()}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-surface-100 text-duo-dark hover:bg-surface-200 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} strokeWidth={3} />
          </button>
          <h2 className="flex-1 font-black text-[22px] leading-tight tracking-tight text-duo-dark">
            Tu ADN Académico
          </h2>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-duo-purple/20 border-t-duo-purple rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* Header sticky con X */}
      <header className="sticky top-0 z-50 bg-white px-4 pt-4 pb-3 border-b-2 border-duo-border flex items-center gap-4">
        <button
          onClick={() => close()}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-surface-100 text-duo-dark hover:bg-surface-200 transition-colors"
          aria-label="Cerrar"
        >
          <X size={24} strokeWidth={3} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-duo-purple/15 flex items-center justify-center shrink-0">
            <Dna size={22} className="text-duo-purple" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-[22px] leading-tight tracking-tight text-duo-dark truncate">
              Tu ADN Académico
            </h2>
            <p className="text-[12px] font-bold text-slate-400 truncate">
              Desglose por eje temático
            </p>
          </div>
        </div>
      </header>

      {/* Contenido scrollable */}
      <main className="flex-1 overflow-y-auto hide-scrollbar p-5 pb-8">
        <div className="flex justify-center py-2">
          <RadarChart
            axes={axes}
            selectedAxisId={payloadAxisId}
            onSelectAxis={handleSelectAxis}
            size={360}
          />
        </div>

        <div className="mt-6 space-y-5">
          {data.axes.map((axis) => (
            <div
              key={axis.id}
              id={`dna-axis-${axis.id}`}
              ref={(el) => {
                refs.current[axis.id] = el;
              }}
            >
              <AxisDetailPanel
                axis={axis}
                isStrong={axis.id === data.strongAxisId}
                isWeak={axis.id === data.weakAxisId}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
