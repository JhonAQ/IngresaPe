'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ProfileIcon,
  HomeIcon,
  TemarioIcon,
  EntrenarIcon,
  SimulacroIcon,
} from '@ingresa-pe/ui';

export function BottomNav() {
  const pathname = usePathname();

  const getTargetColor = (path: string) => {
    return pathname?.startsWith(path) ? 'text-error-500' : 'text-slate-400';
  };

  return (
    <nav className="absolute inset-x-0 bottom-0 bg-white border-t-2 border-slate-200 pb-safe z-50 flex justify-between items-center h-[72px] px-2">
      <Link href="/dashboard" className={`flex-1 flex flex-col items-center justify-center gap-1 ${getTargetColor('/dashboard')}`}>
        <HomeIcon className="w-[30px] h-[26px]" />
        <span className="text-[10px] font-black uppercase">Inicio</span>
      </Link>
      <Link href="/temario" className={`flex-1 flex flex-col items-center justify-center gap-1 ${getTargetColor('/temario')}`}>
        <TemarioIcon className="w-8 h-8" />
        <span className="text-[10px] font-bold uppercase">Temario</span>
      </Link>
      <Link href="/simulacros" className={`flex-1 flex flex-col items-center justify-center gap-1 ${getTargetColor('/simulacros')}`}>
        <SimulacroIcon className="w-[23px] h-[28px]" />
        <span className="text-[10px] font-bold uppercase">Simulacro</span>
      </Link>
      <Link href="/entrenar" className={`flex-1 flex flex-col items-center justify-center gap-1 ${getTargetColor('/entrenar')}`}>
        <EntrenarIcon className="w-8 h-6" />
        <span className="text-[10px] font-bold uppercase">Entrenar</span>
      </Link>
      <Link href="/perfil" className={`flex-1 flex flex-col items-center justify-center gap-1 ${getTargetColor('/perfil')}`}>
        <ProfileIcon className="w-6 h-[26px]" />
        <span className="text-[10px] font-bold uppercase">Perfil</span>
      </Link>
    </nav>
  );
}
