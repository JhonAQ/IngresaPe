'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Award } from 'lucide-react';
import { CAREERS } from '../data';

export function PhaseCalculator() {
  const [phase1, setPhase1] = useState('');
  const [careerName, setCareerName] = useState(CAREERS[0].name);

  const target = useMemo(() => {
    const career = CAREERS.find((c) => c.name === careerName);
    if (!career) return 0;
    return career.scores[0].score;
  }, [careerName]);

  const needed = useMemo(() => {
    const p1 = Number.parseFloat(phase1);
    if (Number.isNaN(p1)) return null;
    // Fórmula simplificada: promedio ponderado 40% fase 1 + 60% fase 2.
    const raw = (target - p1 * 0.4) / 0.6;
    return Math.max(0, Math.ceil(raw));
  }, [phase1, target]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#B8860B]/10 text-[#B8860B] mb-3">
            <Calculator size={28} strokeWidth={2.5} />
          </div>
          <h2 className="font-black text-[22px] text-[#15192B] leading-tight">
            Calculadora de Fase
          </h2>
          <p className="text-[13px] font-bold text-[#8B8F98] mt-1">
            ¿Cuánto necesito en la fase 2 para ingresar?
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-2">
            <label className="block text-[12px] font-black uppercase tracking-wider text-[#8B8F98]">
              Carrera deseada
            </label>
            <select
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl h-12 px-3 font-black text-[14px] text-[#15192B] focus:border-[#B8860B] focus:outline-none"
            >
              {CAREERS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-2">
            <label className="block text-[12px] font-black uppercase tracking-wider text-[#8B8F98]">
              Nota obtenida en Fase 1
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={phase1}
              onChange={(e) => setPhase1(e.target.value)}
              placeholder="Ej: 1250"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl h-12 px-4 font-black text-[18px] text-[#15192B] placeholder:text-slate-300 focus:border-[#B8860B] focus:outline-none"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            />
          </div>

          {needed !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-5 text-center ${
                needed <= 2000
                  ? 'bg-[#9B0F1C] text-white'
                  : 'bg-slate-100 text-[#8B8F98]'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp size={20} />
                <span className="text-[12px] font-black uppercase tracking-wider opacity-80">
                  Meta en Fase 2
                </span>
              </div>
              <div
                className="font-black text-[40px] leading-none"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {needed}
              </div>
              <div className="mt-2 text-[13px] font-bold opacity-90">
                {needed <= target + 100
                  ? 'Es alcanzable con constancia. ¡Tú puedes!'
                  : 'Necesitas un repunte fuerte en la fase 2.'}
              </div>
            </motion.div>
          )}

          <div className="bg-[#F2F0EC] rounded-2xl p-4 flex items-start gap-3">
            <Award size={22} className="text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <span className="block font-black text-[13px] text-[#15192B]">
                Puntaje de corte histórico
              </span>
              <span className="block text-[12px] font-bold text-[#8B8F98]">
                {careerName}: {target} pts (último ingresante 2025)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
