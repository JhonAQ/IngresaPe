'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export function OfficialLinks() {
  const tiktokers = [
    {
      id: 'ingresa-pe',
      label: '@ingresa.pe',
      url: 'https://tiktok.com/@ingresa.pe',
      desc: '¡La cuenta oficial! Tips, hacks y noticias',
      featured: true,
    },
    {
      id: 'unsa-oficial',
      label: '@unsa_oficial',
      url: 'https://tiktok.com',
      desc: 'Noticias oficiales de la universidad',
      featured: false,
    },
    {
      id: 'cachimbo-unsa',
      label: '@cachimbo_unsa',
      url: 'https://tiktok.com',
      desc: 'Vida universitaria y datos curiosos',
      featured: false,
    },
    {
      id: 'estudiante-medicina',
      label: '@med_unsa',
      url: 'https://tiktok.com',
      desc: 'Blogs y motivación de estudio',
      featured: false,
    }
  ];

  return (
    <section className="px-5 pb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-[16px] text-[#15192B]">
          Cuentas que debes seguir
        </h2>
        <span className="text-[11px] font-black uppercase tracking-wider text-[#8B8F98]">
          TikTok
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {tiktokers.map((link, idx) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 p-3 rounded-[1.25rem] border-2 transition-all active:translate-y-[2px] ${
              link.featured 
                ? 'bg-slate-900 border-black text-white shadow-md' 
                : 'bg-white border-slate-100 text-[#15192B] hover:border-slate-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${link.featured ? 'bg-white text-black' : 'bg-slate-100 text-slate-800'}`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.31-1.92 1.57-4.58 2.22-6.97 1.58-2.61-.7-4.66-2.73-5.38-5.34-.73-2.65-.05-5.55 1.73-7.61 1.75-2.03 4.41-3.05 7.02-2.71V14.1c-1.39-.16-2.83.13-3.95.96-1.29.96-1.92 2.65-1.55 4.22.38 1.6 1.69 2.91 3.3 3.23 1.56.3 3.24-.13 4.38-1.22 1.25-1.18 1.78-2.91 1.76-4.63-.03-5.5-.04-10.99-.04-16.49h-1.03z"/>
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-black text-[14px] leading-tight ${link.featured ? 'text-white' : 'text-[#15192B]'}`}>
                {link.label}
              </h3>
              <p className={`text-[11px] font-bold mt-0.5 leading-snug truncate ${link.featured ? 'text-slate-300' : 'text-[#8B8F98]'}`}>
                {link.desc}
              </p>
            </div>

            <div className={`shrink-0 ${link.featured ? 'text-slate-400' : 'text-[#8B8F98]'}`}>
              <ExternalLink size={18} />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
