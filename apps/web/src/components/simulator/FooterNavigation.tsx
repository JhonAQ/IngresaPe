import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FooterNavigationProps {
  onAnterior: () => void;
  onPasar: () => void;
  onOpenFicha: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const FooterNavigation = ({ onAnterior, onPasar, onOpenFicha, isFirst, isLast }: FooterNavigationProps) => (
  <div className="bg-[#fff1f2] px-6 py-3 grid grid-cols-3 items-center border-t border-red-100">
    <div className="flex justify-start">
      <button 
        onClick={onAnterior}
        disabled={isFirst}
        className="text-[#f43f5e] font-bold text-[15px] flex items-center gap-1 disabled:opacity-30 active:scale-95 transition-all"
      >
        <ChevronLeft size={18} strokeWidth={3} /> Anterior
      </button>
    </div>
    
    <div className="flex justify-center">
      <button 
        onClick={onOpenFicha}
        className="text-[#e11d48] font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
      >
        Ficha Óptica
      </button>
    </div>

    <div className="flex justify-end">
      <button 
        onClick={onPasar}
        disabled={isLast}
        className="text-[#f43f5e] font-bold text-[15px] flex items-center gap-1 disabled:opacity-30 active:scale-95 transition-all"
      >
        Pasar <ChevronRight size={18} strokeWidth={3} />
      </button>
    </div>
  </div>
);
