import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { Check, Lock, BookOpen, Target, Star } from 'lucide-react';
import { TemaData, SummaryBlock } from '@ingresa-pe/domain';
import { MapNode, MapNodeColor } from '@ingresa-pe/ui';
import { TopicDivider } from './TopicDivider';

export interface TopicFromApi {
  id: string;
  name: string;
  slug: string;
  order: number;
  summary?: SummaryBlock[] | null;
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

const NODE_ICONS = [BookOpen, Target, Star];
const NODE_NAMES = ['Teoría', 'Práctica', 'Desafío'];

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

function buildActivities(
  topic: TopicFromApi,
  topicIndex: number,
  isLocked: boolean
) {
  const correctCount = topic.userProgress?.correctCount ?? 0;
  const isCompleted = topic.userProgress?.isCompleted ?? false;
  const isGold = topic.userProgress?.isGold ?? false;
  const totalQuestions = topic.totalQuestions ?? 15;
  const nodeGoal = Math.max(1, Math.ceil(totalQuestions / 3));

  return Array.from({ length: 3 }, (_, i) => {
    const threshold = (i + 1) * nodeGoal;
    let state: 'completed' | 'current' | 'locked';

    if (isLocked) {
      state = 'locked';
    } else if (isCompleted || isGold || correctCount >= threshold) {
      state = 'completed';
    } else if (i === 0 || correctCount >= i * nodeGoal) {
      state = 'current';
    } else {
      state = 'locked';
    }

    return {
      id: `${topicIndex}-${i}`,
      name: NODE_NAMES[i],
      state,
      icon: NODE_ICONS[i],
      color: (isGold || isCompleted
        ? 'success'
        : state === 'current'
        ? 'warning'
        : 'primary') as MapNodeColor,
    };
  });
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
      ? topics.map((topic, index) => {
          const previousTopicCompleted =
            index === 0 ||
            topics[index - 1].userProgress?.isCompleted === true ||
            topics[index - 1].userProgress?.isGold === true;
          const isLocked = !previousTopicCompleted;

          return {
            id: topic.id,
            tema: index + 1,
            titulo: topic.name,
            descripcion: topic.slug,
            variant: 'primary' as const,
            actividades: buildActivities(topic, index, isLocked),
            resumenData: topic.summary ?? [],
            color: topic.userProgress?.isGold ? '#58cc02' : '#1cb0f6',
          };
        })
      : temario;

  const topicRefs = useRef(new Map<string, HTMLElement>());

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
        rootMargin: '-15% 0px -60% 0px',
        threshold: 0,
      }
    );

    topicRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mergedUnits, onActiveTopicChange, scrollContainerRef]);

  const setTopicRef =
    (topicId: string) =>
    (el: HTMLElement | null): void => {
      if (el) {
        topicRefs.current.set(topicId, el);
      } else {
        topicRefs.current.delete(topicId);
      }
    };

  return (
    <div className="space-y-12 py-6 relative z-10">
      {mergedUnits.map((unidad, index) => {
        const pathPositions = generatePathPositions(unidad.actividades.length);
        const pathD = buildPathD(pathPositions);
        const svgHeight =
          pathPositions.length > 1
            ? pathPositions[pathPositions.length - 1].y + BOTTOM_MARGIN
            : 400;

        return (
          <div
            key={unidad.id}
            ref={setTopicRef(String(unidad.id))}
            data-topic-id={String(unidad.id)}
            className="relative z-20 flex flex-col items-center"
          >
            {index > 0 && (
              <TopicDivider label={unidad.descripcion || 'Siguiente tema'} />
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

              {unidad.actividades.map((act, actIndex) => {
                const pos = pathPositions[actIndex];
                if (!pos) return null;

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
