'use client';

import { motion } from 'framer-motion';
import { FileText, ExternalLink } from 'lucide-react';
import { OFFICIAL_DOCUMENTS } from './data';

export function DocumentsSection() {
  return (
    <section className="px-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-[18px] text-slate-800 tracking-tight">
          Documentos oficiales
        </h2>
      </div>

      <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-5">
        <div className="grid grid-cols-3 gap-x-3 gap-y-5">
          {OFFICIAL_DOCUMENTS.map((doc, idx) => (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center text-center gap-2 cursor-pointer group outline-none"
            >
              <div className="w-16 h-20 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-red-500 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors relative">
                {/* Doblez del papel tipo PDF */}
                <div className="absolute top-0 right-0 w-5 h-5 bg-slate-50/50 border-b border-l border-slate-200 rounded-bl-xl group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors" />
                <FileText size={28} strokeWidth={1.5} />
                <span className="text-[9px] font-black mt-1.5 bg-red-500 text-white px-2 py-0.5 rounded">PDF</span>
              </div>
              <span className="text-[11px] font-bold leading-tight text-slate-700 group-hover:text-blue-600 line-clamp-3 px-1">
                {doc.title}
              </span>
            </motion.button>
          ))}
        </div>

        <a 
          href="https://www.unsa.edu.pe" 
          target="_blank" 
          rel="noreferrer" 
          className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-colors"
        >
          Ver portal UNSA
          <ExternalLink size={16} strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
}
