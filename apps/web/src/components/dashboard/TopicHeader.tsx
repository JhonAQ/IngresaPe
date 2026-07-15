import React from 'react';

interface TopicHeaderProps {
  /**
   * Texto superior (ej: "TEMA 1")
   */
  subtitle: string;
  /**
   * Texto principal (ej: "Planteo de Ecuaciones")
   */
  title: string;
  /**
   * Color de fondo del header. Por defecto rojo para mantener compatibilidad.
   */
  bgColor?: string;
  /**
   * Color de la sombra/borde inferior 3D.
   */
  shadowColor?: string;
  /**
   * Evento al dar click en el botón de la libreta (guía)
   */
  onGuideClick?: () => void;
}

export const TopicHeader: React.FC<TopicHeaderProps> = ({
  subtitle,
  title,
  bgColor = '#ea2b2b',
  shadowColor = '#b91c1c',
  onGuideClick,
}) => {
  return (
    <div
      className="relative flex w-full max-w-2xl select-none overflow-hidden rounded-2xl text-white"
      style={{
        backgroundColor: bgColor,
        boxShadow: `0 4px 0 ${shadowColor}`,
      }}
    >
      {/* Sección principal de texto */}
      <div className="flex flex-1 flex-col justify-center px-5 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-white/80">
          {subtitle}
        </h2>
        <h1 className="mt-[2px] text-[1.2rem] font-extrabold leading-tight tracking-tight">
          {title}
        </h1>
      </div>

      {/* Línea divisoria */}
      <div className="my-[10px] w-[2px] rounded-full bg-black/10" />

      {/* Botón de la guía (libreta) */}
      <button
        onClick={onGuideClick}
        className="flex cursor-pointer items-center justify-center px-6 transition-colors hover:bg-white/10 active:bg-white/20"
        aria-label="Abrir guía"
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base de la libreta */}
          <rect x="6" y="3" width="14" height="18" rx="2" fill="white" />

          {/* Líneas de texto simuladas en la libreta */}
          <rect x="9" y="8" width="8" height="2" rx="1" fill={bgColor} />
          <rect x="9" y="12" width="8" height="2" rx="1" fill={bgColor} />
          <rect x="9" y="16" width="5" height="2" rx="1" fill={bgColor} />

          {/* Anillos de la libreta (espiral) */}
          <path
            d="M4 6h4M4 12h4M4 18h4"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
