import React from 'react';
import { motion } from 'framer-motion';

type Tab = 'weekly' | 'area' | 'career';

interface RankingTabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'weekly', label: 'Semanal' },
  { key: 'area', label: 'Áreas' },
  { key: 'career', label: 'Carreras' },
];

export const RankingTabs: React.FC<RankingTabsProps> = ({ active, onChange }) => {
  return (
    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(tab.key)}
            className={`flex-1 relative py-2.5 rounded-xl font-black text-[12px] uppercase tracking-wider transition-all
              ${
                isActive
                  ? 'bg-white text-primary-600 shadow-[0_3px_0_0_#cbd5e1]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="ranking-tab"
                className="absolute inset-0 bg-white rounded-xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
};
