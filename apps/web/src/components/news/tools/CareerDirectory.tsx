'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BookOpen, GraduationCap, ChevronDown } from 'lucide-react';
import { CAREERS } from '../data';

export function CareerDirectory() {
  const [expanded, setExpanded] = useState<string | null>(CAREERS[0].name);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#9B0F1C]/10 text-[#9B0F1C] mb-3">
            <GraduationCap size={28} strokeWidth={2.5} />
          </div>
          <h2 className="font-black text-[22px] text-[#15192B] leading-tight">
            Directorio de Carreras
          </h2>
          <p className="text-[13px] font-bold text-[#8B8F98] mt-1">
            Malla, perfil y sedes donde se enseña.
          </p>
        </div>

        <div className="space-y-3">
          {CAREERS.map((career) => {
            const isOpen = expanded === career.name;

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
                      {career.area}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="text-[#8B8F98]"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-[#F2F0EC] text-[#9B0F1C]">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <span className="block text-[12px] font-black uppercase tracking-wider text-[#8B8F98]">
                              Sede
                            </span>
                            <span className="block text-[14px] font-bold text-[#15192B]">
                              {career.sede}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-[#F2F0EC] text-[#B8860B]">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <span className="block text-[12px] font-black uppercase tracking-wider text-[#8B8F98]">
                              Malla resumida
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {career.malla.map((m) => (
                                <span
                                  key={m}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-[#15192B]"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#F2F0EC] rounded-xl p-3">
                          <span className="block text-[12px] font-black uppercase tracking-wider text-[#8B8F98] mb-1">
                            Perfil del egresado
                          </span>
                          <p className="text-[13px] font-bold text-[#15192B] leading-relaxed">
                            {career.perfil}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
