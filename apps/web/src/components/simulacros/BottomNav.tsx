import React from 'react';
import { Home, BookOpen, LayoutGrid, Dumbbell, User } from 'lucide-react';

export const BottomNav = () => {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 px-2 py-2 z-50">
      <div className="flex justify-between items-center max-w-sm mx-auto pb-safe">
        <div className="flex flex-col items-center gap-1 w-16 py-1 text-slate-400">
          <Home size={22} />
          <span className="text-[9px] font-black uppercase tracking-wider">Inicio</span>
        </div>
        <div className="flex flex-col items-center gap-1 w-16 py-1 text-slate-400">
          <BookOpen size={22} />
          <span className="text-[9px] font-black uppercase tracking-wider">Temario</span>
        </div>
        <div className="flex flex-col items-center gap-1 w-20 py-1 text-red-500">
          <div className="relative">
            <LayoutGrid size={24} strokeWidth={3} className="fill-red-50" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Simulacro</span>
        </div>
        <div className="flex flex-col items-center gap-1 w-16 py-1 text-slate-400">
          <Dumbbell size={22} />
          <span className="text-[9px] font-black uppercase tracking-wider">Entrenar</span>
        </div>
        <div className="flex flex-col items-center gap-1 w-16 py-1 text-slate-400">
          <User size={22} />
          <span className="text-[9px] font-black uppercase tracking-wider">Perfil</span>
        </div>
      </div>
    </nav>
  );
};
