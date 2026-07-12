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

  const handleValidate = () => {
    setValidating(true);
    setResult('resizing');
    setTimeout(() => {
      setValidating(false);
      setResult('valid');
    }, 1400);
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
          <p className="text-[13px] font-bold text-[#8B8F98] mt-1">
            Fondo blanco, rostro centrado, sin accesorios.
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
              JPG o PNG · Máx. 2 MB
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
                className="bg-success-500 text-white rounded-2xl p-4 flex items-start gap-3"
              >
                <CheckCircle2 size={22} className="shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-[14px]">
                    Foto lista para subir
                  </span>
                  <span className="block text-[12px] font-bold opacity-90">
                    Tamaño: 531×531 px · Peso: 187 KB
                  </span>
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
              onClick={handleValidate}
              disabled={validating}
              className="flex-[2] py-3.5 rounded-2xl bg-[#9B0F1C] text-white font-black text-[14px] shadow-[0_4px_0_0_#670a11] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-70"
            >
              {validating
                ? 'Recortando…'
                : result === 'valid'
                ? 'Volver a validar'
                : 'Validar y recortar'}
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
