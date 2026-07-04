import React, { forwardRef } from 'react';

interface TopicDividerProps {
  /**
   * Texto a mostrar en el medio de la línea divisoria
   */
  label: string;
  /**
   * Identificador del tema que sigue a este separador (para scroll detection)
   */
  'data-topic-id'?: string;
}

export const TopicDivider = forwardRef<HTMLDivElement, TopicDividerProps>(
  ({ label, 'data-topic-id': topicId }, ref) => {
    return (
      <div
        ref={ref}
        data-topic-id={topicId}
        className="flex w-full h-[50px] mb-6 max-w-lg items-center justify-center px-2"
      >
        {/* Línea izquierda */}
        <div className="h-[4px] flex-1 rounded-full bg-slate-700/30"></div>

        {/* Texto */}
        <span className="mx-4 text-center whitespace-nowrap text-[15px] font-bold text-slate-500">
          {label}
        </span>

        {/* Línea derecha */}
        <div className="h-[4px] flex-1 rounded-full bg-slate-700/30"></div>
      </div>
    );
  }
);

TopicDivider.displayName = 'TopicDivider';
