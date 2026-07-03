'use client';

import React from 'react';
import { Dna, TrendingUp, AlertTriangle } from 'lucide-react';

interface AcademicDNAProps {
  scores?: Record<string, number>; // subject → 0-100
  strongIn?: string;
  prioritize?: string;
}

const DEFAULT_SCORES: Record<string, number> = {
  Matemática: 72,
  'R. Verbal': 58,
  Ciencias: 65,
  Historia: 44,
  'R. Lógico': 80,
};

export function AcademicDNA({
  scores = DEFAULT_SCORES,
  strongIn = 'Razonamiento lógico',
  prioritize = 'Historia del Perú',
}: AcademicDNAProps) {
  const subjects = Object.keys(scores);
  const values = Object.values(scores);
  const n = subjects.length;
  const cx = 150;
  const cy = 150;
  const maxR = 100;

  // Calculate polygon points for a given radius
  const getPolygonPoints = (radius: number) => {
    return subjects
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Calculate the data polygon
  const dataPoints = values
    .map((val, i) => {
      const radius = (val / 100) * maxR;
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  // Label positions (slightly outside the chart)
  const labelPositions = subjects.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const labelR = maxR + 30;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
    };
  });

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
        <div className="w-10 h-10 rounded-xl bg-duo-purple/15 flex items-center justify-center shrink-0">
          <Dna size={22} className="text-duo-purple" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-black text-[18px] text-slate-800 leading-tight">
            Tu ADN Académico
          </h3>
          <p className="text-[12px] font-bold text-slate-400">
            Estadísticas globales
          </p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="flex justify-center py-2">
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="overflow-visible"
        >
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <polygon
              key={i}
              points={getPolygonPoints(maxR * scale)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              opacity={0.7}
            />
          ))}

          {/* Axis lines */}
          {subjects.map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            const x2 = cx + maxR * Math.cos(angle);
            const y2 = cy + maxR * Math.sin(angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Data fill */}
          <polygon
            points={dataPoints}
            fill="rgba(206, 130, 255, 0.2)"
            stroke="#ce82ff"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {values.map((val, i) => {
            const radius = (val / 100) * maxR;
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="#ce82ff"
                stroke="white"
                strokeWidth="2.5"
              />
            );
          })}

          {/* Labels */}
          {subjects.map((label, i) => {
            const pos = labelPositions[i];
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-600 font-extrabold"
                fontSize="11"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Insights row */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        <div className="flex items-center gap-2.5 bg-success-50 rounded-xl p-3 border border-success-100">
          <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center shrink-0">
            <TrendingUp
              size={18}
              className="text-success-600"
              strokeWidth={2.5}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-success-600 uppercase tracking-widest">
              Fuerte en
            </p>
            <p className="text-[13px] font-extrabold text-slate-700 leading-tight truncate">
              {strongIn}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-warning-50 rounded-xl p-3 border border-warning-100">
          <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center shrink-0">
            <AlertTriangle
              size={18}
              className="text-warning-600"
              strokeWidth={2.5}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-warning-600 uppercase tracking-widest">
              Priorizar
            </p>
            <p className="text-[13px] font-extrabold text-slate-700 leading-tight truncate">
              {prioritize}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
