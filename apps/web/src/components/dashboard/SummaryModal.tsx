import {
  ChevronLeft,
  X,
  CheckCircle2,
  Lightbulb,
  Image as ImageIcon,
} from 'lucide-react';
import { TemaData } from '../../types/dashboard';

interface SummaryModalProps {
  resumenActivo: TemaData | null;
  onClose: () => void;
}

export function SummaryModal({ resumenActivo, onClose }: SummaryModalProps) {
  if (!resumenActivo) return null;

  return (
    <div className="absolute inset-0 bg-white z-[100] flex flex-col transition-transform duration-300 ease-in-out translate-y-0">
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
            <span
              className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-2 text-yellow-600 shadow-sm ${resumenActivo.color}`}
            >
              Resumen Oficial 
            </span>
            <h2 className="text-3xl font-black text-slate-800 leading-tight">
              {resumenActivo.titulo}
            </h2>
          </div>

          {resumenActivo.resumenData.imagenExplicativa && (
            <div className="w-full h-48 bg-slate-200 rounded-2xl border-2 border-slate-300 border-dashed flex flex-col items-center justify-center text-slate-400">
              <ImageIcon
                size={40}
                strokeWidth={1.5}
                className="mb-2 opacity-50"
              />
              <span className="text-xs font-bold">
                [Diagrama de {resumenActivo.titulo}]
              </span>
            </div>
          )}

          <p className="text-slate-600 font-medium leading-relaxed">
            {resumenActivo.resumenData.introduccion}
          </p>

          <div className="bg-slate-800 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <p className="text-slate-400 text-[10px] font-black mb-2 uppercase tracking-widest">
              Fórmula Clave
            </p>
            <div className="text-xl font-black text-white">
              {resumenActivo.resumenData.formulaDestacada}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-b-2 border-slate-200 pb-2">
              Conceptos Clave
            </h3>
            <div className="space-y-3">
              {resumenActivo.resumenData.puntosClave.map((punto, index) => (
                <div
                  key={index}
                  className="flex gap-3 bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm"
                >
                  <div className="mt-0.5 flex-shrink-0 text-green-500">
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">
                      {punto.titulo}
                    </h4>
                    <p className="text-slate-500 mt-1 text-sm font-medium leading-snug">
                      {punto.texto}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-4 flex gap-3">
            <div className="text-amber-500 shrink-0 mt-0.5">
              <Lightbulb size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-black text-amber-800 text-sm mb-0.5">
                Tip de Examen
              </h4>
              <p className="text-amber-700 text-sm font-medium leading-snug">
                {resumenActivo.resumenData.tipExamen}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2 ${resumenActivo.color}`}
          >
            <span>¡Entendido!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
