'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { ProfileHeader } from '../../../components/perfil/ProfileHeader';
import { StatsRow } from '../../../components/perfil/StatsRow';
import { AcademicDNA } from '../../../components/perfil/AcademicDNA';
import { AcademicDnaOverlay } from '../../../components/perfil/AcademicDnaOverlay';
import { TrophyRoom } from '../../../components/perfil/TrophyRoom';
import { useProfileData } from '../../../hooks/useProfileData';
import { useAuth } from '../../../hooks/useAuth';
import { ChunkyButton } from '../../../components/ui/ChunkyButton';
import { ProgressBar } from '@ingresa-pe/ui';
import { InstallTag } from '../../../components/pwa/InstallTag';

export default function PerfilPage() {
  const { logout } = useAuth();
  const { user, rank, level, xpProgress, isLoading } = useProfileData();

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-duo-blue/20 border-t-duo-blue" />
          <span className="text-sm font-bold text-slate-400">Cargando perfil...</span>
        </div>
      </main>
    );
  }

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
        {/* Level card */}
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
