'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Trophy, RotateCcw, Home, Sparkles, Star } from 'lucide-react';
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
}

function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => setDisplayValue(latest));
    return unsubscribe;
  }, [display]);

  return <span>{displayValue}</span>;
}

function ConfettiBurst() {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 360 - 180,
    y: Math.random() * -300 - 100,
    rotation: Math.random() * 720 - 360,
    color: ['#FFC800', '#58cc02', '#1cb0f6', '#ff4b4b', '#ce82ff'][Math.floor(Math.random() * 5)],
    size: Math.random() * 8 + 6,
    delay: Math.random() * 0.4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: '50%',
            y: '40%',
            rotate: 0,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: `calc(50% + ${p.x}px)`,
            y: `calc(40% + ${p.y}px)`,
            rotate: p.rotation,
            opacity: 0,
            scale: 1,
          }}
          transition={{
            duration: 1.8,
            delay: p.delay,
            ease: 'easeOut',
          }}
          className="absolute rounded-sm"
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

function RewardCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card3D variant="surface" padding="sm" className="flex flex-col items-center gap-1 min-w-[90px]">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="font-black text-[22px] leading-none text-[#3c3c3c]">
          +<AnimatedNumber value={value} />
        </div>
        <div className="text-[10px] font-black uppercase tracking-wider text-[#8B8F98]">{label}</div>
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
}: CompletionScreenProps) {
  const { user, level, xpProgress, isLoading } = useProfileData();
  const [showInstallModal, setShowInstallModal] = useState(false);

  const totalXp = user?.totalXp ?? 0;
  const currentLevel = isLoading ? 1 : level;
  const currentCoins = user?.coins ?? 0;
  const streak = user?.streak ?? 0;
  const energy = user?.energy ?? 0;

  const prevPercent = xpProgress.percent;
  // Simulamos el nuevo progreso sumando XP ganado
  const simulatedTotalXp = totalXp + xpGained;
  const newLevel = getLevelFromXp(simulatedTotalXp);
  const newProgress = getLevelProgress(simulatedTotalXp);
  const leveledUp = newLevel > currentLevel;

  const isPerfect = correctCount === totalQuestions;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const title = isPerfect
    ? '¡Perfección absoluta!'
    : accuracy >= 80
    ? '¡Increíble trabajo!'
    : accuracy >= 60
    ? '¡Muy bien hecho!'
    : '¡Lo lograste!';

  const subtitle = isPerfect
    ? 'Dominaste cada pregunta. Tu esfuerzo está dando frutos.'
    : `Acertaste ${correctCount} de ${totalQuestions}. Sigue practicando para dominar el tema.`;

  useEffect(() => {
    const timer = setTimeout(() => setShowInstallModal(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto h-[100dvh] flex flex-col items-center justify-center px-6 text-center overflow-hidden bg-gradient-to-br from-[#d7ffb8] via-[#b9f398] to-[#88e066]">
      <ConfettiBurst />
      {showInstallModal && <InstallPromptModal />}

      {/* Shine orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[#58cc02]/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative z-10 mb-4"
      >
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[100px] drop-shadow-2xl"
          >
            <Trophy size={100} strokeWidth={1.5} className="text-[#FFC800] fill-[#FFC800]" />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#ff4b4b] text-white flex items-center justify-center shadow-lg border-2 border-white"
          >
            <Star size={20} fill="white" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mb-8"
      >
        <div className="inline-flex items-center gap-1.5 bg-white/40 backdrop-blur-sm text-[#3a7d00] font-black text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 border border-white/50">
          <Sparkles size={12} strokeWidth={3} />
          {accuracy}% de precisión
        </div>
        <h1 className="font-black text-[32px] leading-tight text-[#58a700] mb-2 drop-shadow-sm">
          {title}
        </h1>
        <p className="text-[#3c3c3c] font-bold text-[15px] max-w-[280px] mx-auto">
          {subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative z-10 flex gap-3 mb-6"
      >
        <RewardCard icon={Star} label="XP" value={xpGained} color="#FFC800" delay={0.4} />
        <RewardCard icon={Sparkles} label="Monedas" value={coinsGained} color="#1cb0f6" delay={0.55} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 w-full max-w-[320px] mb-8"
      >
        <Card3D variant="surface" padding="md" className="text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-black uppercase tracking-wider text-[#8B8F98]">
              Nivel {leveledUp ? currentLevel : currentLevel} → {newLevel}
            </span>
            {leveledUp && (
              <span className="px-2 py-0.5 rounded-full bg-success-500 text-white text-[10px] font-black uppercase">
                ¡Subiste!
              </span>
            )}
          </div>
          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: `${prevPercent}%` }}
              animate={{ width: `${newProgress.percent}%` }}
              transition={{ delay: 0.9, duration: 1.2, ease: 'easeOut' }}
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#58cc02] to-[#7dd020]"
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] font-black text-[#8B8F98]">
            <span>{newProgress.current} / {newProgress.next} XP</span>
            <span>{newProgress.percent}%</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
            {[
              { label: 'Racha', value: streak, color: '#ff9600' },
              { label: 'Energía', value: energy, color: '#FF86CD' },
              { label: 'Monedas', value: currentCoins, color: '#1cb0f6' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-black text-[16px] text-[#3c3c3c]">{stat.value}</div>
                <div className="text-[9px] font-black uppercase tracking-wider text-[#8B8F98]">{stat.label}</div>
              </div>
            ))}
          </div>
        </Card3D>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 flex flex-col gap-3 w-full max-w-[320px]"
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
    </div>
  );
}
