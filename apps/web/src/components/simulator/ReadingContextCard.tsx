import React, { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

interface ReadingContextCardProps {
  contexto?: string;
}

export const ReadingContextCard = ({ contexto }: ReadingContextCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!contexto) return null;

  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-[15px]">Texto de Lectura</h3>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mt-0.5">
              {isExpanded ? 'Toca para ocultar' : 'Toca para expandir'}
            </p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} strokeWidth={3} />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="pt-4 border-t-2 border-slate-100">
            <div className="max-h-52 overflow-y-auto pr-2">
              <p className="text-slate-600 text-[15px] font-medium leading-relaxed">
                {contexto}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
