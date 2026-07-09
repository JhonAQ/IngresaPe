import React from 'react';
import { motion } from 'framer-motion';
import type { CareerSummaryDto } from '@ingresa-pe/domain';

interface CareerFilterProps {
  careers: CareerSummaryDto[];
  activeId: string;
  onChange: (careerId: string) => void;
}

export const CareerFilter: React.FC<CareerFilterProps> = ({
  careers,
  activeId,
  onChange,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {careers.map((career) => {
        const isActive = activeId === career.id;
        return (
          <motion.button
            key={career.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(career.id)}
            className={`shrink-0 px-4 py-2 rounded-xl font-black text-[12px] border-2 border-b-[4px] transition-all
              ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border-primary-200 border-b-primary-300'
                  : 'bg-white text-slate-500 border-slate-200 border-b-slate-300'
              }`}
          >
            {career.name}
          </motion.button>
        );
      })}
    </div>
  );
};
