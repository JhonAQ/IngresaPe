'use client';

import React, { useMemo, useState } from 'react';
import { Trophy, TrendingUp, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { trpc } from '../../../utils/trpc';
import {
  RankingTabs,
  LeagueBadge,
  LeagueCarousel,
  PodiumCard,
  RankRow,
  AreaFilter,
  CareerFilter,
} from '../../../components/ranking';
import { type Area, type League, leagueConfig } from '@ingresa-pe/domain';

type Tab = 'weekly' | 'area' | 'career';

type Zone = 'promotion' | 'relegation' | 'safe';

function getZone(rank: number, total: number): Zone {
  if (rank <= 3) return 'promotion';
  if (rank > total - 5) return 'relegation';
  return 'safe';
}

function getDaysUntilSunday(): number {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 0 : 7 - day;
}

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('weekly');
  const [selectedArea, setSelectedArea] = useState<Area>('INGENIERIAS');
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);

  const { data: profile } = trpc.profile.getMe.useQuery();
  const { data: myStatus } = trpc.ranking.getMyLeagueStatus.useQuery(undefined, {
    retry: false,
  });
  const { data: weeklyLeague, isLoading: isWeeklyLoading } =
    trpc.ranking.getWeeklyLeague.useQuery(undefined, {
      enabled: activeTab === 'weekly',
    });
  const { data: areaTop, isLoading: isAreaLoading } =
    trpc.ranking.getAreaLeaderboard.useQuery(
      { area: selectedArea },
      { enabled: activeTab === 'area' }
    );
  const { data: careerTop, isLoading: isCareerLoading } =
    trpc.ranking.getCareerLeaderboard.useQuery(
      { careerId: selectedCareerId ?? '' },
      { enabled: activeTab === 'career' && !!selectedCareerId }
    );
  const { data: careerOptions } = trpc.ranking.getCareerOptions.useQuery();

  const userName = profile?.name?.split(' ')[0] ?? 'Guerrero';
  const userLeague: League = myStatus?.league ?? 'HUEVITO';
  const leagueInfo = leagueConfig[userLeague];
  const userPtje = myStatus?.weeklyPtje ?? 0;
  const daysLeft = getDaysUntilSunday();

  React.useEffect(() => {
    if (profile?.career?.area) {
      setSelectedArea(profile.career.area);
    }
    if (profile?.careerId) {
      setSelectedCareerId(profile.careerId);
    }
  }, [profile?.career?.area, profile?.careerId]);

  React.useEffect(() => {
    if (careerOptions && careerOptions.length > 0 && !selectedCareerId) {
      setSelectedCareerId(careerOptions[0].id);
    }
  }, [careerOptions, selectedCareerId]);

  const leaderboard = useMemo(() => {
    if (activeTab === 'weekly') return weeklyLeague;
    if (activeTab === 'area') return areaTop;
    return careerTop;
  }, [activeTab, weeklyLeague, areaTop, careerTop]);

  const isLoading =
    (activeTab === 'weekly' && isWeeklyLoading) ||
    (activeTab === 'area' && isAreaLoading) ||
    (activeTab === 'career' && isCareerLoading);

  const topPlayers = leaderboard?.top ?? [];
  const me = leaderboard?.me ?? null;
  const totalInLeague = leaderboard?.totalInLeague ?? topPlayers.length;
  const showMeOutside = me !== null && !topPlayers.some((p) => p.isMe);

  const podium = topPlayers.slice(0, 3);
  const orderedPodium =
    podium.length >= 3 ? [podium[1], podium[0], podium[2]] : podium;
  const rest = topPlayers.slice(3);

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50 pb-24">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-8 pb-8 rounded-b-[2.5rem] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                <Trophy size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-black text-white text-[22px] leading-tight">
                  ¡Hola, {userName}! 👋
                </h1>
                <p className="text-white/70 font-bold text-[12px]">
                  Tu liga semanal
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[1.5rem] p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LeagueBadge league={userLeague} size="lg" />
                <div>
                  <p className="text-white/70 font-bold text-[11px] uppercase tracking-wider">
                    Liga {leagueInfo.label}
                  </p>
                  <p className="font-black text-white text-[18px] leading-tight">
                    {myStatus?.rank ? `Puesto #${myStatus.rank}` : 'Sin posición'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 font-bold text-[11px] uppercase tracking-wider">
                  Tu Ptje
                </p>
                <p className="font-black text-white text-[22px]">
                  {userPtje.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Zone legend */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-success-500/20 border border-success-500/30 flex items-center justify-center">
                  <ChevronUp size={14} className="text-success-300" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/90 uppercase">Ascenso</p>
                  <p className="text-[10px] font-bold text-white/60">Top 3</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-error-500/20 border border-error-500/30 flex items-center justify-center">
                  <ChevronDown size={14} className="text-error-300" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/90 uppercase">Descenso</p>
                  <p className="text-[10px] font-bold text-white/60">Últimos 5</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-white/60 text-[10px] font-bold">
              <Clock size={12} />
              <span>Cierra en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* League carousel */}
      <div className="mt-5">
        <LeagueCarousel currentLeague={userLeague} />
      </div>

      {/* Tabs */}
      <div className="px-5 mt-5">
        <RankingTabs active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Filters */}
      <div className="px-5 mt-4">
        {activeTab === 'area' && (
          <AreaFilter active={selectedArea} onChange={setSelectedArea} />
        )}
        {activeTab === 'career' && careerOptions && (
          <CareerFilter
            careers={careerOptions}
            activeId={selectedCareerId ?? ''}
            onChange={setSelectedCareerId}
          />
        )}
      </div>

      {/* Content */}
      <div className="px-5 mt-4 pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 rounded-[1.2rem] animate-pulse"
              />
            ))}
          </div>
        ) : topPlayers.length === 0 ? (
          <div className="text-center py-12 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white">
            <TrendingUp size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold text-[14px]">
              Aún no hay datos para este ranking.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Podium */}
            {orderedPodium.length > 0 && (
              <div className="flex items-end justify-center gap-3 pt-2">
                {orderedPodium.map((user, index) =>
                  user ? (
                    <PodiumCard
                      key={user.id}
                      user={user}
                      position={
                        (orderedPodium.length === 3
                          ? [2, 1, 3]
                          : [1, 2, 3])[index] as 1 | 2 | 3
                      }
                      delay={index * 0.1}
                    />
                  ) : null
                )}
              </div>
            )}

            {/* List */}
            <div className="space-y-2.5">
              {rest.map((user, index) => (
                <RankRow
                  key={user.id}
                  user={user}
                  index={index}
                  zone={
                    activeTab === 'weekly'
                      ? getZone(user.rank, totalInLeague)
                      : 'safe'
                  }
                />
              ))}

              {showMeOutside && me && (
                <>
                  <div className="flex items-center justify-center py-1">
                    <span className="text-slate-300 font-black text-[14px]">•••</span>
                  </div>
                  <RankRow
                    user={me}
                    index={rest.length}
                    zone={
                      activeTab === 'weekly'
                        ? getZone(me.rank, totalInLeague)
                        : 'safe'
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
