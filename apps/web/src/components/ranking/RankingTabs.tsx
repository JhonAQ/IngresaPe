'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type RankingTab = 'league' | 'career' | 'area' | 'global';

interface RankingTabsProps {
  active: RankingTab;
  onChange: (tab: RankingTab) => void;
}

const tabs: { key: RankingTab; label: string }[] = [
  { key: 'league', label: 'Liga' },
  { key: 'career', label: 'Carrera' },
  { key: 'area', label: 'Área' },
  { key: 'global', label: 'Global' },
];

export const RankingTabs: React.FC<RankingTabsProps> = ({
  active,
  onChange,
}) => {
  return (
    <div className="flex gap-1.5 mb-4 border-b-2 border-slate-100 pb-4">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(tab.key)}
            className={`flex-1 py-2 text-[11.5px] font-black uppercase tracking-wider rounded transition-all border
              ${
                isActive
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
};
