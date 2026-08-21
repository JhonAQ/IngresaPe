'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, School, Users, ChevronDown } from 'lucide-react';
import { CAREERS } from '../data';

type AreaTab = 'Todas' | 'Biomédicas' | 'Ingenierías' | 'Sociales';
const AREAS: AreaTab[] = ['Todas', 'Biomédicas', 'Ingenierías', 'Sociales'];

export function CutoffSearch() {
  const [query, setQuery] = useState('');
  const [activeArea, setActiveArea] = useState<AreaTab>('Todas');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = CAREERS;
    
    if (activeArea !== 'Todas') {
      result = result.filter(c => c.area === activeArea);
    }
    
    if (q) {
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.area.toLowerCase().includes(q)
      );
    }
    return result;
  }, [query, activeArea]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 hide-scrollbar">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#B8860B]/10 text-[#B8860B] mb-3">
            <School size={28} strokeWidth={2.5} />
          </div>
          <h2 className="font-black text-[22px] text-[#15192B] leading-tight">
            Puntajes Históricos
          </h2>
          <p className="text-[13px] font-bold text-[#8B8F98] mt-1">
            Consulta cortes y vacantes por área.
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
            placeholder="Buscar carrera..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-[14px] text-[#15192B] placeholder:text-slate-300 focus:border-[#B8860B] focus:outline-none"
          />
        </div>

        {/* Tabs de áreas */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {AREAS.map(area => (
            <button
              key={area}
              onClick={() => setActiveArea(area)}
              className={`shrink-0 px-4 py-2 rounded-xl font-black text-[12px] transition-colors ${
                activeArea === area 
                ? 'bg-[#15192B] text-white' 
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          {filtered.map((career) => {
            const isOpen = expanded === career.name;
            const last = career.scores[0];

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
                  className="w-full p-4 flex items-center justify-between text-left group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="block font-black text-[15px] text-[#15192B] truncate group-hover:text-[#B8860B] transition-colors">
                      {career.name}
                    </span>
                    <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      {career.area}
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
                      <span className="block text-[10px] font-bold text-[#8B8F98] mt-1">
                        PTS (2025)
                      </span>
                    </div>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                      <div className="px-4 pb-4 space-y-5 border-t border-slate-50 pt-4">
                        {/* Puntajes Históricos */}
                        <div>
                          <span className="block text-[11px] font-black uppercase tracking-wider text-[#8B8F98] mb-2">Evolución de puntajes</span>
                          <div className="grid grid-cols-3 gap-2">
                            {career.scores.map((s) => (
                              <div
                                key={s.year}
                                className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100"
                              >
                                <span className="block font-black text-[14px] text-[#15192B]"
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {s.score}
                                </span>
                                <span className="block text-[10px] font-bold text-[#8B8F98]">
                                  {s.year}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Vacantes por Proceso */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Users size={14} className="text-[#B8860B]" />
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#B8860B]">Vacantes Ofrecidas (2026)</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-[#B8860B]/10 rounded-xl p-2 text-center border border-[#B8860B]/20">
                                <span className="block font-black text-[14px] text-[#B8860B]">{career.vacancies.ceprunsaI}</span>
                                <span className="block text-[8px] font-black uppercase text-[#B8860B]/80">CEPRUNSA I</span>
                              </div>
                              <div className="bg-[#B8860B]/10 rounded-xl p-2 text-center border border-[#B8860B]/20">
                                <span className="block font-black text-[14px] text-[#B8860B]">{career.vacancies.ceprunsaII}</span>
                                <span className="block text-[8px] font-black uppercase text-[#B8860B]/80">CEPRUNSA II</span>
                              </div>
                              <div className="bg-[#B8860B]/10 rounded-xl p-2 text-center border border-[#B8860B]/20">
                                <span className="block font-black text-[14px] text-[#B8860B]">{career.vacancies.quintos}</span>
                                <span className="block text-[8px] font-black uppercase text-[#B8860B]/80">QUINTOS</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-slate-100 rounded-xl p-2 text-center border border-slate-200">
                                <span className="block font-black text-[14px] text-[#15192B]">{career.vacancies.ordinarioI}</span>
                                <span className="block text-[8px] font-black uppercase text-[#8B8F98]">ORDINARIO I</span>
                              </div>
                              <div className="bg-slate-100 rounded-xl p-2 text-center border border-slate-200">
                                <span className="block font-black text-[14px] text-[#15192B]">{career.vacancies.ordinarioII}</span>
                                <span className="block text-[8px] font-black uppercase text-[#8B8F98]">ORDINARIO II</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-slate-100 rounded-xl p-2 text-center border border-slate-200">
                                <span className="block font-black text-[14px] text-[#15192B]">{career.vacancies.extraordinario}</span>
                                <span className="block text-[8px] font-black uppercase text-[#8B8F98]">EXTRAORD.</span>
                              </div>
                              <div className="bg-slate-100 rounded-xl p-2 text-center border border-slate-200">
                                <span className="block font-black text-[14px] text-[#15192B]">{career.vacancies.traslado}</span>
                                <span className="block text-[8px] font-black uppercase text-[#8B8F98]">TRASLADOS</span>
                              </div>
                            </div>
                          </div>
                        </div>

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
