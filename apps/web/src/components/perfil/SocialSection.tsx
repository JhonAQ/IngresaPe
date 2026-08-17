'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { leagueConfig } from '@ingresa-pe/domain';
import { trpc } from '../../utils/trpc';
import { useImmersiveOverlay } from '../dashboard/ImmersiveOverlayContext';

interface SocialSectionProps {
  userId: string;
}

export const SocialSection: React.FC<SocialSectionProps> = ({ userId }) => {
  const { open } = useImmersiveOverlay();
  const { data: counts } = trpc.social.getFollowCounts.useQuery({ userId });
  const { data: followingData } = trpc.social.getFollowing.useQuery(
    { userId, page: 1, pageSize: 4 },
    { enabled: !!userId }
  );

  const followingCount = counts?.followingCount ?? 0;
  const followersCount = counts?.followersCount ?? 0;
  const recentFollowing = followingData?.users ?? [];

  return (
    <section className="px-5 mb-5 animate-cascade-2">
      <button
        onClick={() => open('friendsList', { userId })}
        className="w-full flex items-center gap-3 p-3 rounded-[1.25rem] border-2 border-slate-200 border-b-[3px] bg-white active:translate-y-[1px] active:border-b-[2px] transition-all"
      >
        {/* Avatares */}
        <div className="flex -space-x-2 shrink-0">
          {recentFollowing.length > 0 ? (
            <>
              {recentFollowing.slice(0, 3).map((user, idx) => {
                const divCfg =
                  leagueConfig[user.division as keyof typeof leagueConfig];
                return (
                  <div
                    key={user.id}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-[11px] text-white"
                    style={{
                      backgroundColor: divCfg?.hex ?? '#9CA3AF',
                      zIndex: 3 - idx,
                    }}
                  >
                    {(user.name ?? 'U').charAt(0).toUpperCase()}
                  </div>
                );
              })}
              {followingCount > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-black text-[9px] text-slate-500 z-0">
                  +{followingCount - 3}
                </div>
              )}
            </>
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
              <span className="text-[11px] font-black text-slate-400">+</span>
            </div>
          )}
        </div>

        {/* Texto */}
        <div className="flex-1 text-left min-w-0">
          <p className="font-black text-slate-800 text-[14px] leading-tight">
            Comunidad
          </p>
          <p className="text-[11px] font-bold text-slate-400 leading-tight">
            Siguiendo a {followingCount} · {followersCount} seguidores
          </p>
        </div>

        {/* Flecha */}
        <ChevronRight size={18} className="text-slate-300 shrink-0" strokeWidth={2.5} />
      </button>
    </section>
  );
};
