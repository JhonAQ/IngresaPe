'use client';

import React, { useMemo, useState } from 'react';
import { Trophy, TrendingUp, Clock } from 'lucide-react';
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

  const myCard = (
    <div className="bg-slate-900 text-white rounded-[1.2rem] p-3 shadow-2xl border-b-[4px] border-b-slate-950 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-[16px]">
        #{myStatus?.rank ?? '-'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-[14px] truncate">{profile?.name ?? 'Tú'}</p>
        <p className="text-[10px] font-bold text-white/60 truncate">
          Liga {leagueInfo.label} · Cierra en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-[16px]">{userPtje.toFixed(1)}</p>
        <p className="text-[9px] font-bold text-white/50 uppercase">Ptje</p>
      </div>
    </div>
  );

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50">
      {/* Compact hero */}
      <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-6 pb-6 rounded-b-[2rem] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                <Trophy size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-black text-white text-[20px] leading-tight">
                  ¡Hola, {userName}! 👋
                </h1>
                <p className="text-white/70 font-bold text-[11px]">
                  Ranking semanal
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-white text-[22px]">{userPtje.toFixed(1)}</p>
              <p className="text-white/60 font-bold text-[9px] uppercase">Tu Ptje</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[1.2rem] p-3 border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LeagueBadge league={userLeague} size="md" />
              <div>
                <p className="text-white/70 font-bold text-[10px] uppercase tracking-wider">
                  Liga
                </p>
                <p className="font-black text-white text-[15px] leading-tight">
                  {leagueInfo.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 font-bold text-[10px] uppercase tracking-wider">
                Puesto
              </p>
              <p className="font-black text-white text-[18px]">
                {myStatus?.rank ? `#${myStatus.rank}` : '—'}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-white/60 text-[10px] font-bold">
            <Clock size={12} />
            <span>La liga cierra en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}</span>
          </div>
        </div>
      </div>

      {/* League carousel */}
      <div className="px-5 mt-4">
        <LeagueCarousel currentLeague={userLeague} />
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4">
        <RankingTabs active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Filters */}
      <div className="px-5 mt-3">
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
      <div className="px-5 mt-3 pb-28">
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
                    zone="safe"
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky user position card */}
      <div className="sticky bottom-0 left-0 right-0 px-5 py-3 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-20 mt-auto">
        {myCard}
      </div>
    </main>
  );
}
