'use client';

import React from 'react';
import { Target, Crown, Shield, Award } from 'lucide-react';
import { FlameIcon } from '@ingresa-pe/ui';
import type { PublicProfileDto } from '@ingresa-pe/domain';
import { getRankInfo, getRankInfoByDivision } from '../../lib/rankMeta';
import { RatingChart } from '../perfil/RatingChart';
import { ContributionGraph } from '../perfil/ContributionGraph';
import { FollowButton } from './FollowButton';

interface PublicProfileContentProps {
  profile: PublicProfileDto;
  currentUserId?: string;
  showFollowButton?: boolean;
}

export const PublicProfileContent: React.FC<PublicProfileContentProps> = ({
  profile,
  currentUserId,
  showFollowButton = true,
}) => {
  const displayName = profile.name ?? 'Anónimo';
  const career = profile.career?.name ?? 'Sin carrera';
  const currentRank = getRankInfoByDivision(profile.division);
  const maxRank = getRankInfo(profile.highestScore);
  const isMe = currentUserId === profile.id;

  const simHistory = profile.ratingGraph?.map((g: any) => g.score) ?? [];
  const simDates =
    profile.ratingGraph?.map((g: any) => {
      if (!g.appliedAt) return `S${g.weekIndex}`;
      const d = new Date(g.appliedAt);
      return `${String(d.getDate()).padStart(2, '0')}/${String(
        d.getMonth() + 1
      ).padStart(2, '0')}`;
    }) ?? [];

  const hasDnaData =
    profile.academicDna &&
    Array.isArray(profile.academicDna.axes) &&
    profile.academicDna.axes.some((a: any) => a.hasData);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="px-5 pt-6 pb-6 flex items-center gap-5">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
            style={{ backgroundColor: currentRank.color }}
          />
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center font-black text-[32px] text-white shadow-[inset_0_-4px_8px_rgba(0,0,0,0.15)] shrink-0 border-4 z-10"
            style={{
              backgroundColor: currentRank.color,
              borderColor: currentRank.bg,
            }}
          >
            {displayName.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-1 bg-white p-1 rounded-full border-2 border-slate-100 shadow-sm z-20">
            <Award
              size={16}
              color={currentRank.color}
              fill={currentRank.color}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h2 className="font-black text-[22px] text-slate-800 leading-tight truncate mb-0.5">
            {displayName}
          </h2>
          <p className="text-[12px] font-bold text-slate-400 mb-1">
            Siguiendo a {profile.followingCount} · {profile.followersCount}{' '}
            seguidores
          </p>
          <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 border-b-2 px-3 py-1.5 rounded-xl w-max shadow-sm">
            <Target size={14} className="text-slate-400" strokeWidth={3} />
            <span className="font-black text-slate-600 text-[11px] uppercase tracking-widest">
              {career}
            </span>
          </div>
        </div>
      </div>

      {/* Follow button */}
      {showFollowButton && !isMe && (
        <div className="px-5 mb-6">
          <FollowButton
            userId={profile.id}
            isFollowing={profile.isFollowing}
            size="md"
            fullWidth
          />
        </div>
      )}

      {/* Liga cards */}
      <div className="px-5 mb-6">
        <div className="flex gap-3">
          <div
            className={`flex-1 border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-4 flex flex-col relative overflow-hidden shadow-sm bg-gradient-to-br ${currentRank.gradient}`}
          >
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="font-black text-slate-500/80 text-[10px] uppercase tracking-widest">
                Liga Actual
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 backdrop-blur-sm shadow-sm border border-white/50">
                <Shield
                  size={16}
                  color={currentRank.color}
                  fill={currentRank.color}
                />
              </div>
            </div>
            <div className="font-black text-[34px] leading-none mb-1 text-slate-800 relative z-10 tracking-tight">
              {profile.score.toFixed(1)}
            </div>
            <div
              className="font-black text-[12px] uppercase tracking-widest relative z-10 opacity-90"
              style={{ color: currentRank.color }}
            >
              {currentRank.name}
            </div>
          </div>

          <div
            className={`flex-1 border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-4 flex flex-col relative overflow-hidden shadow-sm bg-gradient-to-br ${maxRank.gradient}`}
          >
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="font-black text-slate-500/80 text-[10px] uppercase tracking-widest">
                Pico Histórico
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 backdrop-blur-sm shadow-sm border border-white/50">
                <Crown size={16} color={maxRank.color} fill={maxRank.color} />
              </div>
            </div>
            <div className="font-black text-[34px] leading-none mb-1 text-slate-800 relative z-10 tracking-tight">
              {profile.highestScore.toFixed(1)}
            </div>
            <div
              className="font-black text-[12px] uppercase tracking-widest relative z-10 opacity-90"
              style={{ color: maxRank.color }}
            >
              {maxRank.name}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 bg-white border-2 border-slate-200 border-b-[3px] rounded-2xl p-3 text-center">
            <div className="font-black text-[22px] text-slate-800">
              {profile.stats.totalQuestionsAnswered}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Preguntas
            </div>
          </div>
          <div className="flex-1 bg-white border-2 border-slate-200 border-b-[3px] rounded-2xl p-3 text-center">
            <div className="font-black text-[22px] text-slate-800 flex items-center justify-center gap-1">
              <FlameIcon className="w-5 h-5" />
              {profile.streak}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Racha
            </div>
          </div>
          <div className="flex-1 bg-white border-2 border-slate-200 border-b-[3px] rounded-2xl p-3 text-center">
            <div className="font-black text-[22px] text-slate-800">
              {profile.stats.totalSimulacrosCompleted}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Simulacros
            </div>
          </div>
        </div>
      </div>

      {/* ADN Académico */}
      {hasDnaData && (
        <div className="px-5 mb-6">
          <div className="bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-5">
            <h3 className="font-black text-slate-800 text-[14px] uppercase tracking-widest mb-4">
              ADN Académico
            </h3>
            <div className="space-y-3">
              {profile.academicDna.axes.map((axis: any) => (
                <div key={axis.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-bold text-slate-700">
                      {axis.label}
                    </span>
                    <span className="text-[12px] font-black text-slate-500">
                      {axis.accuracy}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${axis.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rating chart */}
      {simHistory.length > 0 && (
        <div className="px-5 mb-6">
          <RatingChart
            history={simHistory}
            dates={simDates}
            currentMax={profile.highestScore}
          />
        </div>
      )}

      {/* Activity heatmap */}
      {profile.heatmap && (
        <div className="px-5 mb-8">
          <ContributionGraph data={profile.heatmap} />
        </div>
      )}
    </div>
  );
};
