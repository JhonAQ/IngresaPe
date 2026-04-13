import React from 'react';

interface TopicDividerProps {
  /**
   * Texto a mostrar en el medio de la línea divisoria
   */
  label: string;
}

export const TopicDivider: React.FC<TopicDividerProps> = ({ label }) => {
  return (
    <div className="flex w-full h-[120px] max-w-lg items-center justify-center pb-4 px-4">
      {/* Línea izquierda */}
      <div className="h-[4px] w-[150px] rounded-full bg-slate-700/40"></div>

      {/* Texto */}
      <span className="mx-4 text-center text-[15px] font-bold text-slate-500">
        {label}
      </span>

      {/* Línea derecha */}
      <div className="h-[4px] w-[150px] rounded-full bg-slate-700/40"></div>
    </div>
  );
};
