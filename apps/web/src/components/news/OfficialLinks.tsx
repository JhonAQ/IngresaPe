'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { OFFICIAL_LINKS } from './data';

export function OfficialLinks() {
  return (
    <section className="px-5 pb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-[16px] text-[#15192B]">
          Canales oficiales
        </h2>
        <span className="text-[11px] font-black uppercase tracking-wider text-[#8B8F98]">
          Directos
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {OFFICIAL_LINKS.map((link, idx) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full border-2 border-slate-100 bg-white font-black text-[13px] text-[#15192B] active:border-b-0 active:translate-y-[2px] transition-all"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: link.color }}
            />
            {link.label}
            <ExternalLink size={14} className="text-[#8B8F98]" />
          </motion.a>
        ))}
      </div>
    </section>
  );
}
