'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Target, Crown, Shield, ChevronUp } from 'lucide-react';
import { FlameIcon } from '@ingresa-pe/ui';
import { leagueConfig } from '@ingresa-pe/domain';
import { trpc } from '../../utils/trpc';
import { FollowButton } from './FollowButton';
import { PublicProfileContent } from './PublicProfileContent';

interface UserPreviewModalProps {
  userId: string | null;
  onClose: () => void;
}

export const UserPreviewModal: React.FC<UserPreviewModalProps> = ({
  userId,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: preview, isLoading: isPreviewLoading } =
    trpc.social.getUserPreview.useQuery(
      { userId: userId! },
      { enabled: !!userId }
    );

  const { data: fullProfile } = trpc.social.getPublicProfile.useQuery(
    { userId: userId! },
    { enabled: !!userId && isExpanded }
  );

  useEffect(() => {
    if (!userId) {
      setIsExpanded(false);
    }
  }, [userId]);

  // Lock body scroll when expanded
  useEffect(() => {
    if (!userId) return;
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded, userId]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 80;
    if (info.offset.y < -threshold) {
      setIsExpanded(true);
    } else if (info.offset.y > threshold) {
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        onClose();
      }
    }
  };

  const handleExpand = () => setIsExpanded(true);

  const content = (
    <AnimatePresence>
      {userId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />

          {/* Modal wrapper - full screen in expanded, bottom sheet otherwise */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed left-0 right-0 z-[201] flex justify-center ${
              isExpanded ? 'inset-0' : 'bottom-0'
            }`}
          >
            <div
              className={`w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col ${
                isExpanded
                  ? 'rounded-none h-full'
                  : 'rounded-t-[2.5rem] border-t-2 border-x-2 border-slate-200 max-h-[85dvh] mt-auto'
              }`}
            >
              {/* Drag handle */}
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.12}
                onDragEnd={handleDragEnd}
                className="shrink-0 flex justify-center pt-3.5 pb-2 cursor-grab active:cursor-grabbing"
              >
                <div className="w-12 h-1.5 rounded-full bg-slate-300" />
              </motion.div>

              {/* Close / collapse button */}
              <button
                onClick={() =>
                  isExpanded ? setIsExpanded(false) : onClose()
                }
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors z-10"
              >
                {isExpanded ? (
                  <ChevronUp size={20} strokeWidth={2.5} />
                ) : (
                  <X size={20} strokeWidth={2.5} />
                )}
              </button>

              {isExpanded && fullProfile ? (
                // Expanded full profile
                <div className="flex-1 overflow-y-auto hide-scrollbar bg-premium-pattern">
                  <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shrink-0">
                    <span className="font-black text-slate-800 text-[16px] tracking-tight truncate max-w-[200px]">
                      {fullProfile.name ?? 'Anónimo'}
                    </span>
                    <FollowButton
                      userId={fullProfile.id}
                      isFollowing={fullProfile.isFollowing}
                      size="sm"
                    />
                  </header>
                  <PublicProfileContent
                    profile={fullProfile}
                    currentUserId={undefined}
                  />
                </div>
              ) : (
                // Collapsed preview
                <div className="overflow-y-auto hide-scrollbar">
                  {isPreviewLoading || !preview ? (
                    <PreviewSkeleton />
                  ) : (
                    <div className="px-6 pb-8 pt-1">
                      {/* User header */}
                      <div className="flex items-center gap-4 mb-5">
                        <div className="relative">
                          <div
                            className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
                            style={{
                              backgroundColor:
                                leagueConfig[
                                  preview.division as keyof typeof leagueConfig
                                ]?.hex ?? '#9CA3AF',
                            }}
                          />
                          <div
                            className="relative w-16 h-16 rounded-full flex items-center justify-center font-black text-[26px] text-white shadow-[inset_0_-3px_6px_rgba(0,0,0,0.15)] border-[3px] z-10"
                            style={{
                              backgroundColor:
                                leagueConfig[
                                  preview.division as keyof typeof leagueConfig
                                ]?.hex ?? '#9CA3AF',
                              borderColor:
                                (
                                  leagueConfig[
                                    preview.division as keyof typeof leagueConfig
                                  ]?.hex ?? '#9CA3AF'
                                ) + '40',
                            }}
                          >
                            {(preview.name ?? 'U').charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-[18px] text-slate-800 truncate leading-tight">
                            {preview.name ?? 'Anónimo'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-slate-400">
                              Siguiendo a {preview.followingCount} ·{' '}
                              {preview.followersCount} seguidores
                            </span>
                          </div>
                          {preview.career && (
                            <div className="flex items-center gap-1 mt-1">
                              <Target
                                size={11}
                                className="text-slate-400"
                                strokeWidth={3}
                              />
                              <span className="text-[11px] font-bold text-slate-500 truncate">
                                {preview.career.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats cards */}
                      <div className="flex gap-2.5 mb-5">
                        <div className="flex-1 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 border-b-[3px] rounded-xl p-3 text-center">
                          <Shield
                            size={16}
                            className="mx-auto mb-1"
                            style={{
                              color:
                                leagueConfig[
                                  preview.division as keyof typeof leagueConfig
                                ]?.hex,
                            }}
                            fill={
                              leagueConfig[
                                preview.division as keyof typeof leagueConfig
                              ]?.hex
                            }
                          />
                          <div className="font-black text-[18px] text-slate-800 leading-none">
                            {preview.score.toFixed(1)}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                            Puntaje
                          </div>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-amber-50/50 to-white border-2 border-slate-200 border-b-[3px] rounded-xl p-3 text-center">
                          <Crown
                            size={16}
                            className="mx-auto mb-1 text-amber-500"
                            fill="#f59e0b"
                          />
                          <div className="font-black text-[18px] text-slate-800 leading-none">
                            {preview.highestScore.toFixed(1)}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                            Peak
                          </div>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-orange-50/50 to-white border-2 border-slate-200 border-b-[3px] rounded-xl p-3 text-center">
                          <div className="flex justify-center mb-1">
                            <FlameIcon className="w-4 h-4" />
                          </div>
                          <div className="font-black text-[18px] text-slate-800 leading-none">
                            {preview.streak}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                            Racha
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <FollowButton
                          userId={preview.id}
                          isFollowing={preview.isFollowing}
                          size="md"
                        />
                        <button
                          onClick={handleExpand}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 font-black uppercase tracking-wider text-[11px] rounded-xl border-2 border-slate-200 border-b-[3px] border-b-slate-300 bg-white text-slate-700 py-2 px-4 hover:bg-slate-50 active:translate-y-[1px] active:border-b-[2px] transition-all"
                        >
                          Ver perfil completo
                          <ChevronUp size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
};

function PreviewSkeleton() {
  return (
    <div className="px-6 pb-8 pt-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="flex gap-3 mb-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-16 bg-slate-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="flex-1 h-10 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
