'use client';

import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface AcademicDNAProps {
  scores: Record<string, number>; // subject → 0-100
  strongIn: string;
  prioritize: string;
}

export function AcademicDNA({ scores, strongIn, prioritize }: AcademicDNAProps) {
  const subjects = Object.keys(scores);
  const values = Object.values(scores);
  const n = subjects.length;
  const cx = 150;
  const cy = 150;
  const maxR = 110;

  // Calculate polygon points for a given radius
  const getPolygonPoints = (radius: number) => {
    return subjects.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Calculate the data polygon
  const dataPoints = values.map((val, i) => {
    const radius = (val / 100) * maxR;
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Label positions (slightly outside the chart)
  const labelPositions = subjects.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const labelR = maxR + 28;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
    };
  });

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="font-black text-[18px] text-slate-800">Tu ADN Académico</h3>
        <div className="bg-duo-blue/10 px-3 py-1 rounded-full">
          <span className="text-duo-blue font-black text-[11px] uppercase tracking-widest">Hoy</span>
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-5 pb-2">
        <p className="text-[12px] font-bold text-slate-400">Estadísticas globales</p>
      </div>

      {/* Radar Chart */}
      <div className="flex justify-center py-4">
        <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <polygon
              key={i}
              points={getPolygonPoints(maxR * scale)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              opacity={0.8}
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
                strokeWidth="1"
              />
            );
          })}

          {/* Data fill */}
          <polygon
            points={dataPoints}
            fill="rgba(88, 204, 2, 0.15)"
            stroke="#58cc02"
            strokeWidth="2.5"
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
                r="4"
                fill="#58cc02"
                stroke="white"
                strokeWidth="2"
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
                className="fill-slate-500 font-bold"
                fontSize="10"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Insights row */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-3">
          <TrendingUp size={18} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
          <div>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Fuerte en</p>
            <p className="text-[13px] font-bold text-emerald-800 leading-tight">{strongIn}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" strokeWidth={2.5} />
          <div>
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Priorizar</p>
            <p className="text-[13px] font-bold text-amber-800 leading-tight">{prioritize}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
