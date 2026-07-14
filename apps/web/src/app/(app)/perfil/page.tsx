'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { ProfileHeader } from '../../../components/perfil/ProfileHeader';
import { StatsRow } from '../../../components/perfil/StatsRow';
import { AcademicDNA } from '../../../components/perfil/AcademicDNA';
import { AcademicDnaOverlay } from '../../../components/perfil/AcademicDnaOverlay';
import { TrophyRoom } from '../../../components/perfil/TrophyRoom';
import { RatingGraph } from '../../../components/perfil/RatingGraph';
import { ActivityHeatmap } from '../../../components/perfil/ActivityHeatmap';
import { useProfileData } from '../../../hooks/useProfileData';
import { useAuth } from '../../../hooks/useAuth';
import { ChunkyButton } from '../../../components/ui/ChunkyButton';
import { ProgressBar } from '@ingresa-pe/ui';
import { InstallTag } from '../../../components/pwa/InstallTag';
import { ProfileSkeleton } from '../../../components/ui/skeleton';
import { trpc } from '../../../utils/trpc';
import { leagueConfig } from '@ingresa-pe/domain';

export default function PerfilPage() {
  const { logout } = useAuth();
  const { user, rank, level, xpProgress, isLoading, score, division, highestScore, gems } =
    useProfileData();

  const { data: stats } = trpc.profile.getStats.useQuery(undefined, { retry: false });
  const { data: heatmap } = trpc.profile.getActivityHeatmap.useQuery({}, { retry: false });
  const { data: graph } = trpc.profile.getRatingGraph.useQuery({}, { retry: false });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const divisionCfg = leagueConfig[(division as keyof typeof leagueConfig) ?? 'HUEVITO'];

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50">
      <ProfileHeader
        name={user?.name ?? null}
        image={user?.image}
        career={user?.career ?? null}
        isPremium={user?.isPremium}
      />

      <StatsRow
        streak={user?.streak ?? 0}
        totalXp={user?.totalXp ?? 0}
        coins={user?.coins ?? 0}
      />

      <div className="px-5 mt-5">
        <div
          className="rounded-2xl border-2 border-b-[4px] p-4"
          style={{
            borderColor: divisionCfg.hex + '40',
            borderBottomColor: divisionCfg.hex,
            backgroundColor: divisionCfg.hex + '08',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[16px]"
                style={{ backgroundColor: divisionCfg.hex }}
              >
                {divisionCfg.emoji}
              </div>
              <div>
                <p className="font-black text-[16px] text-slate-800 leading-tight">
                  {divisionCfg.label}
                </p>
                <p className="text-[12px] font-bold text-slate-400">
                  Score {score.toFixed(1)} / 100
                </p>
              </div>
            </div>
            <span className="text-[12px] font-black text-slate-600 bg-white px-2.5 py-1 rounded-lg">
              Peak {highestScore.toFixed(1)}
            </span>
          </div>
          <ProgressBar progress={score} size="md" indicatorColor="primary" />
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-duo-gold/20 flex items-center justify-center text-duo-gold">
                <span className="font-black text-[16px]">{level}</span>
              </div>
              <div>
                <p className="font-black text-[16px] text-slate-800 leading-tight">
                  Nivel {level}
                </p>
                <p className="text-[12px] font-bold text-slate-400">
                  {xpProgress.current} / {xpProgress.next} XP
                </p>
              </div>
            </div>
            <span className="text-[12px] font-black text-success-600 bg-success-50 px-2.5 py-1 rounded-lg">
              {xpProgress.percent}%
            </span>
          </div>
          <ProgressBar progress={xpProgress.percent} size="md" indicatorColor="success" />
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 p-4">
          <p className="font-black text-[14px] text-slate-700 mb-3">HISTORIAL DE RATING</p>
          <RatingGraph data={graph ?? []} />
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 p-4">
          <p className="font-black text-[14px] text-slate-700 mb-3">ACTIVIDAD</p>
          <ActivityHeatmap data={heatmap ?? []} />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Preguntas</p>
              <p className="font-black text-[18px] text-slate-700">{stats?.totalQuestionsAnswered ?? 0}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Simulacros</p>
              <p className="font-black text-[18px] text-slate-700">{stats?.totalSimulacrosCompleted ?? 0}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Gemas</p>
              <p className="font-black text-[18px] text-slate-700">{gems}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Nodos</p>
              <p className="font-black text-[18px] text-slate-700">{stats?.totalNodesCompleted ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <AcademicDNA />
      </div>

      <div className="px-5 mt-6">
        <TrophyRoom streak={user?.streak ?? 0} rank={rank} />
      </div>

      <AcademicDnaOverlay />

      <InstallTag />

      <div className="px-5 py-8">
        <ChunkyButton
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={logout}
          icon={LogOut}
        >
          CERRAR SESIÓN
        </ChunkyButton>
      </div>
    </main>
  );
}
