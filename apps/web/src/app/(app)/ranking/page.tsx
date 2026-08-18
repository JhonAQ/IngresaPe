'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Crown } from 'lucide-react';
import { trpc } from '../../../utils/trpc';
import { UserPreviewModal } from '../../../components/social/UserPreviewModal';
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

type Tab = 'career' | 'area' | 'global';

function formatScore(score: number): string {
  return score.toFixed(1);
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
  const [activeTab, setActiveTab] = useState<Tab>('career');
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [meKey, setMeKey] = useState(0);
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);
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
    (activeTab === 'career' && isCareersLoading) ||
    (activeTab === 'area' && isAreasLoading) ||
    (activeTab === 'global' && isGlobalLoading);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderStudents = (students: RankingUserDto[]) => {
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
        targetRef={student.isMe ? setMeRef : undefined}
        onUserClick={(id) => setPreviewUserId(id)}
      />
    ));
  };

  const renderUserRow = (user: RankingUserDto) => (
    <RankingTableRow
      user={user}
      index={0}
      targetRef={setMeRef}
      onUserClick={(id) => setPreviewUserId(id)}
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

  const divisionColor =
    leagueConfig[myStats?.division ?? 'HUEVITO']?.hex ?? '#9CA3AF';

  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-white">
      <div className="shrink-0 px-4 pt-4 pb-3 bg-white z-20">
        {/* User score card */}
        <div
          className="relative overflow-hidden rounded-[1.5rem] border-2 border-slate-200 border-b-[4px] p-4 mb-3 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${divisionColor}18 0%, ${divisionColor}08 100%)`,
            borderBottomColor: divisionColor,
          }}
        >
          {/* Division watermark */}
          <span
            className="absolute -right-1 -bottom-5 font-black text-[64px] uppercase tracking-tighter leading-none opacity-[0.15] pointer-events-none select-none"
            style={{ color: divisionColor }}
          >
            {leagueConfig[myStats?.division ?? 'HUEVITO']?.label}
          </span>

          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              {/* Score */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Tu puntaje
                </p>
                <p className="font-black text-[40px] leading-none tracking-tight text-slate-800">
                  {formatScore(myStats?.score ?? 0)}
                </p>
              </div>

              {/* Career */}
              <div className="text-right min-w-0 max-w-[55%]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Carrera objetivo
                </p>
                <p className="font-black text-[14px] text-slate-800 leading-tight truncate">
                  {myStats?.career?.name ?? 'Sin carrera'}
                </p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                  Mín. histórico:{' '}
                  <span className="font-black text-slate-800">
                    {formatScore(myStats?.career?.minimumScore ?? 0)}
                  </span>
                </p>
              </div>
            </div>

            {/* Peak */}
            <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500">
              <Crown size={13} className="text-amber-500" fill="#f59e0b" />
              <span>Peak histórico: {formatScore(myStats?.highestScore ?? 0)}</span>
            </div>
          </div>
        </div>

        <RankingTabs active={activeTab} onChange={handleTabChange} />
        <RankingTableHeader />
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

      {/* User Preview Modal */}
      <UserPreviewModal
        userId={previewUserId}
        onClose={() => setPreviewUserId(null)}
      />
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Crown size={40} className="text-slate-300 mb-3" />
      <p className="text-slate-400 font-bold text-[14px]">
        Aún no hay datos para este ranking.
      </p>
    </div>
  );
}
