import { FileText, NotebookText, Check, Lock } from 'lucide-react';
import { TemaData } from '../../types/dashboard';
import { Card3D, Button3D, MapNode } from '@ingresa-pe/ui';
import { TopicHeader } from './TopicHeader';

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

const topicVariantStyles: Record<string, string> = {
  primary: 'bg-[#bd1720] border-[#911019] text-white',
  success: 'bg-[#58cc02] border-[#58a700] text-white',
  surface: 'bg-white border-[#cbd5e1] text-slate-800',
  error: 'bg-[#ff4b4b] border-[#ea1515] text-white',
};

export function TopicList({ temario, onOpenSummary }: TopicListProps) {
  return (
    <div className="space-y-12 py-6 relative z-10">
      {temario.map((unidad) => {
        const themeClass =
          topicVariantStyles[unidad.variant || 'primary'] ||
          topicVariantStyles.primary;
        const isLight = unidad.variant === 'surface';

        return (
          <div
            key={unidad.id}
            className="relative z-20 flex flex-col items-center"
          >
            <div className="w-full px-4 sm:px-6 mb-4 flex justify-center">
              <TopicHeader
                subtitle={`TEMA ${unidad.tema}`}
                title={unidad.titulo}
                onGuideClick={() => onOpenSummary(unidad)}
              />
            </div>

            <div className="relative w-[300px] mx-auto h-[400px]">
              <svg
                width="300"
                height="400"
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  zIndex: 0,
                  filter: 'drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.2))',
                }}
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
        );
      })}
    </div>
  );
}
