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
import { areaLabels } from '@ingresa-pe/domain';

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
};

function findUserInGroup(group: RankingGroup): RankingUserDto | null {
  return group.students.find((s) => s.isMe) ?? group.me;
}

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('career');
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userRowRef = useRef<HTMLDivElement>(null);
  const lastScrolledKeyRef = useRef<string | null>(null);

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
      }));
    }
    if (activeTab === 'area' && areasData) {
      return areasData.groups.map((g) => ({
        key: g.area,
        title: `ÁREA >> ${areaLabels[g.area].toUpperCase()}`,
        students: g.top,
        me: g.me,
      }));
    }
    if (activeTab === 'league' && leagueData) {
      return [
        {
          key: 'league',
          title: 'LIGA SEMANAL',
          students: leagueData.top,
          me: leagueData.me,
        },
      ];
    }
    return [];
  }, [activeTab, careersData, areasData, leagueData]);

  const activeGroup = useMemo(() => {
    if (!groups.length) return null;
    if (activeGroupKey) {
      return groups.find((g) => g.key === activeGroupKey) ?? groups[0];
    }
    const withUser = groups.find((g) => findUserInGroup(g));
    return withUser ?? groups[0];
  }, [groups, activeGroupKey]);

  const userStudent = activeGroup ? findUserInGroup(activeGroup) : null;

  const scrollToUser = useCallback(() => {
    const container = scrollRef.current;
    const target = userRowRef.current;
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top - containerRect.top + container.scrollTop;
    const visibleCenter = container.clientHeight / 2;

    let scrollTop = targetTop - visibleCenter + targetRect.height / 2;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (scrollTop < 0) scrollTop = 0;
    if (maxScroll > 0 && scrollTop > maxScroll) scrollTop = maxScroll;

    container.scrollTo({ top: scrollTop, behavior: 'smooth' });
  }, []);

  // Al cambiar de tab o llegar datos, abrir grupo del usuario y scrollear a su fila.
  useEffect(() => {
    if (!groups.length) return;

    const withUser = groups.find((g) => findUserInGroup(g));
    const nextKey = withUser?.key ?? groups[0].key;
    const scrollKey = `${activeTab}-${nextKey}`;

    setActiveGroupKey(nextKey);

    if (lastScrolledKeyRef.current === scrollKey) return;

    const raf = requestAnimationFrame(() => {
      scrollToUser();
    });
    lastScrolledKeyRef.current = scrollKey;

    return () => cancelAnimationFrame(raf);
  }, [activeTab, groups, scrollToUser]);

  const toggleGroup = (key: string) => {
    setActiveGroupKey((current) => (current === key ? null : key));
  };

  const renderStudents = (students: RankingUserDto[], groupKey: string) => {
    if (students.length === 0) {
      return (
        <div className="py-4 text-center text-slate-400 font-bold text-[12px]">
          Sin datos para esta zona.
        </div>
      );
    }
    return students.map((student, idx) => {
      const isTarget =
        activeGroup?.key === groupKey && userStudent?.id === student.id;
      return (
        <RankingTableRow
          key={student.id}
          user={student}
          index={idx}
          targetRef={isTarget ? userRowRef : undefined}
        />
      );
    });
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
        ) : activeTab === 'league' ? (
          groups.length ? (
            groups.map((group) => (
              <RankingAccordion
                key={group.key}
                title={group.title}
                isOpen={activeGroup?.key === group.key}
                onToggle={() => toggleGroup(group.key)}
              >
                {groupByZone(group.students, group.students.length).map(
                  ({ zone, students }) => (
                    <div key={zone} className="mb-2">
                      <RankingZoneHeader zone={zone} />
                      {renderStudents(students, group.key)}
                    </div>
                  )
                )}
                {group.me && !group.students.some((s) => s.isMe) && (
                  <RankingTableRow
                    user={group.me}
                    index={group.students.length}
                    targetRef={
                      userStudent?.id === group.me.id ? userRowRef : undefined
                    }
                  />
                )}
              </RankingAccordion>
            ))
          ) : (
            renderEmpty()
          )
        ) : groups.length ? (
          groups.map((group) => (
            <RankingAccordion
              key={group.key}
              title={group.title}
              isOpen={activeGroup?.key === group.key}
              onToggle={() => toggleGroup(group.key)}
            >
              {renderStudents(group.students, group.key)}
              {group.me && !group.students.some((s) => s.isMe) && (
                <RankingTableRow
                  user={group.me}
                  index={group.students.length}
                  targetRef={
                    userStudent?.id === group.me.id ? userRowRef : undefined
                  }
                />
              )}
            </RankingAccordion>
          ))
        ) : (
          renderEmpty()
        )}
      </div>

      <ReturnToUserFab scrollContainerRef={scrollRef} targetRef={userRowRef} />
    </main>
  );
}
