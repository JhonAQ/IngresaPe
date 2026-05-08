import React from 'react';
import { X, Clock } from 'lucide-react';

interface TopBarProps {
  tiempoRestante: number;
  onClose: () => void;
}

export const TopBar = ({ tiempoRestante, onClose }: TopBarProps) => {
  const formatoTiempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white px-5 py-4 flex justify-between items-center border-b border-slate-100 z-10 shrink-0">
      <button 
        onClick={onClose} 
        className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-95 transition-transform"
      >
        <X size={20} strokeWidth={3} />
      </button>
      
      <div className="bg-[#f0f4f8] text-[#5c6e8a] px-5 py-2.5 rounded-2xl flex items-center gap-2 font-black text-[17px] tracking-wide">
        <Clock size={18} strokeWidth={2.5} />
        {formatoTiempo(tiempoRestante)}
      </div>

      <div className="w-10 h-10"></div>
    </header>
  );
};
