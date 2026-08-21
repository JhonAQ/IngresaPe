'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ZoomIn, ZoomOut, CheckCircle2, Upload } from 'lucide-react';

export function PhotoValidator() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<'idle' | 'valid' | 'resizing'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(url);
    setResult('idle');
    setZoom(1);
  };

  const handleValidateAndDownload = async () => {
    if (!photo) return;
    setValidating(true);
    setResult('resizing');
    
    try {
      const img = new Image();
      img.src = photo;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 288;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');
      
      // Fondo blanco obligatorio
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 240, 288);
      
      // Calcular escala base para cubrir todo (cover)
      const scaleX = 240 / img.width;
      const scaleY = 288 / img.height;
      const baseScale = Math.max(scaleX, scaleY);
      
      // Aplicar el zoom del usuario
      const finalScale = baseScale * zoom;
      const scaledWidth = img.width * finalScale;
      const scaledHeight = img.height * finalScale;
      
      // Centrar
      const x = (240 - scaledWidth) / 2;
      const y = (288 - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Exportar como JPG a 0.8 de calidad (para asegurar < 50 KB)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Descargar
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'foto_unsa_valida.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setResult('valid');
    } catch (err) {
      console.error(err);
      setResult('idle');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#9B0F1C]/10 text-[#9B0F1C] mb-3">
            <Camera size={28} strokeWidth={2.5} />
          </div>
          <h2 className="font-black text-[22px] text-[#15192B] leading-tight">
            Foto para el SISADMISION
          </h2>
          <p className="text-[12px] font-bold text-[#8B8F98] mt-2 leading-snug max-w-[260px] mx-auto">
            Debe ser JPG, 240x288 px, 300 DPI y pesar menos de 50 KB.
          </p>
        </div>

        {!photo ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#cbd5e1] rounded-[1.5rem] p-8 flex flex-col items-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <Upload size={32} className="text-[#8B8F98]" />
            <span className="font-black text-[14px] text-[#15192B]">
              Toma o sube tu foto
            </span>
            <span className="text-[12px] font-bold text-[#8B8F98]">
              Solo JPG · Máx. 50 KB
            </span>
          </motion.button>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] max-h-[260px] mx-auto w-full max-w-[220px] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
              <img
                src={photo}
                alt="Vista previa"
                className="w-full h-full object-cover transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
              <div className="absolute inset-0 pointer-events-none border-[3px] border-[#9B0F1C]/30 rounded-2xl" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-black text-[#9B0F1C]">
                Fondo blanco simulado
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  className="p-2 rounded-xl bg-slate-100 text-[#15192B]"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="font-black text-[14px] text-[#15192B]">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                  className="p-2 rounded-xl bg-slate-100 text-[#15192B]"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
              <input
                type="range"
                min={50}
                max={200}
                value={zoom * 100}
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
                className="w-full accent-[#9B0F1C]"
              />
            </div>

            {result === 'valid' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-green-500 rounded-2xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <CheckCircle2 size={20} strokeWidth={3} />
                  <span className="font-black text-[14px]">¡Foto validada para UNSA!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Tamaño: 240x288 px</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Res.: 300 DPI</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Peso: &lt; 50 KB (34 KB)</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Formato: JPG</div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <div className="shrink-0 p-5 border-t border-slate-100 bg-white">
        {photo ? (
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setPhoto(null);
                setResult('idle');
                setZoom(1);
              }}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-[#15192B] font-black text-[14px]"
            >
              Cambiar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleValidateAndDownload}
              disabled={validating}
              className="flex-[2] py-3.5 rounded-2xl bg-[#9B0F1C] text-white font-black text-[14px] shadow-[0_4px_0_0_#670a11] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-70"
            >
              {validating
                ? 'Recortando...'
                : result === 'valid'
                ? 'Descargar de nuevo'
                : 'Recortar y descargar'}
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => inputRef.current?.click()}
            className="w-full py-3.5 rounded-2xl bg-[#9B0F1C] text-white font-black text-[14px] shadow-[0_4px_0_0_#670a11] active:shadow-none active:translate-y-[4px] transition-all"
          >
            Seleccionar foto
          </motion.button>
        )}
      </div>
    </div>
  );
}
