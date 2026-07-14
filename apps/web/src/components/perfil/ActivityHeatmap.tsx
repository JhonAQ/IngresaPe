'use client';

import React from 'react';

interface HeatmapDay {
  date: string;
  intensity: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

const intensityColors = [
  'bg-slate-100',
  'bg-green-200',
  'bg-green-300',
  'bg-green-400',
  'bg-green-500',
];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  if (!data.length) {
    return (
      <div className="h-28 flex items-center justify-center text-slate-400 font-bold text-[12px]">
        Aún no hay actividad registrada.
      </div>
    );
  }

  // Rellenar hasta 12 semanas (84 días)
  const padded = [...data];
  const targetDays = 84;
  while (padded.length < targetDays) {
    padded.unshift({ date: '', intensity: 0 });
  }

  return (
    <div className="overflow-x-auto hide-scrollbar">
      <div className="grid grid-rows-7 grid-flow-col gap-1 min-w-max">
        {padded.map((day, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-sm ${intensityColors[day.intensity] ?? intensityColors[0]}`}
            title={day.date || 'Sin actividad'}
          />
        ))}
      </div>
    </div>
  );
}
