import React from 'react';

// ============================================================================
// COMPONENTE SVG CUSTOM: CUADERNO ESTILO DUOLINGO
// ============================================================================
export const DuoNotebook = ({ type, status }: { type: string; status: string }) => {
  let primary, dark, accent, icon;

  if (status === 'locked') {
    primary = '#e5e5e5'; dark = '#cfcfcf'; accent = '#afafaf';
    icon = (
      <g transform="translate(42, 47)">
        <rect x="0" y="6" width="16" height="12" rx="4" fill="#ffffff" />
        <path d="M4 6 V4 C4 -1 12 -1 12 4 V6" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g>
    );
  } else if (status === 'completed') {
    primary = '#ffc800'; dark = '#cc9f00'; accent = '#58cc02';
    icon = (
      <g transform="translate(40, 50)">
        <path d="M2 8 L8 14 L18 2" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    );
  } else if (type === 'CEPRUNSA') {
    primary = '#ce82ff'; dark = '#a568cc'; accent = '#ffc800';
    icon = (
      <g transform="translate(38, 48)">
        <rect x="0" y="0" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
        <rect x="0" y="10" width="16" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
        <rect x="0" y="20" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
      </g>
    );
  } else if (type === 'EXTRA') {
    primary = '#ff9600'; dark = '#cc7800'; accent = '#1cb0f6';
    icon = (
      <g transform="translate(38, 48)">
        <rect x="0" y="0" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
        <rect x="0" y="10" width="16" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
        <rect x="0" y="20" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
      </g>
    );
  } else { // ORDINARIO
    primary = '#1cb0f6'; dark = '#1899d6'; accent = '#ff4b4b';
    icon = (
       <g transform="translate(38, 48)">
        <rect x="0" y="0" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
        <rect x="0" y="10" width="16" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
        <rect x="0" y="20" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.9"/>
      </g>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-[90px] h-[90px]">
      {/* Sombra proyectada de las hojas */}
      <rect x="23" y="18" width="60" height="75" rx="12" fill="#e5e5e5" />
      {/* Tapa trasera (Color Oscuro) */}
      <rect x="15" y="15" width="64" height="78" rx="12" fill={dark} />
      {/* Tapa principal (Color Primario) */}
      <rect x="15" y="10" width="64" height="78" rx="12" fill={primary} />
      {/* Lomo del libro */}
      <rect x="10" y="10" width="12" height="78" rx="6" fill={dark} />
      {/* Separador de páginas */}
      <path d="M 55 10 L 67 10 L 67 45 L 61 39 L 55 45 Z" fill={accent} />
      {/* Brillo circular central */}
      <circle cx="50" cy="55" r="20" fill="#ffffff" opacity="0.15" />
      {/* Ícono de Estado central */}
      {icon}
    </svg>
  );
};