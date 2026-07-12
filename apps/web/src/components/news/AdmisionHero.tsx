'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ADMISSION_PHASES,
  formatCountdown,
  formatPhaseTitle,
  getCurrentPhase,
} from './data';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

interface CountdownBlockProps {
  value: number;
  label: string;
}

function CountdownBlock({ value, label }: CountdownBlockProps) {
  const display = pad(value);
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        key={display}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full aspect-square min-w-[58px] max-w-[72px] rounded-xl bg-[#15192B] flex items-center justify-center overflow-hidden border-b-4 border-[#0a0c14]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <span
          className="relative z-10 font-black text-[28px] sm:text-[32px] leading-none tracking-tight text-[#F2F0EC]"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {display}
        </span>
      </motion.div>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#F2F0EC]/80">
        {label}
      </span>
    </div>
  );
}

export function AdmisionHero() {
  const currentPhase = useMemo(() => getCurrentPhase(), []);
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(currentPhase.date)
  );

  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(currentPhase.date));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [currentPhase]);

  return (
    <section className="relative">
      {/* Cinta perforada superior */}
      <div className="flex justify-between px-3 -mb-3 relative z-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#9B0F1C]"
          />
        ))}
      </div>

      {/* Tarjeta Constancia Digital */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#9B0F1C] to-[#670a11] px-5 pt-8 pb-6 border-b-[6px] border-[#670a11]"
      >
        {/* Sello acuarelado de fondo */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-[12px] border-white/10 pointer-events-none" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-[6px] border-white/5 pointer-events-none flex items-center justify-center">
          <span className="font-black text-[11px] uppercase tracking-widest text-white/10 rotate-[-12deg]">
            UNSA 2026
          </span>
        </div>

        <div className="relative z-10">
          {/* Header de la constancia */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="block text-[10px] font-black uppercase tracking-widest text-white/70">
                  Constancia Digital
                </span>
                <span className="block text-[13px] font-black text-white">
                  Postulante UNSA
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-wider text-white">
              {currentPhase.type}
            </span>
          </div>

          {/* Cuenta regresiva */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-5">
            <CountdownBlock value={countdown.days} label="Días" />
            <span className="self-start mt-4 text-[20px] font-black text-white/60">:</span>
            <CountdownBlock value={countdown.hours} label="Hrs" />
            <span className="self-start mt-4 text-[20px] font-black text-white/60">:</span>
            <CountdownBlock value={countdown.minutes} label="Min" />
            <span className="self-start mt-4 text-[20px] font-black text-white/60">:</span>
            <CountdownBlock value={countdown.seconds} label="Seg" />
          </div>

          {/* Título dinámico */}
          <motion.h1
            key={currentPhase.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center font-black text-[18px] sm:text-[20px] leading-tight text-white"
          >
            {formatPhaseTitle(currentPhase)}
          </motion.h1>

          {/* Línea de fases próximas */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold text-white/70">
              <span>Próximas fechas</span>
              <span>{ADMISSION_PHASES.length} eventos</span>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {ADMISSION_PHASES.slice(0, 4).map((phase) => {
                const isCurrent = phase.id === currentPhase.id;
                return (
                  <div
                    key={phase.id}
                    className={`shrink-0 px-3 py-2 rounded-xl border ${
                      isCurrent
                        ? 'bg-white text-[#9B0F1C] border-white'
                        : 'bg-white/5 text-white border-white/10'
                    }`}
                  >
                    <span className="block text-[10px] font-black uppercase tracking-wider">
                      {phase.type}
                    </span>
                    <span className="block text-[11px] font-bold">
                      {phase.date.toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
