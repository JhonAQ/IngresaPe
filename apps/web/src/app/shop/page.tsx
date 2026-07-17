'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Gem,
  Crown,
  Zap,
  Heart,
  Sparkles,
  ShoppingBag,
  Flame,
  Star,
} from 'lucide-react';
import { Card3D, Button3D, GemIcon } from '@ingresa-pe/ui';
import { useAuth } from '../../hooks/useAuth';

const gemPacks = [
  { amount: 500, price: 'S/ 4.90', popular: false, discount: null },
  { amount: 1200, price: 'S/ 9.90', popular: true, discount: '20% OFF' },
  { amount: 3000, price: 'S/ 19.90', popular: false, discount: '35% OFF' },
];

const powerUps = [
  {
    id: 'lives',
    name: '+5 Vidas',
    description: 'Recupera todas tus vidas al instante.',
    price: '150 gemas',
    icon: Heart,
    color: '#ff4b4b',
    bg: 'bg-red-50',
  },
  {
    id: 'energy',
    name: 'Energía x2',
    description: 'Duplica la energía ganada por 1 hora.',
    price: '300 gemas',
    icon: Zap,
    color: '#ffc800',
    bg: 'bg-yellow-50',
  },
  {
    id: 'streak',
    name: 'Escudo de racha',
    description: 'Protege tu racha si pierdes un día.',
    price: '500 gemas',
    icon: Flame,
    color: '#ff9600',
    bg: 'bg-orange-50',
  },
];

const premiumBenefits = [
  { icon: Zap, text: 'Energía ilimitada' },
  { icon: Sparkles, text: 'Explicaciones con IA sin límites' },
  { icon: Star, text: 'Doble de monedas en cada lección' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ShopPage() {
  const router = useRouter();
  const { user } = useAuth();
  const gemBalance = user?.coins ?? 0;

  return (
    <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col bg-[#f7f7f7] border-x border-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} className="text-[#1cb0f6]" strokeWidth={2.5} />
            <h1 className="font-black text-[22px] text-slate-800 tracking-tight">Tienda</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#ddf4ff] px-3 py-1.5 rounded-full border-2 border-[#84d8ff]">
          <GemIcon className="w-5 h-5" />
          <span className="font-black text-[#1cb0f6] text-[16px]">{gemBalance}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-7">
        {/* Premium Banner */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#ce82ff] via-[#a855f7] to-[#7c3aed] p-6 text-white shadow-[0_10px_30px_rgba(168,85,247,0.35)] border-b-[6px] border-[#6d28d9]"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ffc800]/20 rounded-full blur-2xl -ml-5 -mb-5 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                >
                  <Crown size={32} className="fill-[#ffc800] text-[#ffc800]" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h2 className="font-black text-[22px] leading-none">Ingresa Premium</h2>
                  <p className="font-bold text-white/90 text-[13px] mt-1">La experiencia completa</p>
                </div>
              </div>
              <span className="bg-[#ffc800] text-[#7c3aed] font-black text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                Mejor valor
              </span>
            </div>

            <div className="space-y-2 mb-5">
              {premiumBenefits.map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <benefit.icon size={14} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="font-bold text-[14px] text-white/95">{benefit.text}</span>
                </div>
              ))}
            </div>

            <Button3D
              variant="warning"
              size="md"
              fullWidth
              className="font-black uppercase tracking-widest text-[15px]"
              onClick={() => alert('Planes premium próximamente 🚀')}
            >
              Ver planes
            </Button3D>
          </div>
        </motion.section>

        {/* Gemas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-700 text-[18px] flex items-center gap-2">
              <Gem size={22} className="text-[#1cb0f6]" strokeWidth={2.5} />
              Gemas
            </h3>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              Más vendidos
            </span>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {gemPacks.map((pack) => (
              <motion.div key={pack.amount} variants={itemVariants}>
                <Card3D
                  variant={pack.popular ? 'primary' : 'surface'}
                  padding="sm"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pack.popular ? 'bg-white/20' : 'bg-[#ddf4ff]'}`}>
                      <GemIcon className={`w-7 h-7 ${pack.popular ? 'text-white' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-[20px] ${pack.popular ? 'text-white' : 'text-slate-700'}`}>
                          {pack.amount.toLocaleString()}
                        </span>
                        {pack.discount && (
                          <span className="bg-[#ffc800] text-[#7c3aed] font-black text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                            {pack.discount}
                          </span>
                        )}
                      </div>
                      <span className={`font-bold text-[13px] ${pack.popular ? 'text-white/80' : 'text-slate-400'}`}>
                        +{Math.round(pack.amount * 0.1)} de regalo
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Pack de ${pack.amount} gemas - próximamente 💎`)}
                    className={`font-black text-[14px] px-5 py-2.5 rounded-xl border-b-[4px] active:border-b-0 active:translate-y-[4px] transition-all ${
                      pack.popular
                        ? 'bg-white text-[#a855f7] border-slate-200'
                        : 'bg-[#1cb0f6] text-white border-[#1899d6]'
                    }`}
                  >
                    {pack.price}
                  </button>
                </Card3D>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Potenciadores */}
        <section className="space-y-4">
          <h3 className="font-black text-slate-700 text-[18px] flex items-center gap-2">
            <Zap size={22} className="text-[#ffc800]" strokeWidth={2.5} />
            Potenciadores
          </h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-3"
          >
            {powerUps.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Card3D variant="surface" padding="sm" className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.bg}`}
                  >
                    <item.icon size={28} style={{ color: item.color }} strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-700 text-[16px]">{item.name}</h4>
                    <p className="font-bold text-slate-400 text-[13px] leading-snug">{item.description}</p>
                  </div>

                  <button
                    onClick={() => alert(`${item.name} - próximamente ⚡`)}
                    className="shrink-0 font-black text-[13px] px-4 py-2 rounded-xl bg-slate-100 text-slate-600 border-b-[4px] border-slate-200 active:border-b-0 active:translate-y-[4px] transition-all"
                  >
                    {item.price}
                  </button>
                </Card3D>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Footer info */}
        <div className="text-center pt-2 pb-6">
          <p className="text-slate-400 font-bold text-[12px]">
            Las compras se guardan en tu cuenta.
          </p>
          <p className="text-slate-300 font-bold text-[11px] mt-1">
            No son reembolsables.
          </p>
        </div>
      </main>
    </div>
  );
}
