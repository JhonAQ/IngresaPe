'use client';

import React, { useState, useMemo } from 'react';
import { X, Users, UserPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { trpc } from '../../utils/trpc';
import { useImmersiveOverlay } from '../dashboard/ImmersiveOverlayContext';
import { UserSearchBar } from './UserSearchBar';
import { FollowUserCard } from './FollowUserCard';
import { UserPreviewModal } from './UserPreviewModal';

type SocialTab = 'following' | 'followers';

export function FriendsOverlay() {
  const { mode, payload, close } = useImmersiveOverlay();
  const [activeTab, setActiveTab] = useState<SocialTab>('following');
  const [followingPage, setFollowingPage] = useState(1);
  const [followersPage, setFollowersPage] = useState(1);
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);

  const userId = useMemo(() => {
    if (!payload || typeof payload !== 'object') return null;
    return (payload as { userId?: string }).userId ?? null;
  }, [payload]);

  const isOpen = mode === 'friendsList' && !!userId;

  const { data: counts } = trpc.social.getFollowCounts.useQuery(
    { userId: userId! },
    { enabled: !!userId }
  );

  const { data: followingData, isLoading: isFollowingLoading } =
    trpc.social.getFollowing.useQuery(
      { userId: userId!, page: 1, pageSize: followingPage * 15 },
      { enabled: isOpen && activeTab === 'following' }
    );

  const { data: followersData, isLoading: isFollowersLoading } =
    trpc.social.getFollowers.useQuery(
      { userId: userId!, page: 1, pageSize: followersPage * 15 },
      { enabled: isOpen && activeTab === 'followers' }
    );

  const currentData =
    activeTab === 'following' ? followingData : followersData;
  const currentLoading =
    activeTab === 'following' ? isFollowingLoading : isFollowersLoading;
  const currentTotal = currentData?.total ?? 0;
  const currentUsers = currentData?.users ?? [];
  const hasMore = currentUsers.length < currentTotal;

  const handleLoadMore = () => {
    if (activeTab === 'following') {
      setFollowingPage((p) => p + 1);
    } else {
      setFollowersPage((p) => p + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white px-4 pt-4 pb-3 border-b-2 border-slate-200 flex items-center gap-4">
        <button
          onClick={() => close()}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Cerrar"
        >
          <X size={24} strokeWidth={3} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Users size={22} className="text-indigo-500" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-[22px] leading-tight tracking-tight text-slate-800 truncate">
              Comunidad
            </h2>
            <p className="text-[12px] font-bold text-slate-400 truncate">
              {counts?.followingCount ?? 0} siguiendo ·{' '}
              {counts?.followersCount ?? 0} seguidores
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar p-4 pb-8">
        {/* Search */}
        <div className="mb-4">
          <UserSearchBar currentUserId={userId} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border-2 ${
              activeTab === 'following'
                ? 'bg-slate-800 border-slate-900 border-b-[3px] text-white'
                : 'bg-white border-slate-200 border-b-[3px] border-b-slate-300 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Siguiendo a {counts?.followingCount ?? 0}
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border-2 ${
              activeTab === 'followers'
                ? 'bg-slate-800 border-slate-900 border-b-[3px] text-white'
                : 'bg-white border-slate-200 border-b-[3px] border-b-slate-300 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Seguidores ({counts?.followersCount ?? 0})
          </button>
        </div>

        {/* List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {currentLoading && currentUsers.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-200 bg-white"
                >
                  <div className="w-11 h-11 rounded-full bg-slate-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : currentUsers.length > 0 ? (
              currentUsers.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                >
                  <FollowUserCard
                    user={user}
                    currentUserId={userId}
                    onClick={() => setPreviewUserId(user.id)}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <UserPlus size={28} className="text-slate-400" />
                </div>
                <p className="font-black text-slate-500 text-[14px] mb-1">
                  {activeTab === 'following'
                    ? 'Aún no sigues a nadie'
                    : 'Aún no tienes seguidores'}
                </p>
                <p className="text-[12px] text-slate-400 px-8">
                  {activeTab === 'following'
                    ? 'Busca compañeros de estudio arriba y empieza a seguirlos'
                    : 'Comparte tu perfil para que otros te encuentren'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="w-full py-2.5 rounded-xl border-2 border-slate-200 border-b-[3px] bg-white text-[12px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 active:translate-y-[1px] active:border-b-[2px] transition-all"
            >
              Cargar más
            </button>
          )}
        </div>
      </main>

      <UserPreviewModal
        userId={previewUserId}
        onClose={() => setPreviewUserId(null)}
      />
    </div>
  );
}
