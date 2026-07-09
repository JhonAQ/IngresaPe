'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface RankingAccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  rightContent?: React.ReactNode;
}

export const RankingAccordion: React.FC<RankingAccordionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  className = '',
  rightContent,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <button
        onClick={onToggle}
        className="w-full bg-[#e5e5e5] border-y-[1.5px] border-black py-1.5 px-3 flex items-center justify-between transition-colors"
      >
        <span className="font-bold tracking-wide uppercase text-[11px] sm:text-[12px] text-black text-left truncate pr-2">
          {title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {rightContent}
          <ChevronDown
            size={15}
            className={`text-black transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
