import { FileText, Swords } from 'lucide-react';
import { ProfileIcon, HomeIcon, TemarioIcon } from '@ingresa-pe/ui';

export function BottomNav() {
  return (
    <nav className="absolute inset-x-0 bottom-0 bg-white border-t-2 border-slate-200 pb-safe z-50 flex justify-between items-center h-[72px] px-2">
      <button className="flex-1 flex flex-col items-center justify-center gap-1 text-error-500">
        <HomeIcon className="w-[30px] h-[26px]" />
        <span className="text-[10px] font-black uppercase">Inicio</span>
      </button>
      <button className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400">
        <TemarioIcon className="w-8 h-8" />
        <span className="text-[10px] font-bold uppercase">Temario</span>
      </button>
      <button className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400">
        <FileText size={26} strokeWidth={2.5} />
        <span className="text-[10px] font-bold uppercase">Simulacro</span>
      </button>
      <button className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400">
        <Swords size={26} strokeWidth={2.5} />
        <span className="text-[10px] font-bold uppercase">Entrenar</span>
      </button>
      <button className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400">
        <ProfileIcon className="w-6 h-[26px]" />
        <span className="text-[10px] font-bold uppercase">Perfil</span>
      </button>
    </nav>
  );
}
