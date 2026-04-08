import { FileText, Check, Lock } from 'lucide-react';
import { TemaData } from '../../types/dashboard';
import { Card3D, Button3D, MapNode } from '@ingresa-pe/ui';

interface TopicListProps {
  temario: TemaData[];
  onOpenSummary: (tema: TemaData) => void;
}

const pathPositions = [
  { x: 150, y: 50 },
  { x: 100, y: 150 },
  { x: 170, y: 250 },
  { x: 150, y: 350 },
];

export function TopicList({ temario, onOpenSummary }: TopicListProps) {
  return (
    <div className="space-y-12 py-6 relative z-10">
      {temario.map((unidad) => (
        <div key={unidad.id} className="relative">
          <Card3D variant={unidad.variant} className="mb-14 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-black tracking-tight mb-1 text-white">
                  Tema {unidad.tema}
                </h2>
                <h3 className="font-bold text-white/90 text-sm leading-snug">
                  {unidad.titulo}
                </h3>
              </div>
              <Button3D
                variant="surface"
                size="sm"
                onClick={() => onOpenSummary(unidad)}
                className="bg-white/20 hover:bg-white/30 border-white/30 border-2 text-white shadow-none hover:shadow-none active:shadow-none translate-y-0 active:translate-y-[2px]" // Sobreescribimos algunos estilos para igualar el tooltip translúcido
              >
                <div className="flex flex-col items-center gap-1">
                  <FileText size={16} />
                  <span className="text-[8px] font-black uppercase tracking-wider">
                    Resumen
                  </span>
                </div>
              </Button3D>
            </div>
          </Card3D>

          <div className="relative w-[300px] mx-auto h-[400px]">
            <svg
              width="300"
              height="400"
              className="absolute top-0 left-0 pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <path
                d="M 150 50 C 150 100, 100 100, 100 150 C 100 200, 170 200, 170 250 C 170 300, 150 300, 150 350"
                fill="none"
                stroke="#e2e8f0" // surface-200 para la rama base
                strokeWidth="22"
                strokeLinecap="round"
                transform="translate(0, 4)"
              />
              <path
                d="M 150 50 C 150 100, 100 100, 100 150 C 100 200, 170 200, 170 250 C 170 300, 150 300, 150 350"
                fill="none"
                stroke="#f8fafc" // surface-50 para el interior
                strokeWidth="22"
                strokeLinecap="round"
              />
            </svg>

            {unidad.actividades.map((act, idx) => {
              const isCompleted = act.state === 'completed';
              const isLocked = act.state === 'locked';
              const pos = pathPositions[idx];
              const Icon = act.icon;

              const RenderedIcon = isCompleted ? (
                <Check size={36} strokeWidth={3.5} />
              ) : isLocked ? (
                <Lock size={26} strokeWidth={2.5} />
              ) : (
                <Icon size={32} strokeWidth={2.5} />
              );

              return (
                <div
                  key={act.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: pos.x, top: pos.y, zIndex: 10 }}
                >
                  <MapNode
                    status={act.state}
                    currentColor={act.color ?? 'warning'}
                    icon={RenderedIcon}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
