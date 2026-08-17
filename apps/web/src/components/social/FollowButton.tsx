'use client';

import React, { useState } from 'react';
import { UserPlus, UserCheck, UserMinus } from 'lucide-react';
import { trpc } from '../../utils/trpc';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  onToggle?: (newState: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing: initialIsFollowing,
  size = 'sm',
  fullWidth = false,
  onToggle,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovering, setIsHovering] = useState(false);
  const utils = trpc.useUtils();

  const followMutation = trpc.social.follow.useMutation({
    onMutate: () => {
      setIsFollowing(true);
      onToggle?.(true);
    },
    onError: () => {
      setIsFollowing(false);
      onToggle?.(false);
    },
    onSettled: () => {
      utils.social.invalidate();
    },
  });

  const unfollowMutation = trpc.social.unfollow.useMutation({
    onMutate: () => {
      setIsFollowing(false);
      onToggle?.(false);
    },
    onError: () => {
      setIsFollowing(true);
      onToggle?.(true);
    },
    onSettled: () => {
      utils.social.invalidate();
    },
  });

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    if (isFollowing) {
      unfollowMutation.mutate({ userId });
    } else {
      followMutation.mutate({ userId });
    }
  };

  // Sync with prop changes
  React.useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const isSm = size === 'sm';

  if (isFollowing) {
    const showUnfollow = isHovering;
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        disabled={isLoading}
        className={`
          inline-flex items-center justify-center gap-1.5 font-black uppercase tracking-wider
          rounded-xl border-2 transition-all duration-200
          ${isSm ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-[11px]'}
          ${fullWidth ? 'flex-1' : 'shrink-0'}
          ${
            showUnfollow
              ? 'bg-rose-50 border-rose-300 text-rose-600 border-b-rose-400'
              : 'bg-white border-slate-200 text-slate-500 border-b-slate-300'
          }
          disabled:opacity-50
        `}
      >
        {showUnfollow ? (
          <>
            <UserMinus size={isSm ? 12 : 14} />
            Dejar
          </>
        ) : (
          <>
            <UserCheck size={isSm ? 12 : 14} />
            Siguiendo
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center gap-1.5 font-black uppercase tracking-wider
        rounded-xl border-2 transition-all duration-200
        bg-emerald-500 border-emerald-600 border-b-[3px] border-b-emerald-700 text-white
        active:translate-y-[1px] active:border-b-[2px]
        hover:bg-emerald-600
        disabled:opacity-50
        ${isSm ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-[11px]'}
        ${fullWidth ? 'flex-1' : 'shrink-0'}
      `}
    >
      <UserPlus size={isSm ? 12 : 14} />
      Seguir
    </button>
  );
};
