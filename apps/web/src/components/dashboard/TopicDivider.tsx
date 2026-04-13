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
      <div className="h-[2px] w-[120px] rounded-full bg-slate-700/50"></div>

      {/* Texto */}
      <span className="mx-4 text-center text-[15px] font-bold text-slate-500">
        {label}
      </span>

      {/* Línea derecha */}
      <div className="h-[3px] w-[120px] rounded-full bg-slate-700/50"></div>
    </div>
  );
};
