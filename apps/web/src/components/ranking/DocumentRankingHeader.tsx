'use client';

import React from 'react';

const IngresaPeLogo = () => (
  <svg viewBox="0 0 100 100" className="w-[45px] h-[45px] shrink-0">
    <circle cx="50" cy="50" r="45" fill="none" stroke="#bd1720" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="#bd1720" strokeWidth="1" />
    <circle cx="50" cy="50" r="30" fill="#bd1720" opacity="0.1" />
    <path
      d="M35 35 L65 35 L65 55 C65 68 50 75 50 75 C50 75 35 68 35 55 Z"
      fill="none"
      stroke="#bd1720"
      strokeWidth="2.5"
    />
    <text
      x="50"
      y="58"
      fontSize="22"
      fill="#bd1720"
      textAnchor="middle"
      fontWeight="900"
      fontFamily="Nunito, sans-serif"
    >
      I
    </text>
  </svg>
);

function formatDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

export const DocumentRankingHeader: React.FC = () => {
  return (
    <div className="shrink-0 pt-safe bg-white z-20 px-3 sm:px-4 pt-4 shadow-sm relative">
      {/* Cabecera institucional */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center">
          <IngresaPeLogo />
          <div className="flex flex-col ml-2.5">
            <span
              className="text-[32px] font-black leading-none tracking-tighter"
              style={{ transform: 'scaleY(1.05)' }}
            >
              INGRESA
            </span>
            <span className="text-[6px] font-bold border-t border-black pt-[1.5px] mt-[1.5px] whitespace-nowrap tracking-wide uppercase">
              Plataforma de preparación preuniversitaria
            </span>
            <span className="text-[5px] text-center mt-[1px] uppercase tracking-wide">
              Resultados semanales por desempeño
            </span>
          </div>
        </div>

        <div className="text-[8px] text-right mt-1 leading-snug whitespace-nowrap">
          <p>Fecha : {formatDate()}</p>
          <p>Página : 1 de 1</p>
        </div>
      </div>

      {/* Títulos del proceso */}
      <div className="text-center mb-5">
        <h2 className="text-[12px] font-bold mb-0.5 tracking-wide uppercase">
          Concurso semanal - Orden de mérito
        </h2>
        <h1 className="text-[15px] font-bold tracking-wide uppercase">
          Reporte de posiciones - Ranking semanal
        </h1>
      </div>
    </div>
  );
};
