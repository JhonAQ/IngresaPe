'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  GraduationCap,
  Check,
  ArrowLeft,
  Cpu,
  Users,
  HeartPulse,
} from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { Button3D } from '../ui/Button3D';
import type { CareerDto } from '@ingresa-pe/domain';

type Area = CareerDto['area'];
type Step = 'area' | 'career';

interface CareerSelectorModalProps {
  isOpen: boolean;
  onSelect: (career: CareerDto) => void;
}

const areaLabels: Record<Area, string> = {
  INGENIERIAS: 'Ingenierías',
  BIOMEDICAS: 'Biomédicas',
  SOCIALES: 'Sociales',
};

const areaOrder: Area[] = ['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS'];

const areaConfig: Record<
  Area,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    shadow: string;
    text: string;
    gradient: string;
  }
> = {
  INGENIERIAS: {
    icon: Cpu,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    shadow: 'border-b-blue-300',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-400',
  },
  SOCIALES: {
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    shadow: 'border-b-purple-300',
    text: 'text-purple-600',
    gradient: 'from-purple-500 to-fuchsia-400',
  },
  BIOMEDICAS: {
    icon: HeartPulse,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    shadow: 'border-b-green-300',
    text: 'text-green-600',
    gradient: 'from-green-500 to-emerald-400',
  },
};

export function CareerSelectorModal({ isOpen, onSelect }: CareerSelectorModalProps) {
  const [step, setStep] = useState<Step>('area');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: careers = [], isLoading } = trpc.simulacro.getCareers.useQuery(undefined, {
    enabled: isOpen,
  });

  const selectCareer = trpc.profile.selectCareer.useMutation({
    onSuccess: (data) => {
      void utils.profile.getMe.invalidate();
      if (data.career) onSelect(data.career);
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('area');
      setSelectedArea(null);
      setSelectedId(null);
      setSearch('');
    }
  }, [isOpen]);

  const counts = useMemo(() => {
    const map = new Map<Area, number>();
    for (const area of areaOrder) map.set(area, 0);
    for (const career of careers) {
      map.set(career.area, (map.get(career.area) ?? 0) + 1);
    }
    return map;
  }, [careers]);

  const filteredCareers = useMemo(() => {
    if (!selectedArea) return [];
    const term = search.trim().toLowerCase();
    return careers
      .filter((c) => c.area === selectedArea && c.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [careers, selectedArea, search]);

  const handleSelectArea = (area: Area) => {
    setSelectedArea(area);
    setStep('career');
    setSearch('');
  };

  const handleBack = () => {
    setStep('area');
    setSelectedId(null);
    setSearch('');
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    selectCareer.mutate({ careerId: selectedId });
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[400px] h-auto max-h-[85vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {step === 'area' ? (
                <AreaStep
                  key="area"
                  isLoading={isLoading}
                  counts={counts}
                  onSelectArea={handleSelectArea}
                />
              ) : selectedArea ? (
                <CareerStep
                  key="career"
                  area={selectedArea}
                  careers={filteredCareers}
                  search={search}
                  onSearchChange={setSearch}
                  selectedId={selectedId}
                  onSelectCareer={setSelectedId}
                  onBack={handleBack}
                  onConfirm={handleConfirm}
                  isConfirming={selectCareer.isPending}
                />
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

// =============================================================================
// PASO 1: Selección de área
// =============================================================================

interface AreaStepProps {
  isLoading: boolean;
  counts: Map<Area, number>;
  onSelectArea: (area: Area) => void;
}

function AreaStep({ isLoading, counts, onSelectArea }: AreaStepProps) {
  return (
    <div className="flex flex-col">
      <div className="px-6 pt-6 pb-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center mx-auto mb-3 shadow-[0_4px_0_0_#911019]">
          <GraduationCap size={30} strokeWidth={2.5} />
        </div>
        <h2 className="font-black text-slate-800 text-[22px] leading-tight">
          ¿Qué área te apasiona?
        </h2>
        <p className="text-slate-400 font-bold text-[13px] mt-1">
          Elige un área para ver sus carreras.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-2 pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-slate-100 rounded-[1.5rem] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {areaOrder.map((area) => {
              const config = areaConfig[area];
              const Icon = config.icon;
              const count = counts.get(area) ?? 0;
              return (
                <motion.button
                  key={area}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectArea(area)}
                  className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] border-2 ${config.border} ${config.shadow} border-b-[6px] bg-white active:border-b-2 active:translate-y-[4px] transition-all`}
                >
                  <div
                    className={`w-13 h-13 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={26} strokeWidth={2.5} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className={`font-black text-[17px] leading-tight ${config.text}`}>
                      {areaLabels[area]}
                    </h3>
                    <p className="text-slate-400 font-bold text-[11px] mt-0.5">
                      {count} {count === 1 ? 'carrera' : 'carreras'}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// PASO 2: Selección de carrera
// =============================================================================

interface CareerStepProps {
  area: Area;
  careers: CareerDto[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedId: string | null;
  onSelectCareer: (id: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
}

function CareerStep({
  area,
  careers,
  search,
  onSearchChange,
  selectedId,
  onSelectCareer,
  onBack,
  onConfirm,
  isConfirming,
}: CareerStepProps) {
  const config = areaConfig[area];
  const AreaIcon = config.icon;

  return (
    <div className="flex flex-col h-[80vh] min-h-0">
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0"
            aria-label="Volver a áreas"
          >
            <ArrowLeft size={22} strokeWidth={3} />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h2 className={`font-black text-[20px] leading-tight truncate ${config.text}`}>
              {areaLabels[area]}
            </h2>
            <p className="text-slate-400 font-bold text-[12px] truncate">
              Selecciona tu carrera
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
            <AreaIcon size={22} strokeWidth={2.5} />
          </div>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar carrera..."
            className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl font-bold text-slate-700 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
        {careers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 font-bold text-[14px]">
              No se encontraron carreras.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {careers.map((career) => {
              const isSelected = selectedId === career.id;
              return (
                <motion.button
                  key={career.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectCareer(career.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-[1.2rem] border-2 text-left transition-all
                    ${
                      isSelected
                        ? 'bg-primary-50 border-primary-500'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                >
                  <span
                    className={`font-black text-[14px] truncate pr-3 ${
                      isSelected ? 'text-primary-700' : 'text-slate-700'
                    }`}
                  >
                    {career.name}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0">
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100">
        <Button3D
          variant="brand"
          className="w-full !py-3.5"
          disabled={!selectedId || isConfirming}
          onClick={onConfirm}
        >
          {isConfirming
            ? 'Guardando...'
            : selectedId
            ? 'Confirmar carrera'
            : 'Selecciona una carrera'}
        </Button3D>
      </div>
    </div>
  );
}
