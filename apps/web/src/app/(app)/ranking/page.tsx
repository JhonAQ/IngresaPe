'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { trpc } from '../../../utils/trpc';
import {
  RankingTabs,
  RankingAccordion,
  RankingTableHeader,
  RankingTableRow,
  RankingZoneHeader,
  ReturnToUserFab,
} from '../../../components/ranking';
import type { RankingUserDto } from '@ingresa-pe/domain';
import { areaLabels, leagueConfig } from '@ingresa-pe/domain';

type Tab = 'career' | 'area' | 'league';
type Zone = 'promotion' | 'neutral' | 'relegation';

function getZone(rank: number, total: number): Zone {
  if (rank <= 3) return 'promotion';
  if (rank > total - 2) return 'relegation';
  return 'neutral';
}

function groupByZone(students: RankingUserDto[], total: number) {
  const promotion: RankingUserDto[] = [];
  const neutral: RankingUserDto[] = [];
  const relegation: RankingUserDto[] = [];

  students.forEach((student) => {
    const zone = getZone(student.rank, total);
    if (zone === 'promotion') promotion.push(student);
    else if (zone === 'relegation') relegation.push(student);
    else neutral.push(student);
  });

  return [
    { zone: 'promotion' as Zone, students: promotion },
    { zone: 'neutral' as Zone, students: neutral },
    { zone: 'relegation' as Zone, students: relegation },
  ].filter((g) => g.students.length > 0);
}

type RankingGroup = {
  key: string;
  title: string;
  students: RankingUserDto[];
  me: RankingUserDto | null;
  totalInLeague: number;
  minimumScore?: number | null;
};

function findUserInGroup(group: RankingGroup): RankingUserDto | null {
  return group.students.find((s) => s.isMe) ?? group.me;
}

function isUserInGroup(group: RankingGroup): boolean {
  return findUserInGroup(group) !== null;
}

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('career');
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const userGroupRef = useRef<HTMLDivElement>(null);
  const userRowRef = useRef<HTMLDivElement>(null);

  const { data: careersData, isLoading: isCareersLoading } =
    trpc.ranking.getAllCareersLeaderboard.useQuery(undefined, {
      enabled: activeTab === 'career',
    });
  const { data: areasData, isLoading: isAreasLoading } =
    trpc.ranking.getAllAreasLeaderboard.useQuery(undefined, {
      enabled: activeTab === 'area',
    });
  const { data: leagueData, isLoading: isLeagueLoading } =
    trpc.ranking.getWeeklyLeague.useQuery(undefined, {
      enabled: activeTab === 'league',
    });

  const isLoading =
    (activeTab === 'career' && isCareersLoading) ||
    (activeTab === 'area' && isAreasLoading) ||
    (activeTab === 'league' && isLeagueLoading);

  const groups: RankingGroup[] = useMemo(() => {
    if (activeTab === 'career' && careersData) {
      return careersData.groups.map((g) => ({
        key: g.careerId,
        title: `CARRERA >> ${g.careerName}`,
        students: g.top,
        me: g.me,
        totalInLeague: g.totalInLeague,
        minimumScore: g.minimumScore,
      }));
    }
    if (activeTab === 'area' && areasData) {
      return areasData.groups.map((g) => ({
        key: g.area,
        title: `ÁREA >> ${areaLabels[g.area].toUpperCase()}`,
        students: g.top,
        me: g.me,
        totalInLeague: g.totalInLeague,
      }));
    }
    if (activeTab === 'league' && leagueData) {
      const leagueLabel = leagueConfig[leagueData.currentLeague].label;
      return [
        {
          key: 'league',
          title: `LIGA SEMANAL >> Liga ${leagueLabel}`,
          students: leagueData.top,
          me: leagueData.me,
          totalInLeague: leagueData.totalInLeague,
        },
      ];
    }
    return [];
  }, [activeTab, careersData, areasData, leagueData]);

  const userGroup = useMemo(() => {
    if (!groups.length) return null;
    return groups.find((g) => isUserInGroup(g)) ?? groups[0];
  }, [groups]);

  const scrollToTarget = useCallback(() => {
    const container = scrollRef.current;
    // Liga intenta scrollear a la fila del usuario; si no está disponible,
    // fallback al grupo.
    const target =
      (activeTab === 'league' ? userRowRef.current : null) ??
      userGroupRef.current;
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, [activeTab]);

  // Todas las listas desplegadas; el grupo del usuario se reabre siempre.
  useEffect(() => {
    if (!groups.length) return;
    setOpenGroups(new Set(groups.map((g) => g.key)));
  }, [groups]);

  // Cada vez que se cambia de tab (o llegan datos), abrir el grupo del usuario
  // y scrollear a la lista (career/area) o a la fila del usuario (league).
  useEffect(() => {
    if (!groups.length || !userGroup) return;

    setOpenGroups((prev) => new Set([...prev, userGroup.key]));

    // Esperamos a que el acordeón termine de abrirse (Framer Motion ~250ms)
    // para que las posiciones del DOM sean finales.
    const timer = setTimeout(() => {
      scrollToTarget();
    }, 320);

    return () => clearTimeout(timer);
  }, [activeTab, groups, userGroup, scrollToTarget]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderStudents = (
    students: RankingUserDto[],
    targetRef?: React.RefObject<HTMLDivElement | null>
  ) => {
    if (students.length === 0) {
      return (
        <div className="py-4 text-center text-slate-400 font-bold text-[12px]">
          Sin datos para esta zona.
        </div>
      );
    }
    return students.map((student, idx) => {
      const isTarget = targetRef && student.isMe;
      return (
        <RankingTableRow
          key={student.id}
          user={student}
          index={idx}
          targetRef={isTarget ? targetRef : undefined}
        />
      );
    });
  };

  const renderHiddenCount = (shown: number, total: number) => {
    const hidden = total - shown;
    if (hidden <= 0) return null;
    return (
      <div className="flex justify-center py-0.5">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">
          ··· {hidden} {hidden === 1 ? 'usuario más' : 'usuarios más'} ···
        </span>
      </div>
    );
  };

  const renderGroupContent = (group: RankingGroup) => {
    const leagueTargetRef = activeTab === 'league' ? userRowRef : undefined;

    if (activeTab === 'league') {
      return (
        <>
          {groupByZone(group.students, group.students.length).map(
            ({ zone, students }) => (
              <div key={zone} className="mb-1">
                <RankingZoneHeader zone={zone} />
                {renderStudents(students, leagueTargetRef)}
              </div>
            )
          )}
          {group.me && !group.students.some((s) => s.isMe) && (
            <>
              {renderHiddenCount(group.students.length, group.totalInLeague)}
              <RankingTableRow
                user={group.me}
                index={group.students.length}
                targetRef={userRowRef}
              />
            </>
          )}
        </>
      );
    }

    return (
      <>
        {renderStudents(group.students)}
        {group.me && !group.students.some((s) => s.isMe) && (
          <>
            {renderHiddenCount(group.students.length, group.totalInLeague)}
            <RankingTableRow user={group.me} index={group.students.length} />
          </>
        )}
      </>
    );
  };

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <TrendingUp size={40} className="text-slate-300 mb-3" />
      <p className="text-slate-400 font-bold text-[14px]">
        Aún no hay datos para este ranking.
      </p>
    </div>
  );

  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-white">
      {/* Tabs + cabecera de columnas fija */}
      <div className="shrink-0 px-3 sm:px-4 pt-3 bg-white z-20">
        <RankingTabs active={activeTab} onChange={setActiveTab} />
        <RankingTableHeader />
      </div>

      {/* Contenido scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar relative z-10 px-3 sm:px-4 pb-24 text-[11px] sm:text-[12px]"
      >
        {isLoading ? (
          <div className="space-y-3 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : groups.length ? (
          groups.map((group) => {
            const isUserGroup = userGroup?.key === group.key;
            return (
              <div
                key={group.key}
                ref={isUserGroup ? userGroupRef : undefined}
                className="scroll-mt-2"
              >
                <RankingAccordion
                  title={group.title}
                  isOpen={openGroups.has(group.key)}
                  onToggle={() => toggleGroup(group.key)}
                  rightContent={
                    activeTab === 'career' && group.minimumScore != null ? (
                      <span className="text-[10px] font-bold text-slate-600 bg-white/60 px-2 py-0.5 rounded">
                        Histórico Min: {group.minimumScore.toFixed(0)} pts
                      </span>
                    ) : undefined
                  }
                >
                  {renderGroupContent(group)}
                </RankingAccordion>
              </div>
            );
          })
        ) : (
          renderEmpty()
        )}
      </div>

      <ReturnToUserFab scrollContainerRef={scrollRef} targetRef={userGroupRef} />
    </main>
  );
}
