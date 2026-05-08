import React from 'react';
import { Bookmark } from 'lucide-react';

interface QuestionHeaderProps {
  preguntaActual: number;
  totalPreguntas: number;
  area: string;
  isMarcada: boolean;
  onToggleBandera: () => void;
}

export const QuestionHeader = ({ preguntaActual, totalPreguntas, area, isMarcada, onToggleBandera }: QuestionHeaderProps) => (
  <div className="flex justify-between items-end mb-2 px-1"> 
    <span className="font-black text-slate-400 text-sm tracking-widest uppercase mb-1">
      Pregunta {preguntaActual} de {totalPreguntas}
    </span>
    
    <div className="flex items-center gap-2">
      <span className="bg-[#f3e8ff] text-[#9333ea] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
        {area}
      </span>
      <button 
        onClick={onToggleBandera}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
          ${isMarcada 
            ? 'bg-orange-100 text-orange-500' 
            : 'bg-orange-50 text-orange-400 hover:bg-orange-100'
          }`}
      >
        <Bookmark size={16} strokeWidth={3} className={isMarcada ? "fill-orange-500" : ""} />
      </button>
    </div>
  </div>
);
