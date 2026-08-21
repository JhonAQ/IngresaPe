'use client';

import { motion } from 'framer-motion';
import { BookOpen, FileText, Link2, PlayCircle } from 'lucide-react';
import { STUDY_MATERIALS } from './data';

const formatIcons = {
  PDF: FileText,
  LINK: Link2,
  VIDEO: PlayCircle,
};

const formatColors = {
  PDF: 'text-red-500',
  LINK: 'text-blue-500',
  VIDEO: 'text-amber-500',
};

const formatBadges = {
  PDF: 'bg-red-500',
  LINK: 'bg-blue-500',
  VIDEO: 'bg-amber-500',
};

export function MaterialsSection() {
  return (
    <section className="px-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#9B0F1C]" strokeWidth={2.5} />
          <h2 className="font-black text-[18px] text-slate-800 tracking-tight">
            Tomos UNSA
          </h2>
        </div>
      </div>

      <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-5">
        <div className="grid grid-cols-3 gap-x-3 gap-y-5">
          {STUDY_MATERIALS.map((material, idx) => {
            const Icon = formatIcons[material.format];
            const textColor = formatColors[material.format];
            const badgeBg = formatBadges[material.format];

            return (
              <motion.button
                key={material.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center text-center gap-2 cursor-pointer group outline-none"
              >
                <div className={`w-16 h-20 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center ${textColor} group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors relative`}>
                  {/* Doblez del archivo */}
                  <div className="absolute top-0 right-0 w-5 h-5 bg-slate-50/50 border-b border-l border-slate-200 rounded-bl-xl group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors" />
                  
                  <Icon size={28} strokeWidth={1.5} />
                  <span className={`text-[9px] font-black mt-1.5 ${badgeBg} text-white px-2 py-0.5 rounded`}>
                    {material.format}
                  </span>
                </div>
                <span className="text-[11px] font-bold leading-tight text-slate-700 group-hover:text-blue-600 line-clamp-3 px-1">
                  {material.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
