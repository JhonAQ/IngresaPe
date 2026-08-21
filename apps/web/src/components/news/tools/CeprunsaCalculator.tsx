'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Award, ArrowRight, Info } from 'lucide-react';
import { CAREERS } from '../data';

export function CeprunsaCalculator() {
  const [careerName, setCareerName] = useState(CAREERS[0].name);
  const [modality, setModality] = useState('CEPRUNSA');
  
  // Inputs
  const [examScore, setExamScore] = useState('');
  const [previaScore, setPreviaScore] = useState('');
  const [rmScore, setRmScore] = useState('');
  const [rvScore, setRvScore] = useState('');
  const [firstYear, setFirstYear] = useState('');
  const [aptitud, setAptitud] = useState('');

  const target = useMemo(() => {
    const career = CAREERS.find((c) => c.name === careerName);
    return career ? career.scores[0].score : 0;
  }, [careerName]);

  const isArts = useMemo(() => {
    const n = careerName.toLowerCase();
    return n.includes('arquitectura') || n.includes('artes');
  }, [careerName]);

  const result = useMemo(() => {
    if (modality === 'EXTRAORDINARIO') {
      const rm = Number.parseFloat(rmScore) || 0;
      const rv = Number.parseFloat(rvScore) || 0;
      return (rm * 0.5) + (rv * 0.5);
    }
    if (modality === 'TRASLADO') {
      const y1 = Number.parseFloat(firstYear) || 0;
      const apt = Number.parseFloat(aptitud) || 0;
      return (y1 * 0.5) + (apt * 0.5);
    }
    if (isArts) {
      const previa = Number.parseFloat(previaScore) || 0;
      const exam = Number.parseFloat(examScore) || 0;
      return (previa * 0.5) + (exam * 0.5);
    }
    // CEPRUNSA/Ordinario default
    return Number.parseFloat(examScore) || 0;
  }, [modality, isArts, examScore, previaScore, rmScore, rvScore, firstYear, aptitud]);

  const targetDiff = result - target;
  const passedMinExtra = modality === 'EXTRAORDINARIO' && result >= 52.5;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1CB0F6]/10 text-[#1CB0F6] mb-3">
            <Calculator size={28} strokeWidth={2.5} />
          </div>
          <h2 className="font-black text-[22px] text-[#15192B] leading-tight">
            Calculadora UNSA
          </h2>
          <p className="text-[13px] font-bold text-[#8B8F98] mt-1">
            Simula tu puntaje según la nueva normativa.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-2">
            <label className="block text-[12px] font-black uppercase tracking-wider text-[#8B8F98]">
              Modalidad de Admisión
            </label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl h-12 px-3 font-black text-[14px] text-[#15192B] focus:border-[#1CB0F6] focus:outline-none"
            >
              <option value="CEPRUNSA">CEPRUNSA / Ordinario General</option>
              <option value="EXTRAORDINARIO">Proceso Extraordinario</option>
              <option value="TRASLADO">Traslados Internos</option>
            </select>
          </div>

          {(modality === 'CEPRUNSA' || modality === 'EXTRAORDINARIO') && (
            <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-2">
              <label className="block text-[12px] font-black uppercase tracking-wider text-[#8B8F98]">
                Carrera objetivo
              </label>
              <select
                value={careerName}
                onChange={(e) => setCareerName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl h-12 px-3 font-black text-[13px] text-[#15192B] focus:border-[#1CB0F6] focus:outline-none truncate"
              >
                {CAREERS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-white rounded-[1.5rem] border-2 border-slate-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-[#1CB0F6]" />
              <span className="text-[12px] font-black uppercase text-[#1CB0F6]">
                Ingresa tus notas (0-100)
              </span>
            </div>

            {modality === 'EXTRAORDINARIO' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-[#8B8F98] mb-1">R. Lógico y Matemático (50%)</label>
                  <input type="number" value={rmScore} onChange={(e) => setRmScore(e.target.value)} placeholder="Ej: 60" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 font-black text-[#15192B]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#8B8F98] mb-1">R. Verbal / Comp. Lectora (50%)</label>
                  <input type="number" value={rvScore} onChange={(e) => setRvScore(e.target.value)} placeholder="Ej: 75" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 font-black text-[#15192B]" />
                </div>
              </>
            )}

            {modality === 'TRASLADO' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-[#8B8F98] mb-1">Promedio 1er año (50%)</label>
                  <input type="number" value={firstYear} onChange={(e) => setFirstYear(e.target.value)} placeholder="Ej: 16" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 font-black text-[#15192B]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#8B8F98] mb-1">Ev. de Aptitud Académica (50%)</label>
                  <input type="number" value={aptitud} onChange={(e) => setAptitud(e.target.value)} placeholder="Ej: 70" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 font-black text-[#15192B]" />
                </div>
              </>
            )}

            {modality === 'CEPRUNSA' && isArts && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-[#8B8F98] mb-1">Evaluación Previa (50%)</label>
                  <input type="number" value={previaScore} onChange={(e) => setPreviaScore(e.target.value)} placeholder="Ej: 65" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 font-black text-[#15192B]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#8B8F98] mb-1">Examen de Conocimientos (50%)</label>
                  <input type="number" value={examScore} onChange={(e) => setExamScore(e.target.value)} placeholder="Ej: 70" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 font-black text-[#15192B]" />
                </div>
                <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg leading-tight font-bold">
                  Nota: Arquitectura y Artes requieren evaluación previa obligatoria promediada.
                </p>
              </>
            )}

            {modality === 'CEPRUNSA' && !isArts && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-[#8B8F98] mb-1">Examen de Conocimientos (100%)</label>
                  <input type="number" value={examScore} onChange={(e) => setExamScore(e.target.value)} placeholder="Ej: 75.5" className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 font-black text-[#15192B]" />
                </div>
                <p className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg leading-tight font-bold">
                  El postulante CEPRUNSA rinde una sola evaluación (80 preguntas, 150 min). Requiere 70% asistencia.
                </p>
              </>
            )}
          </div>

          <motion.div
            layout
            className="rounded-3xl p-5 text-center bg-[#15192B] text-white shadow-xl"
          >
            <span className="block text-[11px] font-black uppercase tracking-widest text-[#8B8F98] mb-1">
              Puntaje Final
            </span>
            <div className="font-black text-[46px] leading-none mb-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {result.toFixed(2)}
            </div>
            
            {modality === 'EXTRAORDINARIO' && (
              <div className={`text-[12px] font-bold py-1.5 px-3 rounded-lg inline-block ${passedMinExtra ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {passedMinExtra ? 'Superas el mínimo (52.5)' : 'No superas el mínimo (52.5)'}
              </div>
            )}
            
            {modality !== 'TRASLADO' && (
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-left">
                <div>
                  <span className="block text-[10px] font-bold text-[#8B8F98]">Corte Histórico</span>
                  <span className="block text-[13px] font-black">{careerName}</span>
                </div>
                <div className="text-right">
                  <span className="block font-black text-[18px] text-[#1CB0F6]">{target.toFixed(2)}</span>
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
