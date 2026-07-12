'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  Clock,
  Flame,
  Home,
  RotateCcw,
  Share2,
  Star,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ChunkyTrophy } from './ChunkyTrophy';
import { AnimatedCounter } from './AnimatedCounter';
import { useProfileData } from '../../hooks/useProfileData';
import { getLevelFromXp, getLevelProgress } from '../../lib/level';
import { Button3D } from '../ui/Button3D';
import { Card3D } from '@ingresa-pe/ui';
import { InstallPromptModal } from '../pwa/InstallPromptModal';

interface CompletionScreenProps {
  onClose: () => void;
  onRetry: () => void;
  correctCount: number;
  totalQuestions: number;
  xpGained: number;
  coinsGained: number;
  durationSeconds: number;
}

function ConfettiBurst() {
  const [particles] = useState(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 360 - 180,
      y: Math.random() * -320 - 80,
      rotation: Math.random() * 720 - 360,
      color: ['#FFC800', '#58cc02', '#1cb0f6', '#ff4b4b', '#ce82ff', '#ff86c8'][
        Math.floor(Math.random() * 6)
      ],
      size: Math.random() * 8 + 6,
      delay: Math.random() * 0.5,
      shape: Math.random() > 0.5 ? 'rounded-sm' : 'rounded-full',
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: '50%', y: '35%', rotate: 0, opacity: 1, scale: 0 }}
          animate={{
            x: `calc(50% + ${p.x}px)`,
            y: `calc(35% + ${p.y}px)`,
            rotate: p.rotation,
            opacity: 0,
            scale: 1,
          }}
          transition={{ duration: 2, delay: p.delay, ease: 'easeOut' }}
          className={`absolute ${p.shape}`}
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  formatTime,
  color,
  bgColor,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  formatTime?: boolean;
  color: string;
  bgColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 18 }}
    >
      <Card3D
        variant="surface"
        padding="sm"
        className="flex flex-col items-center justify-center gap-2 text-center min-h-[120px]"
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: bgColor, color }}
        >
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="font-black text-[26px] leading-none text-[#3c3c3c]">
          <AnimatedCounter
            targetValue={value}
            duration={1.4}
            prefix={prefix}
            suffix={suffix}
            formatTime={formatTime}
          />
        </div>
        <div className="text-[10px] font-black uppercase tracking-wider text-[#8B8F98]">
          {label}
        </div>
      </Card3D>
    </motion.div>
  );
}

function LevelProgressCard({
  currentLevel,
  newLevel,
  leveledUp,
  prevPercent,
  newPercent,
  currentXp,
  nextXp,
  delay,
}: {
  currentLevel: number;
  newLevel: number;
  leveledUp: boolean;
  prevPercent: number;
  newPercent: number;
  currentXp: number;
  nextXp: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 18 }}
    >
      <Card3D variant="surface" padding="md" className="relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#58cc02]/15 text-[#58cc02] flex items-center justify-center">
              <Trophy size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-[#8B8F98]">
                Nivel {leveledUp ? currentLevel : currentLevel} → {newLevel}
              </div>
              <div className="font-black text-[15px] text-[#3c3c3c]">
                {leveledUp ? '¡Subiste de nivel! 🎉' : 'Progreso de nivel'}
              </div>
            </div>
          </div>
          {leveledUp && (
            <span className="px-2.5 py-1 rounded-full bg-[#58cc02] text-white text-[10px] font-black uppercase tracking-wider">
              ¡Nuevo!
            </span>
          )}
        </div>

        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: `${prevPercent}%` }}
            animate={{ width: `${newPercent}%` }}
            transition={{ delay: delay + 0.25, duration: 1.2, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#58cc02] to-[#7dd020]"
          />
        </div>

        <div className="flex justify-between mt-2 text-[11px] font-black text-[#8B8F98]">
          <span>
            {currentXp} / {nextXp} XP
          </span>
          <span>{newPercent}%</span>
        </div>
      </Card3D>
    </motion.div>
  );
}

export function CompletionScreen({
  onClose,
  onRetry,
  correctCount,
  totalQuestions,
  xpGained,
  coinsGained,
  durationSeconds,
}: CompletionScreenProps) {
  const { user, level, xpProgress, isLoading } = useProfileData();
  const [showInstallModal, setShowInstallModal] = useState(false);

  const totalXp = user?.totalXp ?? 0;
  const currentLevel = isLoading ? 1 : level;
  const currentCoins = user?.coins ?? 0;
  const streak = user?.streak ?? 0;
  const energy = user?.energy ?? 0;
  const isPremium = user?.isPremium ?? false;

  const simulatedTotalXp = totalXp + xpGained;
  const newLevel = getLevelFromXp(simulatedTotalXp);
  const newProgress = getLevelProgress(simulatedTotalXp);
  const leveledUp = newLevel > currentLevel;

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPerfect = correctCount === totalQuestions;

  const title = isPerfect
    ? '¡Perfección absoluta!'
    : accuracy >= 80
    ? '¡Increíble trabajo!'
    : accuracy >= 60
    ? '¡Muy bien hecho!'
    : '¡Lo lograste!';

  const subtitle = isPerfect
    ? 'Dominaste cada pregunta. Tu esfuerzo está dando frutos.'
    : accuracy >= 80
    ? `Acertaste ${correctCount} de ${totalQuestions}. Estás a nada de dominar el tema.`
    : `Acertaste ${correctCount} de ${totalQuestions}. Sigue practicando para dominar el tema.`;

  useEffect(() => {
    const timer = setTimeout(() => setShowInstallModal(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] overflow-x-hidden bg-gradient-to-b from-[#d7ffb8] via-[#b9f398] to-[#88e066]">
      <ConfettiBurst />
      {showInstallModal && <InstallPromptModal />}

      {/* Orbes de luz */}
      <div className="absolute top-10 left-6 w-32 h-32 rounded-full bg-white/25 blur-3xl pointer-events-none" />
      <div className="absolute top-32 right-4 w-40 h-40 rounded-full bg-[#58cc02]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-[-40px] w-48 h-48 rounded-full bg-[#1cb0f6]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col px-5 pt-10 pb-28">
        {/* Badge de precisión */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-sm text-[#3a7d00] font-black text-[11px] uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-white/60">
            <Sparkles size={12} strokeWidth={3} />
            {accuracy}% de precisión
          </div>
        </motion.div>

        {/* Trofeo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
          className="flex justify-center mb-5"
        >
          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChunkyTrophy className="w-36 h-36 drop-shadow-2xl" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
              className="absolute -top-1 -right-2 w-11 h-11 rounded-full bg-[#ff4b4b] text-white flex items-center justify-center shadow-lg border-2 border-white"
            >
              <Star size={22} fill="white" strokeWidth={0} />
            </motion.div>
          </div>
        </motion.div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-center mb-6"
        >
          <h1 className="font-black text-[30px] leading-tight text-[#58a700] mb-2 drop-shadow-sm">
            {title}
          </h1>
          <p className="text-[#3c3c3c] font-bold text-[15px] max-w-[280px] mx-auto leading-snug">
            {subtitle}
          </p>
        </motion.div>

        {/* Stats principales */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatCard
            icon={Zap}
            label="XP ganada"
            value={xpGained}
            prefix="+"
            color="#FFC800"
            bgColor="#FFF4C2"
            delay={0.35}
          />
          <StatCard
            icon={Target}
            label="Precisión"
            value={accuracy}
            suffix="%"
            color="#ff4b4b"
            bgColor="#FFE0E0"
            delay={0.45}
          />
          <StatCard
            icon={Clock}
            label="Tiempo"
            value={durationSeconds}
            formatTime
            color="#1cb0f6"
            bgColor="#D6F3FF"
            delay={0.55}
          />
        </div>

        {/* Racha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, type: 'spring', stiffness: 260, damping: 18 }}
          className="mb-4"
        >
          <Card3D variant="primary" padding="md" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Flame size={28} fill="white" strokeWidth={0} />
              </div>
              <div>
                <div className="font-black text-[22px] leading-none">{streak} días de racha</div>
                <div className="text-[12px] font-bold opacity-90 mt-0.5">
                  ¡Sigue así para mantenerla encendida!
                </div>
              </div>
            </div>
            <div className="text-[28px] font-black">🔥</div>
          </Card3D>
        </motion.div>

        {/* Progreso de nivel */}
        <div className="mb-4">
          <LevelProgressCard
            currentLevel={currentLevel}
            newLevel={newLevel}
            leveledUp={leveledUp}
            prevPercent={xpProgress.percent}
            newPercent={newProgress.percent}
            currentXp={newProgress.current}
            nextXp={newProgress.next}
            delay={0.8}
          />
        </div>

        {/* Stats secundarias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            {
              label: 'Energía',
              value: isPremium ? '∞' : energy,
              icon: Zap,
              color: '#FF86CD',
              bg: '#FFE6F4',
            },
            {
              label: 'Monedas',
              value: currentCoins + coinsGained,
              icon: Star,
              color: '#1cb0f6',
              bg: '#E0F4FF',
            },
            {
              label: 'Racha',
              value: streak,
              icon: Flame,
              color: '#ff9600',
              bg: '#FFF0D6',
            },
          ].map((stat) => (
            <Card3D
              key={stat.label}
              variant="surface"
              padding="sm"
              className="flex flex-col items-center justify-center gap-1 text-center"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: stat.bg, color: stat.color }}
              >
                <stat.icon size={18} strokeWidth={2.5} />
              </div>
              <div className="font-black text-[18px] text-[#3c3c3c]">{stat.value}</div>
              <div className="text-[9px] font-black uppercase tracking-wider text-[#8B8F98]">
                {stat.label}
              </div>
            </Card3D>
          ))}
        </motion.div>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col gap-3"
        >
          <Button3D variant="gold" onClick={onClose} className="text-[16px]">
            <Home size={20} strokeWidth={3} />
            Continuar
          </Button3D>
          <Button3D variant="secondary" onClick={onRetry} className="text-[16px]">
            <RotateCcw size={18} strokeWidth={3} />
            Repetir lección
          </Button3D>
        </motion.div>

        {/* Compartir (sutil) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          onClick={() => {
            if (navigator.share) {
              void navigator.share({
                title: '¡Terminé un nodo en ingresa.pe!',
                text: `Acerté ${correctCount}/${totalQuestions} y gané ${xpGained} XP.`,
                url: window.location.href,
              });
            }
          }}
          className="mt-5 mx-auto flex items-center gap-2 text-[#3c3c3c]/70 font-black text-[12px] uppercase tracking-wider hover:text-[#3c3c3c] transition-colors"
        >
          <Share2 size={14} strokeWidth={3} />
          Compartir logro
        </motion.button>
      </div>
    </div>
  );
}
