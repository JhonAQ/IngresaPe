'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingDown, TrendingUp, Minus, School } from 'lucide-react';
import { CAREERS } from '../data';

export function CutoffSearch() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CAREERS;
    return CAREERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.sede.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#15192B]/10 text-[#15192B] mb-3">
            <School size={28} strokeWidth={2.5} />
          </div>
          <h2 className="font-black text-[22px] text-[#15192B] leading-tight">
            Puntajes Mínimos
          </h2>
          <p className="text-[13px] font-bold text-[#8B8F98] mt-1">
            Corte histórico de los últimos 3 años.
          </p>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8F98]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar carrera, área o sede…"
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-bold text-[14px] text-[#15192B] placeholder:text-slate-300 focus:border-[#15192B] focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((career) => {
            const isOpen = expanded === career.name;
            const last = career.scores[0];
            const prev = career.scores[1];
            const diff = last.score - prev.score;
            const TrendIcon =
              diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
            const trendColor =
              diff > 0 ? 'text-error-500' : diff < 0 ? 'text-success-500' : 'text-[#8B8F98]';

            return (
              <motion.div
                key={career.name}
                layout
                className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpanded(isOpen ? null : career.name)
                  }
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="min-w-0">
                    <span className="block font-black text-[15px] text-[#15192B] truncate">
                      {career.name}
                    </span>
                    <span className="block text-[11px] font-bold text-[#8B8F98]">
                      {career.area} · {career.sede}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className="block font-black text-[18px] leading-none text-[#15192B]"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {last.score}
                      </span>
                      <span className="block text-[10px] font-bold text-[#8B8F98]">
                        2025
                      </span>
                    </div>
                    <div className={`flex items-center gap-0.5 ${trendColor}`}>
                      <TrendIcon size={16} />
                      <span className="text-[11px] font-black">
                        {Math.abs(diff)}
                      </span>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {career.scores.map((s) => (
                            <div
                              key={s.year}
                              className="bg-[#F2F0EC] rounded-xl p-2 text-center"
                            >
                              <span className="block font-black text-[16px] text-[#15192B]"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {s.score}
                              </span>
                              <span className="block text-[10px] font-bold text-[#8B8F98]">
                                {s.year}
                              </span>
                              <span className="block text-[9px] font-black text-[#9B0F1C]">
                                {s.vacancies} vac
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[12px] font-bold text-[#8B8F98] leading-relaxed">
                          {career.perfil}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <span className="text-[14px] font-bold text-[#8B8F98]">
                No encontramos esa carrera.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
