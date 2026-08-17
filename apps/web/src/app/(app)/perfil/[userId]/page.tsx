'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '../../../../utils/trpc';
import { useAuth } from '../../../../hooks/useAuth';
import { PublicProfileContent } from '../../../../components/social/PublicProfileContent';
import { ProfileSkeleton } from '../../../../components/ui/skeleton';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.userId as string;

  React.useEffect(() => {
    if (currentUser?.id && userId === currentUser.id) {
      router.replace('/perfil');
    }
  }, [currentUser?.id, userId, router]);

  const { data: profile, isLoading } = trpc.social.getPublicProfile.useQuery(
    { userId },
    { enabled: !!userId && userId !== currentUser?.id }
  );

  if (isLoading || !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar pb-32 bg-premium-pattern">
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl border border-slate-200 border-b-[3px] bg-gradient-to-b from-white to-slate-50 flex items-center justify-center text-slate-500 active:translate-y-[2px] active:border-b transition-all"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="font-black text-slate-800 text-[18px] tracking-tight truncate max-w-[180px]">
            {profile.name ?? 'Anónimo'}
          </span>
        </div>
      </header>

      <PublicProfileContent profile={profile} currentUserId={currentUser?.id} />
    </main>
  );
}
