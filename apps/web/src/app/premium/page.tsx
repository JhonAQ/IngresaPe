'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, CheckCircle2, Zap, Target, BookOpen, Crown } from 'lucide-react';
import { Button3D } from '../../components/ui/Button3D';
import { AuthGuard } from '../../components/auth/AuthGuard';

const NeonIcon = ({ icon: Icon, gradient }: { icon: any, gradient: string }) => (
  <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0`}>
    <div className={`absolute inset-0 rounded-2xl opacity-20 ${gradient}`} />
    <Icon size={24} className={`relative z-10`} style={{ stroke: 'url(#neon-grad)' }} />
    <svg width="0" height="0">
      <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#22d3ee" offset="0%" />
        <stop stopColor="#d946ef" offset="100%" />
      </linearGradient>
    </svg>
  </div>
);

const FeatureRow = ({ title, description }: { title: string, description: string }) => (
  <div className="flex gap-4 items-center mb-6">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 p-[2px] shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
      <div className="w-full h-full bg-[#0a0f2c] rounded-[14px] flex items-center justify-center">
         <Crown size={22} className="text-cyan-300" strokeWidth={2.5} />
      </div>
    </div>
    <div>
      <h3 className="font-black text-white text-[16px] leading-tight mb-1">{title}</h3>
      <p className="text-indigo-200/80 font-bold text-[13px] leading-snug">{description}</p>
    </div>
  </div>
);

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');

  return (
    <AuthGuard>
      <div className="w-full max-w-md mx-auto relative flex flex-col min-h-[100dvh] bg-[#0a0f2c] overflow-y-auto hide-scrollbar font-sans selection:bg-cyan-500/30">
        
        {/* Header - Close */}
        <div className="sticky top-0 z-50 flex items-center justify-between p-5 bg-[#0a0f2c]/90 backdrop-blur-md">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-1">
             <span className="text-white font-black italic tracking-widest text-lg">SUPER</span>
             <span className="text-cyan-400 font-black tracking-tighter text-lg">PRO</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col pb-40">
          
          {/* Hero Section */}
          <div className="px-6 pt-4 pb-12 flex flex-col items-center text-center relative z-10">
            <motion.div 
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative w-40 h-40 mb-8 flex justify-center items-center"
            >
              {/* Outer Glowing Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400/60 animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-3 rounded-full border-2 border-purple-500/20 border-l-purple-400/60 animate-[spin_12s_linear_infinite_reverse]" />
              
              {/* Core Glow */}
              <div className="absolute inset-8 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-[25px] opacity-70" />
              
              {/* Center Floating Orbs */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#18183b] to-[#0a0f2c] rounded-full border-2 border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center justify-center">
                 <Crown size={48} className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" fill="currentColor" strokeWidth={1.5} />
              </div>

              {/* Orbital particles */}
              <div className="absolute -top-2 right-4 w-4 h-4 bg-purple-400 rounded-full blur-[2px] animate-pulse" />
              <div className="absolute bottom-4 -left-2 w-3 h-3 bg-cyan-400 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* SVG Sparkles */}
              <svg className="absolute top-0 -left-4 w-8 h-8 text-white animate-bounce drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <svg className="absolute bottom-2 -right-6 w-6 h-6 text-white animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
            </motion.div>
            
            <h1 className="font-black text-[26px] text-white leading-[1.2] mb-3">
              Comienza con Super<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
                y asegura tu vacante
              </span>
            </h1>
          </div>

          {/* Pricing Cards */}
          <div className="px-5 space-y-4 mb-10 relative z-10">
            
            {/* Plan Anual (Destacado) */}
            <motion.div 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan('ANNUAL')}
              className={`relative cursor-pointer transition-all duration-300 ${
                selectedPlan === 'ANNUAL' ? 'scale-100 opacity-100' : 'scale-95 opacity-70 hover:opacity-100'
              }`}
            >
              {selectedPlan === 'ANNUAL' && (
                <div className="absolute -top-3 left-4 bg-[#22d3ee] text-[#0a0f2c] font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-md z-20 shadow-md">
                  Mejor Valor
                </div>
              )}
              
              <div className={`p-[3px] rounded-2xl ${selectedPlan === 'ANNUAL' ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500' : 'bg-transparent'}`}>
                <div className={`bg-[#18183b] rounded-[14px] p-5 relative overflow-hidden ${selectedPlan !== 'ANNUAL' ? 'border-2 border-slate-700' : ''}`}>
                  
                  {selectedPlan === 'ANNUAL' && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center z-10 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                       <CheckCircle2 size={16} className="text-[#0a0f2c]" strokeWidth={4} />
                    </div>
                  )}

                  <div className="flex justify-between items-center pr-10">
                    <div>
                      <h3 className="font-black text-white text-[18px]">Cachimbo Super</h3>
                      <p className="font-bold text-indigo-300 text-[13px] mt-1">12 meses • S/ 59.90</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white text-[16px]">S/ 4.90 <span className="text-[12px] text-indigo-300">/ mes</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Plan Mensual */}
            <motion.div 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan('MONTHLY')}
              className={`relative cursor-pointer transition-all duration-300 ${
                selectedPlan === 'MONTHLY' ? 'scale-100 opacity-100' : 'scale-95 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`p-[3px] rounded-2xl ${selectedPlan === 'MONTHLY' ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500' : 'bg-transparent'}`}>
                <div className={`bg-[#18183b] rounded-[14px] p-5 relative overflow-hidden ${selectedPlan !== 'MONTHLY' ? 'border-2 border-slate-700' : ''}`}>
                  
                  {selectedPlan === 'MONTHLY' && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center z-10 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                       <CheckCircle2 size={16} className="text-[#0a0f2c]" strokeWidth={4} />
                    </div>
                  )}

                  <div className="flex justify-between items-center pr-10">
                    <div>
                      <h3 className="font-black text-white text-[18px]">Dino Super</h3>
                      <p className="font-bold text-indigo-300 text-[13px] mt-1">Tu academia al precio de un menú</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white text-[16px]">S/ 9.90 <span className="text-[12px] text-indigo-300">/ mes</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Features List */}
          <div className="px-8 flex-1 mt-4">
             <FeatureRow title="Energía Ilimitada" description="Estudia sin pausas. Sin esperar recargas." />
             <FeatureRow title="Simulacros IA" description="Genera exámenes personalizados ilimitados." />
             <FeatureRow title="Archivo Histórico" description="Acceso a más de 50 exámenes de admisión UNSA." />
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto p-5 bg-[#0a0f2c] border-t border-white/5 z-50">
          <Button3D 
            variant="neon" 
            className="!py-4 text-[16px]"
            onClick={() => router.push(`/premium/checkout?plan=${selectedPlan}`)}
          >
            COMENZAR AHORA
          </Button3D>
          <div className="text-center mt-3">
             <span className="text-[11px] font-bold text-indigo-400/50 uppercase tracking-widest">Pago único con Yape/Plin</span>
          </div>
        </div>

      </div>
    </AuthGuard>
  );
}
