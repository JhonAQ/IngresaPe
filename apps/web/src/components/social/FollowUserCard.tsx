'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { leagueConfig } from '@ingresa-pe/domain';
import { Target } from 'lucide-react';
import { FollowButton } from './FollowButton';

interface FollowUserCardProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    division: string;
    score: number;
    career: { id: string; name: string; area: string } | null;
    isFollowing: boolean;
  };
  showFollowButton?: boolean;
  currentUserId?: string;
  onClick?: () => void;
}

export const FollowUserCard: React.FC<FollowUserCardProps> = ({
  user,
  showFollowButton = true,
  currentUserId,
  onClick,
}) => {
  const router = useRouter();
  const divCfg = leagueConfig[user.division as keyof typeof leagueConfig];
  const initial = (user.name ?? 'U').charAt(0).toUpperCase();
  const isMe = currentUserId === user.id;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/perfil/${user.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-200 border-b-[3px] bg-white hover:bg-slate-50 transition-all cursor-pointer active:translate-y-[1px] active:border-b-[2px]"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-black text-[18px] text-white shadow-[inset_0_-3px_6px_rgba(0,0,0,0.15)]"
          style={{ backgroundColor: divCfg?.hex ?? '#9CA3AF' }}
        >
          {initial}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-slate-800 text-[13px] truncate">
            {user.name ?? 'Anónimo'}
          </span>
          {isMe && (
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 shrink-0">
              Tú
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase tracking-wider"
            style={{ color: divCfg?.hex ?? '#9CA3AF' }}
          >
            {divCfg?.emoji} {divCfg?.label}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {user.score.toFixed(1)} pts
          </span>
        </div>
        {user.career && (
          <div className="flex items-center gap-1 mt-0.5">
            <Target size={10} className="text-slate-400" strokeWidth={3} />
            <span className="text-[10px] font-bold text-slate-400 truncate">
              {user.career.name}
            </span>
          </div>
        )}
      </div>

      {/* Follow button */}
      {showFollowButton && !isMe && (
        <FollowButton
          userId={user.id}
          isFollowing={user.isFollowing}
          size="sm"
        />
      )}
    </div>
  );
};
