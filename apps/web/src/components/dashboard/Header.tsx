import { UserStats } from '../../types/dashboard';
import { StatBadge } from '@ingresa-pe/ui';
import { ChevronDown } from 'lucide-react';

// Flat SVG Icons que lucen nativos de juegos (Estilo Flat / Duolingo)
const FlameIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 5 7 5 14C5 18 8 22 12 22C16 22 19 18 19 14C19 9 14 5 14 5C14 5 15 9 12 11C12 11 11 5 12 2Z" fill="#FF9600" />
    <path d="M12 11C12 11 10 13 10 15C10 16.6569 11.3431 18 13 18C14.6569 18 16 16.6569 16 15C16 12 12 11 12 11Z" fill="#FFC800" />
  </svg>
);

const XPIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="14" rx="4" fill="#58A700" />
    <rect x="2" y="4" width="20" height="13" rx="4" fill="#58CC02" />
    <text x="12" y="13" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="900" fontStyle="italic" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">XP</text>
  </svg>
);

const GemIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5L3 8.5L8.5 8.5L12 2.5Z" fill="#1CB0F6" />
    <path d="M12 2.5L21 8.5L15.5 8.5L12 2.5Z" fill="#1CB0F6" />
    <path d="M12 2.5L8.5 8.5L15.5 8.5L12 2.5Z" fill="#78C8F9" />
    <path d="M3 8.5L12 21.5L8.5 8.5L3 8.5Z" fill="#1899D6" />
    <path d="M21 8.5L12 21.5L15.5 8.5L21 8.5Z" fill="#1483B8" />
    <path d="M8.5 8.5L12 21.5L15.5 8.5L8.5 8.5Z" fill="#1CB0F6" />
  </svg>
);

interface HeaderProps {
  stats: UserStats;
}

export function DashboardHeader({ stats }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-surface-200 px-4 py-2">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        
        {/* Selector de Universidad (Pill con Logo y Texto) */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 border-surface-200 bg-white hover:bg-surface-50 shadow-sm transition-all cursor-pointer select-none active:translate-y-[2px] active:shadow-none group shrink-0">
          {/* Imagen forzada estructuralmente a ser cuadrada sin importar sus dimensiones base */}
          <img 
            src="/logos/unsa.png" 
            alt="UNSA" 
            className="w-7 h-7 object-contain shrink-0 aspect-square rounded-full" 
          />
          <span className="font-extrabold text-surface-600 tracking-tight text-[16px] uppercase pt-[2px]">
            UNSA
          </span>
          <ChevronDown strokeWidth={3.5} className="text-surface-400 w-4 h-4 shrink-0 transition-colors group-hover:text-surface-600 ml-0.5" />
        </button>

        {/* Panel derecho de estadísticas */}
        <div className="flex items-center gap-1">
          <StatBadge icon={<FlameIcon />} value={stats.racha} type="streak" />
          <StatBadge icon={<XPIcon />} value={stats.xp} type="xp" />
          <StatBadge icon={<GemIcon />} value={stats.gemas} type="gem" />
        </div>

      </div>
    </header>
  );
}
