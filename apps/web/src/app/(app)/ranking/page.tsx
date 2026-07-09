'use client';

import React, { useMemo, useState } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { trpc } from '../../../utils/trpc';
import {
  RankingTabs,
  LeagueBadge,
  PodiumCard,
  RankRow,
  AreaFilter,
  CareerFilter,
  LeagueLadder,
} from '../../../components/ranking';
import {
  type Area,
  type League,
  leagueOrder,
  leagueConfig,
} from '@ingresa-pe/domain';

type Tab = 'weekly' | 'area' | 'career';

function getLeagueByXp(xp: number): League {
  if (xp < 500) return 'HUEVITO';
  if (xp < 1500) return 'POLLITO';
  if (xp < 3000) return 'DINOSAURIO';
  if (xp < 5000) return 'FOSIL';
  return 'CACHIMBO';
}

export default function RankingPage() {
  const { data: profile } = trpc.profile.getMe.useQuery();

  const [activeTab, setActiveTab] = useState<Tab>('weekly');
  const [selectedArea, setSelectedArea] = useState<Area>(
    profile?.career?.area ?? 'INGENIERIAS'
  );
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(
    profile?.careerId ?? null
  );

  const { data: globalTop, isLoading: isGlobalLoading } =
    trpc.ranking.getTopStudents.useQuery();
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

  const userXp = profile?.totalXp ?? 0;
  const userLeague = getLeagueByXp(userXp);
  const leagueInfo = leagueConfig[userLeague];
  const leagueIndex = leagueOrder.indexOf(userLeague);
  const nextLeague = leagueOrder[leagueIndex + 1];

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

  const currentList = useMemo(() => {
    if (activeTab === 'weekly') return globalTop ?? [];
    if (activeTab === 'area') return areaTop ?? [];
    return careerTop ?? [];
  }, [activeTab, globalTop, areaTop, careerTop]);

  const isLoading =
    (activeTab === 'weekly' && isGlobalLoading) ||
    (activeTab === 'area' && isAreaLoading) ||
    (activeTab === 'career' && isCareerLoading);

  const podium = currentList.slice(0, 3);
  // Reorder podium to show 2nd, 1st, 3rd
  const orderedPodium =
    podium.length >= 3 ? [podium[1], podium[0], podium[2]] : podium;
  const rest = currentList.slice(3);

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50 pb-24">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-8 pb-10 rounded-b-[2.5rem] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                <Trophy size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-black text-white text-[26px] leading-tight">
                  Ranking
                </h1>
                <p className="text-white/70 font-bold text-[12px]">
                  Compite y sube de liga
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
                    Tu liga actual
                  </p>
                  <p className="font-black text-white text-[18px] leading-tight">
                    {leagueInfo.label}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 font-bold text-[11px] uppercase tracking-wider">
                  Tu XP
                </p>
                <p className="font-black text-white text-[20px]">
                  {userXp.toLocaleString()}
                </p>
              </div>
            </div>

            {nextLeague && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/80 mb-1">
                  <span>Progreso hacia {leagueConfig[nextLeague].label}</span>
                  <span>{Math.min(100, Math.round((userXp / 5000) * 100))}%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((userXp / 5000) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 -mt-5 relative z-20">
        <RankingTabs active={activeTab} onChange={setActiveTab} />
      </div>

      {/* League ladder */}
      <div className="px-5 mt-5">
        <LeagueLadder currentLeague={userLeague} />
      </div>

      {/* Filters */}
      <div className="px-5 mt-5">
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
      <div className="px-5 mt-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 rounded-[1.2rem] animate-pulse"
              />
            ))}
          </div>
        ) : currentList.length === 0 ? (
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
                <RankRow key={user.id} user={user} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
