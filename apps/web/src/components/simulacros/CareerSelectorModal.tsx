'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap, Check } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { Button3D } from '../ui/Button3D';
import type { CareerDto } from '@ingresa-pe/domain';

interface CareerSelectorModalProps {
  isOpen: boolean;
  onSelect: (career: CareerDto) => void;
}

const areaLabels: Record<CareerDto['area'], string> = {
  INGENIERIAS: 'Ingenierías',
  BIOMEDICAS: 'Biomédicas',
  SOCIALES: 'Sociales',
};

const areaOrder: CareerDto['area'][] = ['INGENIERIAS', 'BIOMEDICAS', 'SOCIALES'];

export function CareerSelectorModal({ isOpen, onSelect }: CareerSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: careers = [], isLoading } = trpc.simulacro.getCareers.useQuery(undefined, {
    enabled: isOpen,
  });

  const selectCareer = trpc.profile.selectCareer.useMutation({
    onSuccess: (data) => {
      void utils.profile.getMe.invalidate();
      if (data.career) onSelect(data.career);
    },
  });

  const filteredCareers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return careers.filter((c) => c.name.toLowerCase().includes(term));
  }, [careers, search]);

  const grouped = useMemo(() => {
    const map = new Map<CareerDto['area'], CareerDto[]>();
    for (const area of areaOrder) map.set(area, []);
    for (const career of filteredCareers) {
      const list = map.get(career.area) ?? [];
      list.push(career);
      map.set(career.area, list);
    }
    return map;
  }, [filteredCareers]);

  const handleConfirm = () => {
    if (!selectedId) return;
    selectCareer.mutate({ careerId: selectedId });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] flex flex-col"
          >
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-[0_3px_0_0_#1d4ed8]">
                  <GraduationCap size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-black text-slate-800 text-[20px] leading-tight">
                    Elige tu carrera
                  </h2>
                  <p className="text-slate-400 font-bold text-[12px]">
                    Así podemos mostrarte tu meta de admisión.
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar carrera..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl font-bold text-slate-700 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {isLoading ? (
                <div className="py-10 text-center text-slate-400 font-bold">Cargando carreras...</div>
              ) : (
                areaOrder.map((area) => {
                  const list = grouped.get(area) ?? [];
                  if (list.length === 0) return null;
                  return (
                    <div key={area}>
                      <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-2">
                        {areaLabels[area]}
                      </h3>
                      <div className="space-y-2">
                        {list.map((career) => {
                          const isSelected = selectedId === career.id;
                          return (
                            <button
                              key={career.id}
                              onClick={() => setSelectedId(career.id)}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'bg-white border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <span className={`font-black text-[14px] ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                {career.name}
                              </span>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-slate-100">
              <Button3D
                variant="primary"
                className="w-full !py-3.5"
                disabled={!selectedId || selectCareer.isPending}
                onClick={handleConfirm}
              >
                {selectCareer.isPending ? 'Guardando...' : 'Confirmar carrera'}
              </Button3D>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
