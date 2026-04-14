import { UserStats } from '../../types/dashboard';
import { StatBadge } from '@ingresa-pe/ui';

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
          <StatBadge value={stats.xp} type="xp" />
          <StatBadge value={stats.gemas} type="gem" />
        </div>
      </div>
    </header>
  );
}
