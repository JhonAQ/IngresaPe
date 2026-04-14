import { UserStats } from '../../types/dashboard';
import { StatBadge } from '@ingresa-pe/ui';

// Flat SVG Icons que lucen nativos de juegos (Estilo Flat / Duolingo)
const XPIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="6" width="20" height="14" rx="4" fill="#58A700" />
    <rect x="2" y="4" width="20" height="13" rx="4" fill="#58CC02" />
    <text
      x="12"
      y="10.5"
      fontFamily="Arial, sans-serif"
      fontSize="8.5"
      fontWeight="900"
      fontStyle="italic"
      fill="#FFFFFF"
      textAnchor="middle"
      dominantBaseline="central"
      alignmentBaseline="central"
      letterSpacing="0.5"
    >
      XP
    </text>
  </svg>
);

const GemIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
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
        <div className="flex items-center gap-2 py-1.5 shrink-0 select-none">
          {/* Contenedor y dimensiones de imagen bloqueados por hardware (inline styles de React) */}
          <div
            className="flex flex-col items-center justify-center shrink-0 rounded-full overflow-hidden"
            style={{
              width: 28,
              height: 28,
              minWidth: 28,
              minHeight: 28,
              maxWidth: 28,
              maxHeight: 28,
            }}
          >
            <img
              src="/logos/unsa.png"
              alt="UNSA"
              width={28}
              height={28}
              style={{
                width: '28px',
                height: '28px',
                minWidth: '28px',
                objectFit: 'contain',
              }}
              className="shrink-0 pointer-events-none"
            />
          </div>
          <span className="font-extrabold text-surface-600 tracking-tight text-[16px] uppercase pt-[2px]">
            UNSA
          </span>
        </div>

        {/* Panel derecho de estadísticas */}
        <div className="flex items-center gap-1">
          <StatBadge value={stats.racha} type="streak" />
          <StatBadge icon={<XPIcon />} value={stats.xp} type="xp" />
          <StatBadge value={stats.gemas} type="gem" />
        </div>
      </div>
    </header>
  );
}
