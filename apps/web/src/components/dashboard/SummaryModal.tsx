'use client';

import { useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { TemaData } from '@ingresa-pe/domain';
import { SummaryBlocks } from '../summary/SummaryBlocks';
import { useImmersiveOverlay } from './ImmersiveOverlayContext';

interface SummaryModalProps {
  resumenActivo: TemaData | null;
  onClose: () => void;
}

export function SummaryModal({ resumenActivo, onClose }: SummaryModalProps) {
  const { open, close } = useImmersiveOverlay();

  useEffect(() => {
    if (resumenActivo) {
      open('summary');
    } else {
      close();
    }
  }, [resumenActivo, open, close]);

  if (!resumenActivo) return null;

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col">
      <div className="px-4 pt-6 pb-4 border-b-2 border-slate-200 flex items-center justify-between sticky top-0 bg-white z-20 shrink-0">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <span className="font-black text-slate-800 text-lg truncate px-4">
          Tema {resumenActivo.tema}
        </span>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 hide-scrollbar">
        <div className="space-y-6 pb-10">
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-2 bg-red-600 text-white shadow-sm">
              Resumen Oficial
            </span>
          </div>

          <SummaryBlocks
            blocks={resumenActivo.resumenData}
            accentColor={resumenActivo.color}
          />

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2"
            style={{ backgroundColor: resumenActivo.color }}
          >
            <span>¡Entendido!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
