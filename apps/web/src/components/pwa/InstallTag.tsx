'use client';

import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { useInstallPrompt } from './InstallPromptContext';

export function InstallTag() {
  const { isInstallable, promptInstall } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div className="px-5 py-4">
      <button
        onClick={promptInstall}
        className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 active:border-b-2 active:translate-y-[2px] transition-all text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#911019]">
          <Smartphone size={24} strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-[15px] leading-tight">
            Agrega Ingresa.pe a tu inicio
          </p>
          <p className="text-slate-400 font-bold text-[12px] mt-0.5">
            Accede más rápido y practica sin conexión.
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-slate-100 text-primary-500 flex items-center justify-center shrink-0">
          <Download size={18} strokeWidth={3} />
        </div>
      </button>
    </div>
  );
}
