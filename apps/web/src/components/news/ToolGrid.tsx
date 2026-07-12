'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Calculator, School, GraduationCap } from 'lucide-react';
import { ToolSheet } from './ToolSheet';
import { PhotoValidator } from './tools/PhotoValidator';
import { PhaseCalculator } from './tools/PhaseCalculator';
import { CutoffSearch } from './tools/CutoffSearch';
import { CareerDirectory } from './tools/CareerDirectory';

type ToolId = 'photo' | 'calculator' | 'cutoff' | 'careers' | null;

interface ToolConfig {
  id: Exclude<ToolId, null>;
  title: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  component: React.ReactNode;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'photo',
    title: 'Foto SISADMISION',
    label: 'Foto',
    description: 'Valida tu foto con fondo blanco.',
    icon: Camera,
    color: '#9B0F1C',
    component: <PhotoValidator />,
  },
  {
    id: 'calculator',
    title: 'Calculadora de Fase',
    label: 'Calculadora',
    description: '¿Cuánto necesito en la fase 2?',
    icon: Calculator,
    color: '#B8860B',
    component: <PhaseCalculator />,
  },
  {
    id: 'cutoff',
    title: 'Puntajes de Corte',
    label: 'Puntajes',
    description: 'Histórico de los últimos 3 años.',
    icon: School,
    color: '#15192B',
    component: <CutoffSearch />,
  },
  {
    id: 'careers',
    title: 'Directorio de Carreras',
    label: 'Carreras',
    description: 'Malla, perfil y sedes.',
    icon: GraduationCap,
    color: '#9B0F1C',
    component: <CareerDirectory />,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function ToolGrid() {
  const [activeTool, setActiveTool] = useState<ToolId>(null);

  const activeConfig = TOOLS.find((t) => t.id === activeTool);

  return (
    <section className="px-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-[16px] text-[#15192B]">
          Herramientas de admisión
        </h2>
        <span className="text-[11px] font-black uppercase tracking-wider text-[#8B8F98]">
          {TOOLS.length} utilidades
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {TOOLS.map((tool) => (
          <motion.button
            key={tool.id}
            variants={item}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTool(tool.id)}
            className="group text-left bg-white rounded-[1.25rem] border-2 border-slate-100 border-b-[5px] p-4 transition-colors hover:border-slate-200 active:border-b-2 active:translate-y-[3px]"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${tool.color}12`, color: tool.color }}
            >
              <tool.icon size={22} strokeWidth={2.5} />
            </div>
            <span className="block font-black text-[15px] text-[#15192B] leading-tight">
              {tool.label}
            </span>
            <span className="block text-[11px] font-bold text-[#8B8F98] mt-1 leading-snug">
              {tool.description}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {activeConfig && (
        <ToolSheet
          isOpen={!!activeTool}
          onClose={() => setActiveTool(null)}
          title={activeConfig.title}
          accent={activeConfig.color}
        >
          {activeConfig.component}
        </ToolSheet>
      )}
    </section>
  );
}
