import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { Check, Lock, BookOpen } from 'lucide-react';
import { TemaData } from '@ingresa-pe/domain';
import { MapNode, MapNodeColor } from '@ingresa-pe/ui';
import { TopicDivider } from './TopicDivider';

export interface TopicFromApi {
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
  onActiveTopicChange?: (topicId: string) => void;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

const SVG_WIDTH = 300;
const TOP_MARGIN = 50;
const BOTTOM_MARGIN = 50;
const NODE_SPACING = 90;
const X_LEFT = 95;
const X_RIGHT = 205;

function generatePathPositions(count: number) {
  if (count <= 0) return [];
  const availableHeight = 400 - TOP_MARGIN - BOTTOM_MARGIN;
  const spacing = Math.min(NODE_SPACING, availableHeight / (count - 1 || 1));
  const positions = [];
  for (let i = 0; i < count; i++) {
    const y = TOP_MARGIN + i * spacing;
    const x = i % 2 === 0 ? X_RIGHT : X_LEFT;
    positions.push({ x, y });
  }
  return positions;
}

function buildPathD(positions: { x: number; y: number }[]) {
  if (positions.length === 0) return '';
  let d = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function TopicList({
  courseId,
  topics,
  temario,
  onOpenSummary,
  onActiveTopicChange,
  scrollContainerRef,
}: TopicListProps) {
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

  const pathPositions = generatePathPositions(mergedUnits.length);
  const pathD = buildPathD(pathPositions);
  const svgHeight =
    mergedUnits.length > 1
      ? pathPositions[pathPositions.length - 1].y + BOTTOM_MARGIN
      : 400;

  const dividerRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    if (!scrollContainerRef?.current || !onActiveTopicChange) return;

    const container = scrollContainerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const topicId = entry.target.getAttribute('data-topic-id');
            if (topicId) onActiveTopicChange(topicId);
          }
        });
      },
      {
        root: container,
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      }
    );

    dividerRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mergedUnits, onActiveTopicChange, scrollContainerRef]);

  const setDividerRef =
    (topicId: string) =>
    (el: HTMLElement | null): void => {
      if (el) {
        dividerRefs.current.set(topicId, el);
      } else {
        dividerRefs.current.delete(topicId);
      }
    };

  return (
    <div className="space-y-12 py-6 relative z-10">
      {mergedUnits.map((unidad, index) => {
        const pos = pathPositions[index];
        if (!pos) return null;

        return (
          <div
            key={unidad.id}
            className="relative z-20 flex flex-col items-center"
          >
            {index > 0 && (
              <TopicDivider
                ref={setDividerRef(String(unidad.id))}
                data-topic-id={String(unidad.id)}
                label={unidad.descripcion || 'Siguiente tema'}
              />
            )}

            <div
              className="relative w-[300px] mx-auto"
              style={{ height: svgHeight }}
            >
              <svg
                width={SVG_WIDTH}
                height={svgHeight}
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  zIndex: 0,
                  filter: 'drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.2))',
                }}
              >
                <path
                  d={pathD}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="22"
                  strokeLinecap="round"
                  transform="translate(0, 4)"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f8fafc"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
              </svg>

              {unidad.actividades.map((act) => {
                const isCompleted = act.state === 'completed';
                const isLocked = act.state === 'locked';
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
