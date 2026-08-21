'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { Button3D } from '../../../components/ui/Button3D';
import { AuthGuard } from '../../../components/auth/AuthGuard';

export default function PendingPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="w-full max-w-md mx-auto relative flex flex-col min-h-[100dvh] bg-[#0a0f2c] overflow-hidden text-center selection:bg-cyan-500/30 font-sans">
        
        {/* Animated Background Rays */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111b47] to-[#0a0f2c]" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-[150%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_45deg,#3b82f6_45deg_90deg,transparent_90deg_135deg,#d946ef_135deg_180deg,transparent_180deg_225deg,#3b82f6_225deg_270deg,transparent_270deg_315deg,#d946ef_315deg_360deg)] opacity-30 mix-blend-screen blur-[50px]"
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          
          {/* Neon Floating Icon */}
          <div className="relative mb-10 mt-10">
            {/* Outer Rings */}
            <div className="absolute inset-[-20px] rounded-full border-2 border-cyan-500/30 border-t-cyan-400/80 animate-[spin_4s_linear_infinite]" />
            <div className="absolute inset-[-40px] rounded-full border border-purple-500/20 border-l-purple-400/80 animate-[spin_8s_linear_infinite_reverse]" />
            
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-full blur-[25px]"
            />
            
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative w-32 h-32 bg-[#18183b] rounded-full flex items-center justify-center border-4 border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.5)] z-10"
            >
              <Check size={56} className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,1)]" strokeWidth={4} />
            </motion.div>
            
            {/* Floating Stars */}
            <svg className="absolute -top-6 -right-6 w-8 h-8 text-white animate-bounce drop-shadow-[0_0_10px_rgba(255,255,255,1)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <svg className="absolute bottom-0 -left-8 w-6 h-6 text-white animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,1)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </div>

          <h1 className="font-black text-[32px] text-white leading-[1.1] mb-5">
            ¡Activación en <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              proceso!
            </span>
          </h1>
          
          <p className="font-bold text-[15px] text-indigo-200/90 leading-relaxed mb-10 max-w-[280px]">
            Hemos recibido tu comprobante. Tu cuenta SUPER se activará en breve y te lo notificaremos en la plataforma.
          </p>

          <div className="w-full bg-[#18183b] rounded-2xl p-5 border-2 border-slate-700/50 shadow-lg mb-12 flex items-start gap-4 text-left">
            <div className="shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-cyan-400" strokeWidth={2.5} />
            </div>
            <p className="text-[12px] font-bold text-indigo-300 leading-relaxed pt-0.5">
              Puedes cerrar esta pantalla y seguir practicando tranquilamente. Verás una insignia brillante en tu perfil cuando tu plan esté activo.
            </p>
          </div>

          <div className="w-full px-4">
            <Button3D 
              variant="neon" 
              className="w-full !py-4 text-[16px]"
              onClick={() => router.push('/dashboard')}
            >
              VOLVER AL INICIO
            </Button3D>
          </div>
          
        </div>
      </div>
    </AuthGuard>
  );
}
