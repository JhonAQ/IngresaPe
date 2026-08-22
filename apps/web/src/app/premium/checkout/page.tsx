'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Upload, CheckCircle2, Copy, Image as ImageIcon } from 'lucide-react';
import { Button3D } from '../../../components/ui/Button3D';
import { AuthGuard } from '../../../components/auth/AuthGuard';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'ANNUAL';

  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAnnual = plan === 'ANNUAL';
  const price = isAnnual ? 'S/ 59.90' : 'S/ 9.90';
  const planName = isAnnual ? 'Cachimbo Super (Anual)' : 'Dino Super (Mensual)';

  const handleCopy = () => {
    navigator.clipboard.writeText('987654321');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    setIsSubmitting(true);
    
    // Simular subida al servidor y redirección
    setTimeout(() => {
      router.push('/premium/pending');
    }, 1500);
  };

  return (
    <AuthGuard>
      <div className="w-full max-w-md mx-auto relative flex flex-col min-h-[100dvh] bg-[#0a0f2c] font-sans">
        
        {/* Header */}
        <div className="sticky top-0 z-50 flex items-center p-5 bg-[#0a0f2c]/90 backdrop-blur-md border-b border-white/5">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-white font-black text-[16px] tracking-wide">CONFIRMAR PAGO</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto hide-scrollbar pb-32">
          
          {/* Order Summary */}
          <div className="bg-[#18183b] border-2 border-slate-700 rounded-2xl p-4 mb-6">
            <p className="text-indigo-300 font-bold text-[11px] uppercase tracking-widest mb-1">Tu plan</p>
            <div className="flex justify-between items-end">
              <h2 className="text-white font-black text-[18px]">{planName}</h2>
              <span className="text-[#22d3ee] font-black text-[20px]">{price}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 mb-6 text-center relative overflow-hidden">
             {/* Glow effect */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-400/20 blur-[30px] rounded-full pointer-events-none" />
             
             <h3 className="text-white font-black text-[16px] mb-2">Paso 1: Yapea a este QR o número</h3>
             <p className="text-indigo-200 text-[13px] font-bold mb-4">A nombre de Jhonatan Arias / Ingresa.pe</p>
             
             {/* QR Code */}
             <div className="bg-white p-3 rounded-2xl w-40 h-40 mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <img src="/qr.png" alt="Yape QR" className="w-full h-full object-contain" />
             </div>

             <div className="flex items-center justify-center gap-2">
                <span className="text-white font-black text-[24px] tracking-widest">987 654 321</span>
                <button 
                  onClick={handleCopy}
                  className={`p-2 rounded-xl transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-indigo-300 hover:bg-white/20'}`}
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
             </div>
          </div>

          {/* Verification Form */}
          <div className="mb-2">
            <h3 className="text-white font-black text-[16px] mb-1">Paso 2: Verifica tu pago</h3>
            <p className="text-indigo-300 text-[12px] font-bold mb-4">Sube la captura de pantalla de tu transferencia Yape.</p>
          </div>

          <div className="space-y-4">
            {/* Upload Voucher */}
            <div>
              <label className="flex items-center gap-1.5 text-indigo-200 font-bold text-[12px] mb-2 uppercase tracking-wide">
                <ImageIcon size={14} className="text-cyan-400" />
                Captura del Voucher
              </label>
              
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  preview 
                    ? 'border-cyan-400 bg-cyan-400/5 p-2' 
                    : 'border-slate-700 bg-white/5 p-8 hover:bg-white/10 hover:border-slate-500'
                }`}
              >
                {preview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-black/20">
                     <img src={preview} alt="Voucher" className="w-full h-full object-contain" />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-[12px] bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Cambiar imagen</span>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                      <Upload size={24} className="text-indigo-300" />
                    </div>
                    <span className="text-white font-black text-[14px] mb-1">Subir captura</span>
                    <span className="text-indigo-300 font-bold text-[11px]">JPG, PNG</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto p-5 bg-[#0a0f2c] border-t border-white/5 z-50">
          <Button3D 
            variant={file ? "neon" : "locked"}
            className="!py-4 text-[16px] w-full"
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
          >
            {isSubmitting ? 'ENVIANDO...' : 'ENVIAR COMPROBANTE'}
          </Button3D>
        </div>

      </div>
    </AuthGuard>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] bg-[#0a0f2c] items-center justify-center text-white font-bold">Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
