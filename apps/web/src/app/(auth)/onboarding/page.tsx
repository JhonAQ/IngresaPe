'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Check, 
  Cpu, Users, HeartPulse, Target, School, ChevronLeft
} from 'lucide-react';
import { Button3D } from '../../../components/ui/Button3D';
import { CAREERS } from '../../../components/news/data';

// --- ANIMACIONES COMPARTIDAS ---
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 300 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 25, stiffness: 350 } },
  exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0, transition: { duration: 0.2 } })
};

// --- DATA ---
type Area = 'INGENIERIAS' | 'SOCIALES' | 'BIOMEDICAS';
const areaOrder: Area[] = ['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS'];
const areaLabels: Record<Area, string> = { INGENIERIAS: 'Ingenierías', SOCIALES: 'Sociales', BIOMEDICAS: 'Biomédicas' };
const areaConfig: Record<Area, { icon: React.ElementType; color: string; bg: string; border: string; shadow: string; text: string }> = {
  INGENIERIAS: { icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', shadow: 'border-b-blue-300', text: 'text-blue-600' },
  SOCIALES: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', shadow: 'border-b-purple-300', text: 'text-purple-600' },
  BIOMEDICAS: { icon: HeartPulse, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', shadow: 'border-b-green-300', text: 'text-green-600' },
};

const ACADEMIES = [
  { id: 'briceno', name: 'Briceño', icon: '🏰' },
  { id: 'fleming', name: 'Fleming', icon: '🔬' },
  { id: 'bryce', name: 'Bryce', icon: '🦅' },
  { id: 'kelsen', name: 'Kelsen', icon: '⚖️' },
  { id: 'mendel', name: 'Mendel', icon: '🧬' },
  { id: 'secundaria', name: 'Colegio', icon: '🎒' },
  { id: 'otro', name: 'Otra', icon: '🏢' },
  { id: 'ninguna', name: 'Ninguna', icon: '🏠' },
];

export default function OnboardingPage() {
  const router = useRouter();
  
  // Estado del Wizard
  const [[step, direction], setStepInfo] = useState([0, 0]);
  const TOTAL_STEPS = 4;
  
  // Data
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [searchCareer, setSearchCareer] = useState('');
  
  const [score, setScore] = useState<string>('');
  const [noExam, setNoExam] = useState<boolean>(false);
  
  const [academy, setAcademy] = useState<string | null>(null);

  const filteredCareers = useMemo(() => {
    if (!selectedArea) return [];
    const areaName = areaLabels[selectedArea];
    const term = searchCareer.trim().toLowerCase();
    return CAREERS
      .filter((c) => c.area === areaName && c.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedArea, searchCareer]);

  // Manejo de carga (Paso 4: Experiencia Épica)
  const [loadingStep, setLoadingStep] = useState(0);
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    let t4: ReturnType<typeof setTimeout>;
    if (step === 4) {
      t1 = setTimeout(() => setLoadingStep(1), 1500); // 1: "Forjando tu futuro..."
      t2 = setTimeout(() => setLoadingStep(2), 3000); // 2: "Generando simulacros exclusivos..."
      t3 = setTimeout(() => setLoadingStep(3), 4500); // 3: "¡Misión Aprobada!"
      t4 = setTimeout(() => {
        localStorage.setItem('ingresape_onboarded', 'true');
        if (selectedCareer) localStorage.setItem('ingresape_career', selectedCareer);
        router.push('/dashboard');
      }, 5500);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [step, router, selectedCareer]);

  const paginate = (newDirection: number) => setStepInfo([step + newDirection, newDirection]);

  const isStepValid = () => {
    if (step === 1) return selectedCareer !== null;
    if (step === 2) return noExam || (score.length > 0 && Number(score) >= 0);
    if (step === 3) return academy !== null;
    return true;
  };

  const handleBack = () => {
    if (step === 1 && selectedArea) {
      setSelectedArea(null);
      setSelectedCareer(null);
    } else {
      paginate(-1);
    }
  };

  // ==========================================
  // PANTALLAS
  // ==========================================

  const renderWelcome = () => (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col flex-1 items-center justify-center text-center py-12 px-4 h-full relative z-10 min-h-[70vh]">
      <motion.div variants={fadeUp} className="mb-10 mt-8">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white shadow-xl shadow-primary-500/10 flex items-center justify-center mx-auto border-4 border-slate-50 relative overflow-hidden">
          <img src="/icon-512.png" alt="Ingresa.pe" className="w-[85%] h-[85%] object-contain" />
        </div>
      </motion.div>
      <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-black text-slate-800 leading-tight mb-4 tracking-tight">
        Bienvenido a tu<br/>nueva academia.
      </motion.h1>
      <motion.p variants={fadeUp} className="text-[15px] md:text-[17px] font-bold text-slate-500 max-w-[280px] md:max-w-xs mx-auto mb-12 leading-relaxed">
        Personalizaremos tu plan de estudios de forma inteligente para garantizar tu ingreso a la UNSA.
      </motion.p>
      <motion.div variants={fadeUp} className="w-full mt-auto mb-8 max-w-sm mx-auto">
        <Button3D variant="brand" onClick={() => paginate(1)} className="!py-4 text-[16px] w-full">
          EMPEZAR AHORA
        </Button3D>
        <button 
          onClick={() => { localStorage.setItem('ingresape_onboarded', 'true'); router.push('/dashboard'); }} 
          className="mt-6 text-[14px] font-extrabold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
        >
          Ya tengo cuenta
        </button>
      </motion.div>
    </motion.div>
  );

  const renderCareerStep = () => (
    <div className="flex flex-col flex-1 w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[60vh] mt-4 mb-28">
      <AnimatePresence mode="wait">
        {!selectedArea ? (
          <motion.div 
            key="area"
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="flex flex-col flex-1 p-6"
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">¿Qué estudiarás?</h2>
              <p className="text-[14px] font-bold text-slate-500">Primero selecciona tu área académica.</p>
            </div>
            <div className="space-y-4">
              {areaOrder.map(area => {
                const config = areaConfig[area];
                const Icon = config.icon;
                return (
                  <motion.button
                    key={area}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedArea(area)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[1.2rem] border-2 ${config.border} ${config.shadow} border-b-[4px] bg-white active:border-b-2 active:translate-y-[2px] transition-all`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className={`font-black text-[17px] leading-tight ${config.text}`}>
                        {areaLabels[area]}
                      </h3>
                    </div>
                    <div className={`w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
                      <ChevronLeft className="w-5 h-5 rotate-180" strokeWidth={3} />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="career"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            className="flex flex-col flex-1"
          >
            <div className="p-6 pb-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl ${areaConfig[selectedArea].bg} ${areaConfig[selectedArea].color} flex items-center justify-center shadow-sm`}>
                  {React.createElement(areaConfig[selectedArea].icon, { size: 20, strokeWidth: 2.5 })}
                </div>
                <h2 className={`font-black text-2xl leading-tight ${areaConfig[selectedArea].text}`}>
                  {areaLabels[selectedArea]}
                </h2>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchCareer}
                  onChange={(e) => setSearchCareer(e.target.value)}
                  placeholder="Buscar carrera..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 text-[14px] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 p-6 space-y-3">
              {filteredCareers.map((c) => {
                const isSelected = selectedCareer === c.name;
                return (
                  <motion.button
                    key={c.name}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCareer(c.name)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 text-left transition-all ${
                      isSelected 
                      ? `bg-${areaConfig[selectedArea].bg.split('-')[1]}-50 ${areaConfig[selectedArea].border} shadow-sm translate-y-[1px]` 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-black text-[14px] truncate pr-3 ${isSelected ? areaConfig[selectedArea].text : 'text-slate-700'}`}>
                      {c.name}
                    </span>
                    {isSelected && (
                      <div className={`w-6 h-6 rounded-full ${areaConfig[selectedArea].bg} ${areaConfig[selectedArea].color} flex items-center justify-center shrink-0`}>
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderScoreStep = () => (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col flex-1 items-center pt-8 px-6 pb-28">
      <motion.div variants={fadeUp} className="mb-10 text-center w-full">
        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-sm text-primary-500 flex items-center justify-center mx-auto mb-4">
          <Target size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">Puntaje anterior</h2>
        <p className="text-[14px] font-bold text-slate-500 max-w-[260px] mx-auto">Si diste un examen a la UNSA antes, dinos cuánto sacaste.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="relative w-full max-w-[200px] mb-8">
        <input
          type="number"
          value={score}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) setScore(val);
            if (val.length > 0) setNoExam(false);
          }}
          disabled={noExam}
          placeholder="00.00"
          className={`w-full text-center text-5xl font-black h-28 rounded-2xl border-2 transition-all focus:outline-none placeholder:text-slate-200
            ${noExam 
              ? 'bg-slate-50 border-slate-200 text-slate-300' 
              : 'bg-white border-slate-200 text-primary-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm'
            }
          `}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="w-full max-w-[200px]">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setNoExam(!noExam);
            if (!noExam) setScore('');
          }}
          className={`w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 transition-all ${
            noExam 
            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' 
            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
          }`}
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 transition-colors ${noExam ? 'bg-primary-500 border-primary-500' : 'border-slate-300'}`}>
            {noExam && <Check size={14} className="text-white" strokeWidth={4} />}
          </div>
          <span className="font-black text-[14px]">
            Aún no di examen
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderAcademyStep = () => (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col flex-1 pt-8 px-4 sm:px-6 pb-28">
      <motion.div variants={fadeUp} className="mb-8 text-center">
        <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">¿En qué academia estás?</h2>
        <p className="text-[14px] font-bold text-slate-500">Para conocer tu método de estudio actual.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 sm:gap-3">
        {ACADEMIES.map(a => {
          const isSelected = academy === a.id;
          return (
            <motion.button
              key={a.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setAcademy(a.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 border-b-[4px] transition-all relative aspect-square
                ${isSelected 
                  ? 'border-primary-500 border-b-[2px] bg-primary-50 translate-y-[2px]' 
                  : 'border-slate-200 border-b-slate-300 bg-white active:border-b-[2px] active:translate-y-[2px] hover:bg-slate-50'
                }`}
            >
              <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{a.icon}</span>
              <span className={`font-black text-[11px] sm:text-xs text-center leading-tight ${isSelected ? 'text-primary-700' : 'text-slate-600'}`}>
                {a.name}
              </span>
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </motion.div>
  );

  const renderLoadingStep = () => {
    const titles = [
      "Configurando entorno...",
      "Forjando tu futuro...",
      "Generando simulacros exclusivos...",
      "¡Todo listo, ingresante!"
    ];

    const particles = [
      { top: '-20%', left: '10%', delay: 0 },
      { top: '10%', left: '-30%', delay: 0.5 },
      { top: '-10%', left: '110%', delay: 1 },
      { top: '120%', left: '20%', delay: 0.3 },
      { top: '110%', left: '80%', delay: 0.8 },
      { top: '50%', left: '-20%', delay: 1.2 },
      { top: '40%', left: '120%', delay: 0.7 },
    ];

    return (
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col flex-1 items-center justify-center text-center px-6 h-full min-h-[70vh] relative z-10">
        
        {/* Glow de fondo animado */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/20 blur-3xl rounded-full pointer-events-none"
        />

        <div className="relative mb-12">
          {loadingStep === 3 ? (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
              className="w-32 h-32 bg-primary-500 rounded-full shadow-2xl shadow-primary-500/50 flex items-center justify-center text-white relative z-10 border-4 border-white"
            >
              <Check size={64} strokeWidth={4} />
            </motion.div>
          ) : (
            <div className="relative z-10">
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-primary-400"
                  style={{ top: p.top, left: p.left }}
                  animate={{ y: [0, -40], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
                />
              ))}
              <motion.div 
                animate={{ y: [-8, 8] }} 
                transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto border-2 border-slate-50 relative z-10 overflow-hidden"
              >
                <img src="/icon-512.png" alt="Ingresa.pe" className="w-[80%] h-[80%] object-contain" />
              </motion.div>
            </div>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={loadingStep}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            className="h-16 flex flex-col items-center justify-center"
          >
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              {titles[loadingStep]}
            </h2>
            {loadingStep < 3 && (
              <div className="flex gap-1 mt-3">
                {[0,1,2].map(i => (
                  <motion.div 
                    key={i} 
                    animate={{ y: [0, -5, 0] }} 
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-2 h-2 rounded-full bg-primary-500"
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col font-sans selection:bg-primary-500/30 overflow-hidden">
      
      {/* MARCA DE AGUA (FONDO COMPOSICIÓN SUTIL Y CORRECTA) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden opacity-[0.06]">
        <img src="/logo-horizontal.png" alt="" className="w-full max-w-[800px] object-contain -rotate-12 grayscale" />
      </div>

      {/* HEADER: PROGRESS BAR */}
      {step > 0 && step < TOTAL_STEPS && (
        <div className="relative z-50 pt-6 pb-4 px-4 sm:px-6 flex items-center justify-center bg-slate-50/90 backdrop-blur-md">
          <div className="flex items-center gap-4 w-full max-w-md mx-auto">
            <button 
              onClick={handleBack} 
              className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-200 border-b-[4px] rounded-xl text-slate-400 hover:text-slate-600 active:border-b-2 active:translate-y-[2px] transition-all shrink-0 shadow-sm"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <div className="w-full h-3 bg-white border-2 border-slate-200 rounded-full flex-1 overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-primary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL SCROLLABLE */}
      <div className="flex-1 w-full max-w-md mx-auto relative px-4 sm:px-6 overflow-y-auto hide-scrollbar z-10">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full min-h-full flex flex-col"
          >
            {step === 0 && renderWelcome()}
            {step === 1 && renderCareerStep()}
            {step === 2 && renderScoreStep()}
            {step === 3 && renderAcademyStep()}
            {step === 4 && renderLoadingStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER: BOTÓN CONTINUAR */}
      <AnimatePresence>
        {step > 0 && step < TOTAL_STEPS && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200/50 p-4 sm:p-6 z-50"
          >
            <div className="max-w-md mx-auto w-full">
              <Button3D 
                variant={isStepValid() ? 'brand' : 'locked'} 
                disabled={!isStepValid()} 
                onClick={() => paginate(1)} 
                className="!py-4"
              >
                Continuar
              </Button3D>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
