'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, ChevronRight, Share2 } from 'lucide-react';
import { ChunkyTrophy } from './ChunkyTrophy';
import { AnimatedCounter } from './AnimatedCounter';
import { FreezeHotIcon } from './FreezeHotIcon';
import { XpIcon, FlameIcon, GemIcon, RankingIcon } from '@ingresa-pe/ui';
import { useProfileData } from '../../hooks/useProfileData';

interface CompletionScreenProps {
  onClose: () => void;
  correctCount: number;
  totalQuestions: number;
  xpGained: number;
  coinsGained: number;
  durationSeconds: number;
}

function isFirstActivityToday(
  lastInteraction: Date | string | null | undefined
): boolean {
  if (!lastInteraction) return true;
  const last = new Date(lastInteraction);
  const now = new Date();
  return (
    last.getFullYear() !== now.getFullYear() ||
    last.getMonth() !== now.getMonth() ||
    last.getDate() !== now.getDate()
  );
}

function Particles() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            x: Math.cos((i * 60 * Math.PI) / 180) * 100,
            y: Math.sin((i * 60 * Math.PI) / 180) * 100,
          }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#ff9600] rounded-full"
          style={{ marginLeft: '-6px', marginTop: '-6px' }}
        />
      ))}
    </>
  );
}

function StatCard({
  show,
  header,
  icon,
  value,
  prefix,
  suffix,
  formatTime,
  bgColor,
  borderColor,
  textColor,
}: {
  show: boolean;
  header: string;
  icon: React.ReactNode;
  value: number;
  prefix?: string;
  suffix?: string;
  formatTime?: boolean;
  bgColor: string;
  borderColor: string;
  textColor: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className={`${bgColor} rounded-2xl border-b-[6px] ${borderColor} p-1 flex flex-col`}
        >
          <div className="bg-white/20 rounded-t-xl py-1 flex items-center justify-center">
            <span className="font-bold text-white/90 text-[10px] uppercase tracking-widest">
              {header}
            </span>
          </div>
          <div className="bg-white rounded-b-xl flex-1 flex flex-col items-center justify-center py-3 gap-1">
            {icon}
            <span className={`font-black ${textColor} text-[20px] leading-none`}>
              <AnimatedCounter
                targetValue={value}
                duration={1.5}
                prefix={prefix}
                suffix={suffix}
                formatTime={formatTime}
              />
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StreakCard({
  show,
  streak,
  onShare,
  correctCount,
  totalQuestions,
  xpGained,
}: {
  show: boolean;
  streak: number;
  onShare: () => void;
  correctCount: number;
  totalQuestions: number;
  xpGained: number;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-full bg-white border-2 border-[#e5e5e5] border-b-[6px] rounded-[1.5rem] p-4 flex items-center gap-4"
        >
          <div className="w-16 h-16 bg-[#fff2e0] rounded-2xl flex items-center justify-center border-2 border-[#ff9600]/20 shrink-0">
            <FlameIcon className="w-8 h-8" active />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-[#ff9600] text-[20px] leading-tight">
              Racha de{' '}
              <AnimatedCounter targetValue={streak} duration={1} /> días
            </h3>
            <p className="font-bold text-[#afafaf] text-[13px] leading-snug">
              ¡Estás en llamas! Vuelve mañana para no perderla.
            </p>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                void navigator.share({
                  title: '¡Terminé un nodo en ingresa.pe!',
                  text: `Acerté ${correctCount}/${totalQuestions} y gané ${xpGained} XP.`,
                  url: window.location.href,
                });
              } else {
                onShare();
              }
            }}
            className="shrink-0 w-10 h-10 rounded-full border-2 border-[#e5e5e5] flex items-center justify-center text-[#afafaf] hover:text-[#1cb0f6] transition-colors active:scale-90"
          >
            <Share2 size={20} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RewardSummaryCard({
  show,
  coinsGained,
  rank,
  onProtect,
  isProtected,
}: {
  show: boolean;
  coinsGained: number;
  rank: number | null;
  onProtect: () => void;
  isProtected: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-full bg-white border-2 border-[#e5e5e5] border-b-[6px] rounded-[1.5rem] p-4 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#e0f4ff] rounded-2xl flex items-center justify-center border-2 border-[#1cb0f6]/20">
              <GemIcon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-[#1cb0f6] text-[18px] leading-tight">
                Ganaste{' '}
                <AnimatedCounter targetValue={coinsGained} duration={1} prefix="+" />{' '}
                gemas
              </h3>
              <p className="font-bold text-[#afafaf] text-[13px] leading-snug">
                Sigue acumulando para la tienda.
              </p>
            </div>
          </div>

          {rank !== null && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#fff8db] rounded-2xl flex items-center justify-center border-2 border-[#fec701]/30">
                <RankingIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[#e5a900] text-[18px] leading-tight">
                  Ranking #{rank}
                </h3>
                <p className="font-bold text-[#afafaf] text-[13px] leading-snug">
                  Tu posición actual en la liga.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onProtect}
            disabled={isProtected}
            className={`w-full flex items-center justify-center gap-2 font-black text-[15px] uppercase tracking-widest py-3 rounded-xl border-b-[4px] transition-all active:border-b-0 active:translate-y-[4px] ${
              isProtected
                ? 'bg-[#e5e5e5] text-[#afafaf] border-[#d4d4d4] cursor-default'
                : 'bg-[#71d2ff] text-white border-[#1cb0f6] hover:bg-[#5ec9ff]'
            }`}
          >
            <FreezeHotIcon className="w-6 h-9" />
            {isProtected ? 'Racha protegida' : 'Obtener protector de racha'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CompletionScreen({
  onClose,
  correctCount,
  totalQuestions,
  xpGained,
  coinsGained,
  durationSeconds,
}: CompletionScreenProps) {
  const { user, rank } = useProfileData();
  const streak = user?.streak ?? 0;
  const firstActivityToday = isFirstActivityToday(user?.lastInteraction);

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const [showExp, setShowExp] = useState(false);
  const [showAcc, setShowAcc] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [streakProtected, setStreakProtected] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowExp(true), 800),
      setTimeout(() => setShowAcc(true), 1400),
      setTimeout(() => setShowTime(true), 2000),
      setTimeout(() => setShowSummary(true), 2800),
      setTimeout(() => setShowButton(true), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto relative bg-[#fcfcfc] min-h-[100dvh] flex flex-col font-sans border-x border-[#e5e5e5] overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-8">
        {/* Hero */}
        <div className="relative flex flex-col items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10"
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChunkyTrophy className="w-40 h-40" />
            </motion.div>
            <Particles />
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="font-black text-[32px] text-[#ffc800] tracking-tight mt-6 drop-shadow-sm text-center leading-none uppercase"
          >
            Módulo <br />
            <span className="text-[#ff9600]">Superado!</span>
          </motion.h1>
        </div>

        {/* Stats */}
        <main className="w-full flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3 min-h-[110px]">
            <StatCard
              show={showExp}
              header="EXP Ganada"
              icon={<XpIcon className="w-6 h-6 text-[#ffc800]" />}
              value={xpGained}
              prefix="+"
              bgColor="bg-[#ffc800]"
              borderColor="border-[#e5a900]"
              textColor="text-[#e5a900]"
            />

            <StatCard
              show={showAcc}
              header="Precisión"
              icon={<Target size={24} className="text-[#58cc02]" strokeWidth={2.5} />}
              value={accuracy}
              suffix="%"
              bgColor="bg-[#58cc02]"
              borderColor="border-[#58a700]"
              textColor="text-[#58a700]"
            />

            <StatCard
              show={showTime}
              header="Tiempo"
              icon={<Clock size={24} className="text-[#1cb0f6]" strokeWidth={2.5} />}
              value={durationSeconds}
              formatTime
              bgColor="bg-[#1cb0f6]"
              borderColor="border-[#1899d6]"
              textColor="text-[#1899d6]"
            />
          </div>

          {firstActivityToday ? (
            <StreakCard
              show={showSummary}
              streak={streak}
              correctCount={correctCount}
              totalQuestions={totalQuestions}
              xpGained={xpGained}
              onShare={() => {
                // Fallback cuando navigator.share no está disponible.
              }}
            />
          ) : (
            <RewardSummaryCard
              show={showSummary}
              coinsGained={coinsGained}
              rank={rank}
              onProtect={() => setStreakProtected(true)}
              isProtected={streakProtected}
            />
          )}
        </main>
      </div>

      {/* Continue button */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="px-5 py-6 bg-white border-t-2 border-[#e5e5e5]"
          >
            <button
              onClick={onClose}
              className="w-full bg-[#58cc02] text-white font-black text-[18px] uppercase tracking-widest py-4 rounded-[1.25rem] border-b-[6px] border-[#58a700] hover:bg-[#46a302] active:border-b-0 active:translate-y-[6px] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Continuar <ChevronRight size={24} strokeWidth={3} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
