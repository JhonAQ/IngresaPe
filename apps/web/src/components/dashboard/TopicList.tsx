import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Lock, BookOpen, Target, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
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
  nodeSize?: number;
  nodeCount?: number;
  userProgress?: {
    attemptedCount: number;
    correctCount: number;
    nodeSize: number;
    nodeCount: number;
    completedNodes: number;
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

function getNodeName(index: number) {
  return NODE_NAMES[index] ?? `Lección ${index + 1}`;
}

function getNodeIcon(index: number) {
  return NODE_ICONS[index % NODE_ICONS.length];
}

function buildActivities(
  topic: TopicFromApi,
  topicIndex: number,
  isLocked: boolean
) {
  const totalQuestions = topic.totalQuestions ?? 15;
  const nodeSize = topic.nodeSize ?? topic.userProgress?.nodeSize ?? 7;
  const nodeCount =
    topic.nodeCount ??
    topic.userProgress?.nodeCount ??
    Math.max(1, Math.ceil(totalQuestions / nodeSize));
  const completedNodes = topic.userProgress?.completedNodes ?? 0;
  const isCompleted = topic.userProgress?.isCompleted ?? false;
  const isGold = topic.userProgress?.isGold ?? false;

  // Si el tema está bloqueado, todo bloqueado.
  if (isLocked) {
    return Array.from({ length: nodeCount }, (_, i) => ({
      id: `${topicIndex}-${i}`,
      name: getNodeName(i),
      state: 'locked' as const,
      icon: getNodeIcon(i),
      nodeSize,
      color: 'primary' as MapNodeColor,
    }));
  }

  // Si el tema ya fue completado o dominado, todos los nodos completados.
  if (isCompleted || isGold) {
    return Array.from({ length: nodeCount }, (_, i) => ({
      id: `${topicIndex}-${i}`,
      name: getNodeName(i),
      state: 'completed' as const,
      icon: getNodeIcon(i),
      nodeSize,
      color: (isGold ? 'success' : 'primary') as MapNodeColor,
    }));
  }

  // Progreso por nodos: cada nodo se completa al jugar `nodeSize` preguntas.
  const currentNodeIndex = completedNodes;

  return Array.from({ length: nodeCount }, (_, i) => {
    let state: 'completed' | 'current' | 'locked';
    if (i < completedNodes) {
      state = 'completed';
    } else if (i === currentNodeIndex) {
      state = 'current';
    } else {
      state = 'locked';
    }

    return {
      id: `${topicIndex}-${i}`,
      name: getNodeName(i),
      state,
      icon: getNodeIcon(i),
      nodeSize,
      color: (state === 'completed'
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
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b
        );

        const topicId = topmost.target.getAttribute('data-topic-id');
        if (topicId) onActiveTopicChange(topicId);
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

  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const lastScrolledKeyRef = useRef<string | null>(null);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [returnDirection, setReturnDirection] = useState<'up' | 'down'>('down');

  const activeNodeInfo = useMemo(() => {
    for (let ti = 0; ti < mergedUnits.length; ti++) {
      const acts = mergedUnits[ti].actividades;
      const idx = acts.findIndex((a) => a.state === 'current');
      if (idx !== -1) return { topicIndex: ti, actIndex: idx, key: `${ti}-${idx}` };
    }
    if (mergedUnits.length > 0) {
      const lastTi = mergedUnits.length - 1;
      const lastAi = mergedUnits[lastTi].actividades.length - 1;
      if (lastAi >= 0) return { topicIndex: lastTi, actIndex: lastAi, key: `${lastTi}-${lastAi}` };
    }
    return null;
  }, [mergedUnits]);

  const scrollToActiveNode = useCallback(() => {
    if (!scrollContainerRef?.current || !activeNodeInfo) return;
    const container = scrollContainerRef.current;
    const el = nodeRefs.current.get(activeNodeInfo.key);
    if (!el) return;

    const sticky = document.getElementById('course-progress-sticky');
    const stickyHeight = sticky ? sticky.getBoundingClientRect().height : 110;
    const containerRect = container.getBoundingClientRect();
    const nodeRect = el.getBoundingClientRect();
    const nodeTop = nodeRect.top - containerRect.top + container.scrollTop;
    const visibleCenter = stickyHeight + (container.clientHeight - stickyHeight) / 2;

    let target = nodeTop - visibleCenter + nodeRect.height / 2;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (target < 0) target = 0;
    if (maxScroll > 0 && target > maxScroll) target = maxScroll;

    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [activeNodeInfo, scrollContainerRef]);

  // Auto-scroll al nodo activo siempre que el mapa cambie (carga, recarga, atrás, curso nuevo...)
  useEffect(() => {
    if (!scrollContainerRef?.current || !activeNodeInfo) return;

    const scrollKey =
      mergedUnits
        .map((u) => u.actividades.map((a) => a.state).join(','))
        .join('|') + `:${courseId}`;

    if (lastScrolledKeyRef.current === scrollKey) return;

    const raf = requestAnimationFrame(scrollToActiveNode);
    lastScrolledKeyRef.current = scrollKey;

    return () => cancelAnimationFrame(raf);
  }, [mergedUnits, scrollContainerRef, courseId, activeNodeInfo, scrollToActiveNode]);

  // Mostrar botón flotante cuando el nodo activo sale de la vista.
  useEffect(() => {
    if (!scrollContainerRef?.current || !activeNodeInfo) return;

    const container = scrollContainerRef.current;
    const el = nodeRefs.current.get(activeNodeInfo.key);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setShowReturnButton(false);
          return;
        }
        setShowReturnButton(true);
        const rootBounds = entry.rootBounds;
        if (rootBounds && entry.boundingClientRect.top < rootBounds.top) {
          setReturnDirection('up');
        } else {
          setReturnDirection('down');
        }
      },
      { root: container, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeNodeInfo, scrollContainerRef]);

  const setNodeRef =
    (key: string) =>
    (el: HTMLElement | null): void => {
      if (el) {
        nodeRefs.current.set(key, el);
      } else {
        nodeRefs.current.delete(key);
      }
    };

  return (
    <>
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
                    ref={setNodeRef(`${index}-${actIndex}`)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: pos.x, top: pos.y, zIndex: 10 }}
                  >
                    {isLocked ? (
                      nodeContent
                    ) : (
                      <Link
                        href={`/engine?topicId=${unidad.id}&courseId=${courseId}&nodeIndex=${actIndex}&nodeSize=${act.nodeSize}`}
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

    {showReturnButton && activeNodeInfo && (
      <motion.button
        onClick={scrollToActiveNode}
        initial={{ x: '-50%', scale: 0, opacity: 0 }}
        animate={{ x: '-50%', scale: [1, 1.08, 1], opacity: 1 }}
        transition={{
          opacity: { duration: 0.2 },
          x: { duration: 0 },
          scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9, y: 3 }}
        className="fixed bottom-24 left-1/2 z-50 w-12 h-12 rounded-full bg-white text-[#1cb0f6] shadow-[0_6px_0_#e5e7eb] border-2 border-slate-100 flex items-center justify-center"
        aria-label="Volver al nodo activo"
      >
        {returnDirection === 'up' ? (
          <ChevronUp size={28} strokeWidth={3} />
        ) : (
          <ChevronDown size={28} strokeWidth={3} />
        )}
      </motion.button>
    )}
  </>
  );
}
