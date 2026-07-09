'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopFabProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export const ScrollToTopFab: React.FC<ScrollToTopFabProps> = ({
  scrollContainerRef,
}) => {
  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={scrollToTop}
      className="absolute bottom-[90px] right-4 z-40 w-10 h-10 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
      aria-label="Volver arriba"
    >
      <ArrowUp size={20} />
    </motion.button>
  );
};
