'use client';

import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { OFFICIAL_DOCUMENTS } from './data';

export function DocumentsSection() {
  return (
    <section className="px-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-[16px] text-[#15192B]">
          Documentos oficiales
        </h2>
        <span className="text-[11px] font-black uppercase tracking-wider text-[#8B8F98]">
          UNSA
        </span>
      </div>

      <div className="space-y-3">
        {OFFICIAL_DOCUMENTS.map((doc, idx) => (
          <motion.button
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left bg-white rounded-[1.25rem] border-2 border-slate-100 border-b-[5px] p-4 active:border-b-2 active:translate-y-[3px] transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-[#F2F0EC] text-[#9B0F1C] flex items-center justify-center">
                <FileText size={22} strokeWidth={2.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#9B0F1C] text-white text-[9px] font-black uppercase tracking-wider">
                    {doc.tag}
                  </span>
                  {doc.size && (
                    <span className="text-[10px] font-bold text-[#8B8F98]">
                      {doc.size}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-[15px] text-[#15192B] leading-tight">
                  {doc.title}
                </h3>
                <p className="text-[12px] font-bold text-[#8B8F98] mt-0.5">
                  {doc.subtitle}
                </p>
              </div>

              <div className="shrink-0 self-center text-[#8B8F98]">
                <Download size={18} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.a
        href="https://www.unsa.edu.pe"
        target="_blank"
        rel="noreferrer"
        whileTap={{ scale: 0.98 }}
        className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-slate-100 text-[#15192B] font-black text-[13px]"
      >
        Ver todos en la web oficial
        <ExternalLink size={16} />
      </motion.a>
    </section>
  );
}
