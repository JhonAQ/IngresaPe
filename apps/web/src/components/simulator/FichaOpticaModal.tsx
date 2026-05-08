import React, { useState, useEffect } from 'react';
import { Bookmark, FileText, ChevronLeft } from 'lucide-react';

interface FichaOpticaModalProps {
  isOpen: boolean;
  onClose: () => void;
  respuestas: Record<number, string>;
  marcadas: number[];
  preguntaActual: number;
  totalPreguntas: number;
  onCambiarPregunta: (numero: number) => void;
}

export const FichaOpticaModal = ({ 
  isOpen, 
  onClose, 
  respuestas, 
  marcadas, 
  preguntaActual, 
  totalPreguntas, 
  onCambiarPregunta 
}: FichaOpticaModalProps) => {
  const resueltas = Object.keys(respuestas).length;
  const enBlanco = totalPreguntas - resueltas;

  const [startY, setStartY] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 120) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const renderColumna = (inicio: number, fin: number) => (
    <div className="flex-1 border-2 border-red-200/60 rounded-xl py-1.5 px-1 h-max bg-white shadow-sm overflow-hidden">
      {Array.from({ length: fin - inicio + 1 }, (_, i) => i + inicio).map((num) => {
        const isCurrent = num === preguntaActual;
        const respondida = respuestas[num];
        const isEven = num % 2 === 0;
        
        return (
          <div 
            key={num} 
            onClick={() => onCambiarPregunta(num)}
            className={`relative flex items-center justify-center px-2 py-1.5 rounded-lg cursor-pointer transition-all mb-[1px]
              ${isCurrent 
                ? 'ring-2 ring-blue-400 bg-blue-50 shadow-sm z-10' 
                : isEven 
                  ? 'bg-red-50 hover:bg-red-100/60' 
                  : 'bg-white hover:bg-slate-50'
              }
            `}
          >
            {marcadas.includes(num) && (
              <Bookmark size={12} strokeWidth={3} className="absolute left-1.5 text-orange-500 fill-orange-500 pointer-events-none" />
            )}
            
            <span className={`font-black text-[12px] w-[22px] text-right mr-2 shrink-0 ${isCurrent ? 'text-blue-600' : 'text-slate-700'}`}>
              {num}.
            </span>

            <div className="flex items-center gap-1 shrink-0">
              {['A', 'B', 'C', 'D', 'E'].map(letra => {
                const isSelected = respondida === letra;
                return (
                  <div key={letra} className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full border-[1.5px] flex items-center justify-center text-[8px] font-black transition-colors shrink-0
                    ${isSelected 
                      ? 'bg-slate-800 border-slate-800 text-white shadow-inner' 
                      : 'bg-transparent border-red-400 text-red-500 opacity-80'
                    }
                  `}>
                    {letra}
                  </div>
                )
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div 
      className={`absolute inset-0 bg-slate-900/50 z-[100] backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-white h-[90%] max-h-[90%] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
        style={{
          transform: isOpen ? `translateY(${isDragging ? dragY : 0}px)` : 'translateY(100%)',
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        
        <div 
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none bg-white z-20"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
          </div>

          <div className="px-6 py-4 flex justify-center items-center">
            <h2 className="text-2xl font-black text-[#1e293b] flex items-center gap-3">
              <FileText className="text-red-500" size={26} strokeWidth={2.5} />
              Ficha Óptica
            </h2>
          </div>
        </div>

        <div className="px-6 flex gap-4 shrink-0 pb-3">
          <div className="flex-1 bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[#22c55e] text-[10px] font-black uppercase tracking-widest mb-1">Resueltas</span>
            <span className="text-[#16a34a] text-2xl font-black leading-none">{resueltas}</span>
          </div>
          <div className="flex-1 bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[#d97706] text-[10px] font-black uppercase tracking-widest mb-1">En Blanco</span>
            <span className="text-[#d97706] text-2xl font-black leading-none">{enBlanco}</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">
          {/* Note: .hide-scrollbar class would be needed in global.css */}
          <div className="flex gap-3 pb-8">
            {renderColumna(1, 40)}
            {renderColumna(41, 80)}
          </div>
        </div>

        <div className="p-6 bg-white shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex gap-4 z-20">
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-black p-4 rounded-2xl active:scale-95 transition-all">
            <ChevronLeft size={24} />
          </button>
          <button className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white font-black text-xl py-4 rounded-2xl shadow-[0_5px_0_0_#b91c1c] active:translate-y-[5px] active:shadow-none transition-all">
            ENTREGAR EXAMEN
          </button>
        </div>
      </div>
    </div>
  );
};
