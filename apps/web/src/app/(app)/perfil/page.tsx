'use client';

import { Share2, Settings, Target, Crown, Shield, Zap, Flame, Award, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useProfileData } from '../../../hooks/useProfileData';
import { useCountUp } from '../../../hooks/useCountUp';
import { getRankInfo, getRankInfoByDivision } from '../../../lib/rankMeta';
import { RatingChart } from '../../../components/perfil/RatingChart';
import { ContributionGraph } from '../../../components/perfil/ContributionGraph';
import { ProfileSkeleton } from '../../../components/ui/skeleton';
import { InstallTag } from '../../../components/pwa/InstallTag';
import { ChunkyButton } from '../../../components/ui/ChunkyButton';
import { trpc } from '../../../utils/trpc';

const DEMO_HISTORY = [15, 25, 45, 60, 81.2, 70, 52.4];
const DEMO_DATES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Hoy'];

export default function PerfilPage() {
  const { logout } = useAuth();
  const { user, isLoading, score, highestScore, division } = useProfileData();

  const { data: stats } = trpc.profile.getStats.useQuery(undefined, {
    retry: false,
  });
  const { data: graph } = trpc.profile.getRatingGraph.useQuery({}, {
    retry: false,
  });

  // Valores reales con fallback a demo mientras carga.
  const displayName = user?.name ?? 'Jhonatan Arias';
  const username = user?.email?.split('@')[0] ?? 'jhonatan_x';
  const career = user?.career?.name ?? 'Medicina Humana';

  const currentScore = score ?? 52.4;
  const maxScore = highestScore ?? 81.2;
  const totalQuestions = stats?.totalQuestionsAnswered ?? 2150;
  const streak = user?.streak ?? 14;

  const animatedScore = useCountUp(currentScore, 1500, 1);
  const animatedMaxScore = useCountUp(maxScore, 1800, 1);
  const animatedQuestions = useCountUp(totalQuestions, 2000, 0);
  const animatedStreak = useCountUp(streak, 1200, 0);

  const simHistory =
    graph && graph.length > 0 ? graph.map((g) => g.score) : DEMO_HISTORY;
  const simDates =
    graph && graph.length > 0
      ? graph.map((g) => `S${g.weekIndex}`)
      : DEMO_DATES;

  const currentRank = division
    ? getRankInfoByDivision(division)
    : getRankInfo(currentScore);
  const maxRank = getRankInfo(maxScore);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar pb-32 bg-premium-pattern">
      {/* Header propio del perfil */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shrink-0">
        <div className="flex items-center gap-2 animate-cascade-1">
          <span className="font-black text-slate-800 text-[18px] tracking-tight ml-2">Perfil</span>
        </div>
        <div className="flex gap-2 animate-cascade-1">
          <button className="w-10 h-10 rounded-2xl border border-slate-200 border-b-[3px] bg-gradient-to-b from-white to-slate-50 flex items-center justify-center text-slate-400 active:text-slate-600 active:translate-y-[2px] active:border-b transition-all">
            <Share2 size={18} strokeWidth={2.5} />
          </button>
          <button className="w-10 h-10 rounded-2xl border border-slate-200 border-b-[3px] bg-gradient-to-b from-white to-slate-50 flex items-center justify-center text-slate-400 active:text-slate-600 active:translate-y-[2px] active:border-b transition-all">
            <Settings size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Perfil intro */}
      <div className="px-5 pt-8 pb-6 flex items-center gap-5 animate-cascade-1">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
            style={{ backgroundColor: currentRank.color }}
          />
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center font-black text-[32px] text-white shadow-[inset_0_-4px_8px_rgba(0,0,0,0.15)] shrink-0 border-4 z-10"
            style={{ backgroundColor: currentRank.color, borderColor: currentRank.bg }}
          >
            {displayName.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-1 bg-white p-1 rounded-full border-2 border-slate-100 shadow-sm z-20">
            <Award size={16} color={currentRank.color} fill={currentRank.color} />
          </div>
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <h2 className="font-black text-[22px] text-slate-800 leading-tight truncate mb-0.5">
            {displayName}
          </h2>
          <p className="font-bold text-slate-400 text-[13px] mb-2 truncate">@{username}</p>

          <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 border-b-2 px-3 py-1.5 rounded-xl w-max shadow-sm">
            <Target size={14} className="text-slate-400" strokeWidth={3} />
            <span className="font-black text-slate-600 text-[11px] uppercase tracking-widest">{career}</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de liga */}
      <div className="px-5 mb-6 animate-cascade-2">
        <div className="flex gap-3">
          {/* Liga actual */}
          <div
            className={`flex-1 border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-4 flex flex-col relative overflow-hidden shadow-sm bg-gradient-to-br ${currentRank.gradient}`}
          >
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="font-black text-slate-500/80 text-[10px] uppercase tracking-widest">Liga Actual</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 backdrop-blur-sm shadow-sm border border-white/50">
                <Shield size={16} color={currentRank.color} fill={currentRank.color} />
              </div>
            </div>
            <div className="font-black text-[34px] leading-none mb-1 text-slate-800 relative z-10 tracking-tight">
              {animatedScore.toFixed(1)}
            </div>
            <div
              className="font-black text-[12px] uppercase tracking-widest relative z-10 opacity-90"
              style={{ color: currentRank.color }}
            >
              {currentRank.name}
            </div>
          </div>

          {/* Pico histórico */}
          <div
            className={`flex-1 border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-4 flex flex-col relative overflow-hidden shadow-sm bg-gradient-to-br ${maxRank.gradient}`}
          >
            <Crown
              className="absolute -bottom-4 -right-2 w-24 h-24 opacity-15 rotate-[-15deg]"
              style={{ color: maxRank.color, fill: maxRank.color }}
            />

            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="font-black text-slate-500/80 text-[10px] uppercase tracking-widest">Pico Histórico</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/60 backdrop-blur-sm shadow-sm border border-white/50 animate-float">
                <Crown size={16} color={maxRank.color} fill={maxRank.color} />
              </div>
            </div>
            <div className="font-black text-[34px] leading-none mb-1 text-slate-800 relative z-10 tracking-tight">
              {animatedMaxScore.toFixed(1)}
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
      <div className="px-5 mb-8 animate-cascade-3">
        <div className="flex gap-3">
          <div className="flex-[1.2] bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.25rem] px-4 py-3.5 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
              <Zap size={22} className="text-blue-500 fill-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[20px] text-slate-800 leading-tight tracking-tight">{Math.floor(animatedQuestions)}</span>
              <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">Resueltas</span>
            </div>
          </div>

          <div className="flex-1 bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.25rem] px-4 py-3.5 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center border border-orange-200">
              <Flame size={22} className="text-orange-500 fill-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[20px] text-slate-800 leading-tight tracking-tight">
                {Math.floor(animatedStreak)} <span className="text-[14px] text-slate-500">d</span>
              </span>
              <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">Racha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart + Heatmap */}
      <div className="px-5 flex flex-col gap-6 animate-cascade-4">
        <RatingChart
          history={simHistory}
          dates={simDates}
          currentMax={maxScore}
        />
        <ContributionGraph />
      </div>

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
