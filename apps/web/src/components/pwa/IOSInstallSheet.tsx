'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusCircle, Home, X } from 'lucide-react';
import { useInstallPrompt } from './InstallPromptContext';
import { AppIconHero } from './AppIconHero';

export function IOSInstallSheet() {
  const { showIOSInstructions, closeIOSInstructions } = useInstallPrompt();
  const [mounted, setMounted] = useState(false);
  const [startY, setStartY] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [pointerId, setPointerId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showIOSInstructions) {
      setDragY(0);
      setIsDragging(false);
      setPointerId(null);
    }
  }, [showIOSInstructions]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.currentTarget;
    target.setPointerCapture?.(e.pointerId);
    setStartY(e.clientY);
    setPointerId(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerId !== pointerId) return;
    const diff = e.clientY - startY;
    if (diff > 0) setDragY(diff);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerId !== pointerId) return;
    setIsDragging(false);
    setPointerId(null);
    if (dragY > 120) {
      closeIOSInstructions();
    } else {
      setDragY(0);
    }
  };

  const sheet = (
    <AnimatePresence>
      {showIOSInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200]"
        >
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeIOSInstructions}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-w-md mx-auto"
            style={{
              transform: `translateY(${isDragging ? dragY : 0}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              maxHeight: '85vh',
            }}
          >
            {/* Header */}
            <div
              className="shrink-0 cursor-grab active:cursor-grabbing touch-none bg-gradient-to-b from-[#f3e8ff] to-white z-20"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
              </div>

              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AppIconHero size={48} showRing={false} />
                  <div>
                    <h2 className="text-xl font-black text-slate-800">
                      Agregar a Inicio
                    </h2>
                    <p className="text-slate-500 font-bold text-[12px]">
                      Instala Ingresa.pe en 3 pasos
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeIOSInstructions}
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="px-6 pb-8 space-y-4 overflow-y-auto">
              <Step
                number={1}
                icon={Share}
                color="purple"
                title="Toca Compartir"
                description="Presiona el ícono de compartir en la barra de Safari."
              />

              <Step
                number={2}
                icon={PlusCircle}
                color="blue"
                title="Agregar a Inicio"
                description="Desplaza el menú y selecciona 'Agregar a Inicio'."
              />

              <Step
                number={3}
                icon={Home}
                color="green"
                title="Confirma"
                description="Toca 'Agregar'. ¡Listo! Practica desde tu pantalla de inicio."
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(sheet, document.body);
}

function Step({
  number,
  icon: Icon,
  color,
  title,
  description,
}: {
  number: number;
  icon: React.ElementType;
  color: 'purple' | 'blue' | 'green';
  title: string;
  description: string;
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
      <div className={`w-12 h-12 rounded-2xl ${colorClasses[color]} flex items-center justify-center shrink-0 font-black text-[18px] shadow-sm`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-black text-[10px]">
            {number}
          </span>
          <h3 className="font-black text-slate-800 text-[15px]">{title}</h3>
        </div>
        <p className="text-slate-500 font-bold text-[12px] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
