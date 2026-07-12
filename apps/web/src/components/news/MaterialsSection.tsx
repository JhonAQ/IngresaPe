'use client';

import { motion } from 'framer-motion';
import { FileDown, Link2, PlayCircle, BookOpen } from 'lucide-react';
import { STUDY_MATERIALS } from './data';

const formatIcons = {
  PDF: FileDown,
  LINK: Link2,
  VIDEO: PlayCircle,
};

const formatLabels = {
  PDF: 'Descargar PDF',
  LINK: 'Abrir recurso',
  VIDEO: 'Ver video',
};

const formatColors = {
  PDF: '#9B0F1C',
  LINK: '#1CB0F6',
  VIDEO: '#B8860B',
};

export function MaterialsSection() {
  return (
    <section className="px-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-[#9B0F1C]" strokeWidth={2.5} />
          <h2 className="font-black text-[16px] text-[#15192B]">
            Material de estudio
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STUDY_MATERIALS.map((material, idx) => {
          const Icon = formatIcons[material.format];
          const color = formatColors[material.format];

          return (
            <motion.button
              key={material.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.97 }}
              className="text-left bg-white rounded-[1.25rem] border-2 border-slate-100 border-b-[5px] p-4 active:border-b-2 active:translate-y-[3px] transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${color}12`, color }}
              >
                <Icon size={20} strokeWidth={2.5} />
              </div>

              <h3 className="font-black text-[14px] text-[#15192B] leading-tight">
                {material.title}
              </h3>
              <p className="text-[11px] font-bold text-[#8B8F98] mt-1 leading-snug">
                {material.subtitle}
              </p>

              <span
                className="inline-block mt-3 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg"
                style={{ backgroundColor: `${color}12`, color }}
              >
                {formatLabels[material.format]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
