'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import {
  Dna, Calculator, BookA, Zap, FlaskConical,
} from 'lucide-react';

// TODO: Import from @ingresa-pe/domain once types are wired
type CourseStatus = 'completed' | 'available' | 'locked';

interface CourseData {
  id: string;
  name: string;
  area: string;
  progress: number;
  colorHex: string;
  bgTint: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; className?: string }>;
  message: string;
  status: CourseStatus;
}

const coursesData: CourseData[] = [
  {
    id: 'bio',
    name: 'Biología',
    area: 'Ciencias',
    progress: 100,
    colorHex: '#58cc02',
    bgTint: '#f1fcdb',
    icon: Dna,
    message: '¡La célula te espera! Vamos a descubrirla.',
    status: 'completed',
  },
  {
    id: 'alg',
    name: 'Álgebra',
    area: 'Matemáticas',
    progress: 64,
    colorHex: '#1cb0f6',
    bgTint: '#ddf4ff',
    icon: Calculator,
    message: '¡Es hora de despejar la X de una vez por todas!',
    status: 'available',
  },
  {
    id: 'rv',
    name: 'Raz. Verbal',
    area: 'Letras',
    progress: 15,
    colorHex: '#ce82ff',
    bgTint: '#f8eaff',
    icon: BookA,
    message: 'Mejoremos esa comprensión lectora paso a paso.',
    status: 'available',
  },
  {
    id: 'fis',
    name: 'Física',
    area: 'Ciencias',
    progress: 0,
    colorHex: '#ff9600',
    bgTint: '#fff2e0',
    icon: Zap,
    message: '¡Domina las leyes del universo hoy mismo!',
    status: 'available',
  },
  {
    id: 'qui',
    name: 'Química',
    area: 'Ciencias',
    progress: 0,
    colorHex: '#afafaf',
    bgTint: '#f0f0f0',
    icon: FlaskConical,
    message: 'Desbloquea este curso avanzando en los demás.',
    status: 'locked',
  },
];

export default function CursosPage() {
  const router = useRouter();
  const [activeCourseId, setActiveCourseId] = useState('alg');
  const activeCourse = coursesData.find((c) => c.id === activeCourseId);

  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
      {/* Main scrollable content */}
      <div className="flex-1 p-5 pb-6">
        {/* Title */}
        <h2 className="font-black text-[32px] leading-[1.15] mb-8 text-center tracking-tight">
          <span className="text-duo-dark">¿Qué quieres</span>
          <br />
          <span className="text-error-500">aprender hoy?</span>
        </h2>

        {/* Course List */}
        <div className="flex flex-col gap-6">
          {coursesData.map((course) => {
            const isSelected = activeCourseId === course.id;
            const isLocked = course.status === 'locked';
            const Icon = course.icon;

            return (
              <motion.div
                key={course.id}
                layout
                onClick={() => !isLocked && setActiveCourseId(course.id)}
                className={`w-full rounded-2xl border-2 border-duo-border border-b-[5px] flex flex-col overflow-hidden cursor-pointer transition-colors
                  ${isLocked ? 'opacity-60 grayscale-[0.5]' : 'bg-white'}`}
              >
                {/* Expanded section (selected only) */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative w-full overflow-hidden"
                      style={{ backgroundColor: course.bgTint }}
                    >
                      <div className="pt-6 px-5 pb-2 relative min-h-[145px] flex items-start">
                        <div className="duo-bubble w-[75%] relative z-10">
                          {course.message}
                        </div>
                        <div className="absolute -bottom-3 -right-2 w-28 h-28 flex items-center justify-center rotate-[-5deg]">
                          <Icon size={100} color={course.colorHex} strokeWidth={1.5} className="drop-shadow-sm opacity-90" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Base card */}
                <div className={`p-5 bg-white relative z-20 ${isSelected ? 'border-t-2 border-duo-border' : ''}`}>
                  {course.progress === 100 && (
                    <div className="absolute inset-0 duo-sheen pointer-events-none rounded-b-xl z-0" />
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="font-black text-[22px] text-duo-dark leading-none">
                        {course.name}
                      </h3>
                      <span
                        className="font-extrabold text-[11px] uppercase tracking-widest"
                        style={{ color: isSelected ? course.colorHex : '#1cb0f6' }}
                      >
                        {course.area} • {isSelected ? 'SELECCIONADO' : 'ELEGIR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-[18px] flex-1 bg-duo-border rounded-full overflow-hidden relative">
                        {course.progress > 0 && (
                          <div
                            className="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 flex items-center justify-center"
                            style={{ width: `${course.progress}%`, backgroundColor: course.colorHex }}
                          >
                            <div className="absolute top-[3px] left-2 right-2 h-[4px] bg-white/30 rounded-full" />
                            <span className="text-[11px] font-black text-black/30 mix-blend-color-burn tracking-widest mt-0.5">
                              {course.progress} %
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center justify-center w-8">
                        <Trophy
                          size={32}
                          color={course.progress === 100 ? course.colorHex : '#e5e5e5'}
                          fill={course.progress === 100 ? course.colorHex : 'none'}
                          strokeWidth={course.progress === 100 ? 1 : 2.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Continue Button */}
      <div className="sticky bottom-0 bg-white border-t-2 border-duo-border px-4 py-4 z-30">
        <button          onClick={() => router.push('/dashboard')}          className="w-full text-white font-black text-[16px] uppercase tracking-widest py-3.5 rounded-2xl border-b-[5px] active:border-b-0 active:translate-y-[5px] transition-all flex justify-center items-center gap-2"
          style={{
            backgroundColor: activeCourse?.colorHex || '#1cb0f6',
            borderColor: 'rgba(0,0,0,0.15)',
          }}
        >
          CONTINUAR
        </button>
      </div>
    </main>
  );
}
