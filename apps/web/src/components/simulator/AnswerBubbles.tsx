import React from 'react';

interface AnswerBubblesProps {
  preguntaActual: number;
  respuestaSeleccionada?: string;
  onSelect: (letra: string) => void;
}

export const AnswerBubbles = ({ preguntaActual, respuestaSeleccionada, onSelect }: AnswerBubblesProps) => (
  <div className="bg-white px-6 py-5 flex items-center gap-5 justify-center pb-safe">
    <span className="text-[#ef4444] font-black text-2xl tracking-tighter">
      {preguntaActual.toString().padStart(3, '0')}.
    </span>
    <div className="flex gap-3">
      {['A', 'B', 'C', 'D', 'E'].map((letra) => {
        const isSelected = respuestaSeleccionada === letra;
        return (
          <button
            key={letra}
            onClick={() => onSelect(letra)}
            className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-lg transition-all active:scale-90
              ${isSelected 
                ? 'bg-slate-800 text-white border-2 border-slate-800' 
                : 'bg-white text-[#ef4444] border-2 border-[#ef4444] hover:bg-red-50'
              }
            `}
          >
            {letra}
          </button>
        );
      })}
    </div>
  </div>
);
