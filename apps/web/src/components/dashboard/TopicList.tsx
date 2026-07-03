import Link from 'next/link';
import { Check, Lock, BookOpen } from 'lucide-react';
import { TemaData } from '@ingresa-pe/domain';
import { MapNode, MapNodeColor } from '@ingresa-pe/ui';
import { TopicHeader } from './TopicHeader';
import { TopicDivider } from './TopicDivider';

interface TopicFromApi {
  id: string;
  name: string;
  slug: string;
  order: number;
  totalQuestions?: number;
  userProgress?: {
    correctCount: number;
    goal: number;
    percentage: number;
    isGold: boolean;
    isCompleted: boolean;
  };
}

interface TopicListProps {
  courseId: string;
  topics: TopicFromApi[];
  temario: TemaData[];
  onOpenSummary: (tema: TemaData) => void;
}

const pathPositions = [
  { x: 150, y: 50 },
  { x: 100, y: 150 },
  { x: 170, y: 250 },
  { x: 150, y: 350 },
];

export function TopicList({
  courseId,
  topics,
  temario,
  onOpenSummary,
}: TopicListProps) {
  // Mezclamos topics reales con el temario mock existente para no romper el diseño.
  // Cada topic real se renderiza como un nodo clickeable en el mapa.
  const mergedUnits =
    topics.length > 0
      ? topics.map((topic, index) => ({
          id: topic.id,
          tema: index + 1,
          titulo: topic.name,
          descripcion: topic.slug,
          variant: 'primary' as const,
          actividades: [
            {
              id: index,
              name: topic.name,
              state: topic.userProgress?.isGold
                ? ('completed' as const)
                : ('current' as const),
              icon: BookOpen,
              color: (topic.userProgress?.isGold
                ? 'success'
                : 'warning') as MapNodeColor,
            },
          ],
          resumenData: {
            introduccion: `Resumen de ${topic.name}`,
            imagenExplicativa: false,
            puntosClave: [],
            formulaDestacada: '',
            tipExamen: '',
          },
          color: topic.userProgress?.isGold ? '#58cc02' : '#1cb0f6',
        }))
      : temario;

  return (
    <div className="space-y-12 py-6 relative z-10">
      {mergedUnits.map((unidad, index) => {
        return (
          <div
            key={unidad.id}
            className="relative z-20 flex flex-col items-center"
          >
            {index > 0 && (
              <TopicDivider label={unidad.descripcion || 'Siguiente tema'} />
            )}

            <div className="w-full mb-4 flex justify-center">
              <TopicHeader
                subtitle={`TEMA ${unidad.tema}`}
                title={unidad.titulo}
                onGuideClick={() => onOpenSummary(unidad as TemaData)}
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
                  stroke="#e2e8f0"
                  strokeWidth="22"
                  strokeLinecap="round"
                  transform="translate(0, 4)"
                />
                <path
                  d="M 150 50 C 150 100, 100 100, 100 150 C 100 200, 170 200, 170 250 C 170 300, 150 300, 150 350"
                  fill="none"
                  stroke="#f8fafc"
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

                const nodeContent = (
                  <MapNode
                    status={act.state}
                    currentColor={act.color ?? 'warning'}
                    icon={RenderedIcon}
                  />
                );

                return (
                  <div
                    key={act.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: pos.x, top: pos.y, zIndex: 10 }}
                  >
                    {isLocked ? (
                      nodeContent
                    ) : (
                      <Link
                        href={`/engine?topicId=${unidad.id}&courseId=${courseId}`}
                        className="block relative"
                      >
                        {nodeContent}
                      </Link>
                    )}
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
