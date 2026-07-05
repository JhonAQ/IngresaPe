'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Gem, Crown, Zap, Heart } from 'lucide-react';

export default function ShopPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] flex flex-col bg-white border-x border-slate-100">
      <header className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2">
          <Gem size={22} className="text-[#1cb0f6]" strokeWidth={2.5} />
          <h1 className="font-black text-[20px] text-slate-800">Tienda</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        <section className="bg-gradient-to-br from-[#ce82ff] to-[#a855f7] rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Crown size={32} className="fill-white" />
            <div>
              <h2 className="font-black text-[20px]">Ingresa Premium</h2>
              <p className="font-bold text-white/90 text-sm">Energía ilimitada + IA ilimitada</p>
            </div>
          </div>
          <button className="w-full bg-white text-[#a855f7] font-black text-[15px] uppercase tracking-widest py-3 rounded-2xl border-b-[4px] border-slate-200 active:border-b-0 active:translate-y-[4px] transition-all">
            Ver planes
          </button>
        </section>

        <section className="space-y-3">
          <h3 className="font-black text-slate-700 text-[16px]">Gemas</h3>
          {[
            { amount: 500, price: 'S/ 4.90', popular: false },
            { amount: 1200, price: 'S/ 9.90', popular: true },
            { amount: 3000, price: 'S/ 19.90', popular: false },
          ].map((pack) => (
            <div
              key={pack.amount}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                pack.popular ? 'border-[#1cb0f6] bg-[#ddf4ff]' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Gem size={24} className="text-[#1cb0f6]" strokeWidth={2.5} />
                <span className="font-black text-slate-700 text-[18px]">{pack.amount}</span>
              </div>
              <button className="bg-[#1cb0f6] text-white font-black text-[14px] px-4 py-2 rounded-xl border-b-[3px] border-[#1899d6] active:border-b-0 active:translate-y-[3px] transition-all">
                {pack.price}
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h3 className="font-black text-slate-700 text-[16px]">Potenciadores</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 bg-white active:scale-95 transition-transform">
              <Heart size={28} className="text-[#ff4b4b]" strokeWidth={2.5} />
              <span className="font-black text-slate-700 text-sm">+5 Vidas</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 bg-white active:scale-95 transition-transform">
              <Zap size={28} className="text-[#ffc800]" strokeWidth={2.5} />
              <span className="font-black text-slate-700 text-sm">Energía x2</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
