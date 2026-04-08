import { FileText, Check, Lock } from 'lucide-react';
import { TemaData } from '../../types/dashboard';

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
          <div
            className={`p-5 rounded-3xl mb-14 text-white ${unidad.color} border-b-[6px] ${unidad.shadow} shadow-lg relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-black tracking-tight mb-1">
                  Tema {unidad.tema}
                </h2>
                <h3 className="font-bold text-white/90 text-sm leading-snug">
                  {unidad.titulo}
                </h3>
              </div>
              <button
                onClick={() => onOpenSummary(unidad)}
                className="bg-white/20 hover:bg-white/30 border-2 border-white/30 border-b-[4px] active:border-b-2 active:translate-y-[2px] px-3 py-2 rounded-xl flex flex-col items-center gap-1 transition-all"
              >
                <FileText size={16} />
                <span className="text-[8px] font-black uppercase tracking-wider">
                  Resumen
                </span>
              </button>
            </div>
          </div>

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
                stroke="#cbd5e1"
                strokeWidth="22"
                strokeLinecap="round"
                transform="translate(0, 4)"
              />
              <path
                d="M 150 50 C 150 100, 100 100, 100 150 C 100 200, 170 200, 170 250 C 170 300, 150 300, 150 350"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="22"
                strokeLinecap="round"
              />
            </svg>

            {unidad.actividades.map((act, idx) => {
              const isCompleted = act.state === 'completed';
              const isCurrent = act.state === 'current';
              const isLocked = act.state === 'locked';
              const pos = pathPositions[idx];
              const Icon = act.icon;

              let btnBase = 'bg-[#f1f5f9] border-[#cbd5e1]';
              let iconColor = 'text-[#9CA3AF]';

              if (isCompleted) {
                btnBase = `${unidad.color} ${unidad.shadow}`;
                iconColor = 'text-white';
              } else if (isCurrent) {
                btnBase = `${act.color || 'bg-[#F97316]'} ${
                  act.border || 'border-[#C2410C]'
                }`;
                iconColor = 'text-white';
              }

              return (
                <div
                  key={act.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: pos.x, top: pos.y, zIndex: 10 }}
                >
                  <div className="relative flex items-center justify-center">
                    {isCurrent && (
                      <>
                        <div className="absolute w-[88px] h-[88px] bg-white rounded-full z-0 shadow-sm border border-slate-100" />
                        <div className="absolute w-[88px] h-[88px] rounded-full border-4 border-slate-200 animate-ripple-pro z-0" />
                      </>
                    )}
                    <button
                      className={`relative z-10 w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-100 border-b-[6px] active:border-b-0 active:translate-y-[6px] active:shadow-none ${btnBase}`}
                      disabled={isLocked}
                    >
                      {isCompleted ? (
                        <Check
                          size={36}
                          className="text-white"
                          strokeWidth={3.5}
                        />
                      ) : isLocked ? (
                        <Lock
                          size={26}
                          className={iconColor}
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Icon
                          size={32}
                          className={iconColor}
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
