'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { trpc } from '../../../utils/trpc';
import {
  RankingTabs,
  RankingAccordion,
  RankingTableHeader,
  RankingTableRow,
  ReturnToUserFab,
} from '../../../components/ranking';
import {
  leagueConfig,
  areaLabels,
  type RankingUserDto,
  type Area,
} from '@ingresa-pe/domain';

type Tab = 'league' | 'career' | 'area' | 'global';

function formatScore(score: number): string {
  return score.toFixed(1);
}

function DivisionBadge({ division }: { division: keyof typeof leagueConfig }) {
  const cfg = leagueConfig[division];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
      style={{ backgroundColor: cfg.hex + '20', color: cfg.hex }}
    >
      <span>{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}

function MoreRow({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="flex py-2 items-center justify-center border-b border-dashed border-slate-200 text-[11px] font-bold text-slate-400">
      ··· y {count} más ···
    </div>
  );
}

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('league');
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [meKey, setMeKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const meRef = useRef<HTMLDivElement | null>(null);

  const setMeRef = useCallback((node: HTMLDivElement | null) => {
    meRef.current = node;
    setMeKey((k) => k + 1);
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setExpandedSections({});
  }, []);

  const { data: myStats } = trpc.ranking.getMyStats.useQuery();
  const { data: seasonStatus } = trpc.ranking.getCurrentSeasonStatus.useQuery();

  const { data: leagueData, isLoading: isLeagueLoading } =
    trpc.ranking.getWeeklyLeague.useQuery(undefined, {
      enabled: activeTab === 'league',
    });
  const { data: careersData, isLoading: isCareersLoading } =
    trpc.ranking.getAllCareersLeaderboard.useQuery(undefined, {
      enabled: activeTab === 'career',
    });
  const { data: areasData, isLoading: isAreasLoading } =
    trpc.ranking.getAllAreasLeaderboard.useQuery(undefined, {
      enabled: activeTab === 'area',
    });
  const { data: globalData, isLoading: isGlobalLoading } =
    trpc.ranking.getGlobalLeaderboardGroup.useQuery(undefined, {
      enabled: activeTab === 'global',
    });

  const isLoading =
    (activeTab === 'league' && isLeagueLoading) ||
    (activeTab === 'career' && isCareersLoading) ||
    (activeTab === 'area' && isAreasLoading) ||
    (activeTab === 'global' && isGlobalLoading);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderStudents = (students: RankingUserDto[], showDelta = false) => {
    if (students.length === 0) {
      return (
        <div className="py-4 text-center text-slate-400 font-bold text-[12px]">
          Sin datos para esta lista.
        </div>
      );
    }
    return students.map((student, idx) => (
      <RankingTableRow
        key={student.id}
        user={student}
        index={idx}
        showDelta={showDelta}
        targetRef={student.isMe ? setMeRef : undefined}
      />
    ));
  };

  const renderUserRow = (user: RankingUserDto, showDelta = false) => (
    <RankingTableRow
      user={user}
      index={0}
      showDelta={showDelta}
      targetRef={setMeRef}
    />
  );

  // Scroll automático a la fila del usuario al cargar o cambiar de tab.
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (meRef.current && scrollRef.current) {
        const container = scrollRef.current;
        const target = meRef.current;
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const targetTop =
          targetRect.top - containerRect.top + container.scrollTop;
        const visibleCenter = container.clientHeight / 2;
        let scrollTop = targetTop - visibleCenter + targetRect.height / 2;
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (scrollTop < 0) scrollTop = 0;
        if (maxScroll > 0 && scrollTop > maxScroll) scrollTop = maxScroll;
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeTab, isLoading]);

  const seasonText = seasonStatus?.isRevealed
    ? 'Resultados revelados'
    : seasonStatus?.isEventOpen
    ? 'Finde de ranking abierto'
    : 'Finde de ranking cerrado';

  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-white">
      <div className="shrink-0 px-4 pt-4 pb-3 bg-white z-20">
        <div className="rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tu puntaje de admisión
              </p>
              <p className="font-black text-[28px] leading-none text-slate-800">
                {formatScore(myStats?.score ?? 0)}
              </p>
            </div>
            <DivisionBadge division={myStats?.division ?? 'HUEVITO'} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">
              Peak: {formatScore(myStats?.highestScore ?? 0)}
            </span>
            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
              {seasonText}
            </span>
          </div>
        </div>

        <RankingTabs active={activeTab} onChange={handleTabChange} />
        <RankingTableHeader showDelta={activeTab === 'league'} />
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar px-3 sm:px-4 pb-24 text-[11px] sm:text-[12px]"
      >
        {isLoading ? (
          <div className="space-y-3 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-slate-100 rounded animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === 'league' ? (
          leagueData?.top.length ? (
            <RankingAccordion
              title="LIGA SEMANAL"
              isOpen={expandedSections['Liga semanal'] ?? true}
              onToggle={() => toggleSection('Liga semanal')}
            >
              {renderStudents(leagueData.top, true)}
              <MoreRow
                count={leagueData.totalInLeague - leagueData.top.length}
              />
              {leagueData.me &&
                !leagueData.top.some((s) => s.isMe) &&
                renderUserRow(leagueData.me, true)}
            </RankingAccordion>
          ) : (
            <EmptyState />
          )
        ) : activeTab === 'career' ? (
          careersData?.groups.length ? (
            careersData.groups.map((group) => {
              const isMeInTop = group.top.some((s) => s.isMe);
              return (
                <RankingAccordion
                  key={group.careerId}
                  title={`CARRERA >> ${group.careerName}`}
                  isOpen={expandedSections[group.careerName] ?? true}
                  onToggle={() => toggleSection(group.careerName)}
                >
                  {renderStudents(group.top)}
                  <MoreRow count={group.totalInLeague - group.top.length} />
                  {group.me && !isMeInTop && renderUserRow(group.me)}
                </RankingAccordion>
              );
            })
          ) : (
            <EmptyState />
          )
        ) : activeTab === 'area' ? (
          areasData?.groups.length ? (
            areasData.groups.map((group) => {
              const title = areaLabels[group.area as Area];
              const isMeInTop = group.top.some((s) => s.isMe);
              return (
                <RankingAccordion
                  key={group.area}
                  title={`ÁREA >> ${title.toUpperCase()}`}
                  isOpen={expandedSections[title] ?? true}
                  onToggle={() => toggleSection(title)}
                >
                  {renderStudents(group.top)}
                  <MoreRow count={group.totalInLeague - group.top.length} />
                  {group.me && !isMeInTop && renderUserRow(group.me)}
                </RankingAccordion>
              );
            })
          ) : (
            <EmptyState />
          )
        ) : activeTab === 'global' ? (
          globalData?.top.length ? (
            <RankingAccordion
              title="GLOBAL >> TOP 20"
              isOpen={expandedSections['Global'] ?? true}
              onToggle={() => toggleSection('Global')}
            >
              {renderStudents(globalData.top)}
              <MoreRow
                count={globalData.totalInLeague - globalData.top.length}
              />
              {globalData.me &&
                !globalData.top.some((s) => s.isMe) &&
                renderUserRow(globalData.me)}
            </RankingAccordion>
          ) : (
            <EmptyState />
          )
        ) : null}
      </div>

      <ReturnToUserFab
        key={`${activeTab}-${meKey}`}
        scrollContainerRef={scrollRef}
        targetRef={meRef}
      />
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <TrendingUp size={40} className="text-slate-300 mb-3" />
      <p className="text-slate-400 font-bold text-[14px]">
        Aún no hay datos para este ranking.
      </p>
    </div>
  );
}
