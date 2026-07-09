'use client';

import React, { useState, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import { trpc } from '../../../utils/trpc';
import {
  RankingTabs,
  DocumentRankingHeader,
  RankingAccordion,
  RankingTableHeader,
  RankingTableRow,
  RankingZoneHeader,
  ScrollToTopFab,
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

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('career');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderStudents = (students: RankingUserDto[]) => {
    if (students.length === 0) {
      return (
        <div className="py-4 text-center text-slate-400 font-bold text-[12px]">
          Sin datos para esta zona.
        </div>
      );
    }
    return students.map((student, idx) => (
      <RankingTableRow key={student.id} user={student} index={idx} />
    ));
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
      {/* Cabecera fija */}
      <DocumentRankingHeader />

      {/* Tabs + cabecera de columnas fija */}
      <div className="shrink-0 px-3 sm:px-4 bg-white z-20">
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
              <div
                key={i}
                className="h-10 bg-slate-100 rounded animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === 'career' ? (
          careersData?.groups.length ? (
            careersData.groups.map((group) => (
              <RankingAccordion
                key={group.careerId}
                title={`CARRERA >> ${group.careerName}`}
                isOpen={expandedSections[group.careerName] ?? true}
                onToggle={() => toggleSection(group.careerName)}
              >
                {renderStudents(group.top)}
                {group.me && !group.top.some((s) => s.isMe) && (
                  <RankingTableRow user={group.me} index={group.top.length} />
                )}
              </RankingAccordion>
            ))
          ) : (
            renderEmpty()
          )
        ) : activeTab === 'area' ? (
          areasData?.groups.length ? (
            areasData.groups.map((group) => {
              const title = areaLabels[group.area];
              return (
                <RankingAccordion
                  key={group.area}
                  title={`ÁREA >> ${title.toUpperCase()}`}
                  isOpen={expandedSections[title] ?? true}
                  onToggle={() => toggleSection(title)}
                >
                  {renderStudents(group.top)}
                  {group.me && !group.top.some((s) => s.isMe) && (
                    <RankingTableRow user={group.me} index={group.top.length} />
                  )}
                </RankingAccordion>
              );
            })
          ) : (
            renderEmpty()
          )
        ) : activeTab === 'league' ? (
          leagueData?.top.length ? (
            <RankingAccordion
              title="LIGA SEMANAL"
              isOpen={expandedSections['Liga semanal'] ?? true}
              onToggle={() => toggleSection('Liga semanal')}
            >
              {groupByZone(leagueData.top, leagueData.totalInLeague).map(
                ({ zone, students }) => (
                  <div key={zone} className="mb-3">
                    <RankingZoneHeader zone={zone} />
                    {renderStudents(students)}
                  </div>
                )
              )}
              {leagueData.me && !leagueData.top.some((s) => s.isMe) && (
                <RankingTableRow user={leagueData.me} index={leagueData.top.length} />
              )}
            </RankingAccordion>
          ) : (
            renderEmpty()
          )
        ) : null}
      </div>

      <ScrollToTopFab scrollContainerRef={scrollRef} />
    </main>
  );
}
