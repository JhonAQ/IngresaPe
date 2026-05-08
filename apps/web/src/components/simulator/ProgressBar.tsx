import React from 'react';

interface ProgressBarProps {
  respondidas: number;
  total: number;
}

export const ProgressBar = ({ respondidas, total }: ProgressBarProps) => {
  const progreso = (respondidas / total) * 100;
  return (
    <div className="w-full h-[3px] bg-slate-100 relative z-20">
      <div 
        className="h-full bg-blue-600 transition-all duration-500 ease-out" 
        style={{ width: `${progreso}%` }}
      />
    </div>
  );
};
