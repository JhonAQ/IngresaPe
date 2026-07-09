import React from 'react';
import { motion } from 'framer-motion';
import type { Area } from '@ingresa-pe/domain';
import { areaLabels, areaOrder } from '@ingresa-pe/domain';

interface AreaFilterProps {
  active: Area;
  onChange: (area: Area) => void;
}

const areaStyles: Record<Area, string> = {
  INGENIERIAS: 'bg-blue-50 text-blue-600 border-blue-200 border-b-blue-300',
  SOCIALES: 'bg-purple-50 text-purple-600 border-purple-200 border-b-purple-300',
  BIOMEDICAS: 'bg-green-50 text-green-600 border-green-200 border-b-green-300',
};

export const AreaFilter: React.FC<AreaFilterProps> = ({ active, onChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {areaOrder.map((area) => {
        const isActive = active === area;
        return (
          <motion.button
            key={area}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(area)}
            className={`shrink-0 px-4 py-2 rounded-xl font-black text-[12px] uppercase tracking-wider border-2 border-b-[4px] transition-all
              ${
                isActive
                  ? areaStyles[area]
                  : 'bg-white text-slate-400 border-slate-200 border-b-slate-300'
              }`}
          >
            {areaLabels[area]}
          </motion.button>
        );
      })}
    </div>
  );
};
