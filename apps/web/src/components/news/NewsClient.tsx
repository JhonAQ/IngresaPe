'use client';

import { motion } from 'framer-motion';
import { AdmisionHero } from './AdmisionHero';
import { ToolGrid } from './ToolGrid';
import { AlertFeed } from './AlertFeed';
import { DocumentsSection } from './DocumentsSection';
import { MaterialsSection } from './MaterialsSection';
import { OfficialLinks } from './OfficialLinks';

const sectionStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const sectionItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function NewsClient() {
  return (
    <motion.main
      variants={sectionStagger}
      initial="hidden"
      animate="show"
      className="flex-1 overflow-y-auto hide-scrollbar bg-white pb-bottom-nav"
    >
      <div className="px-5 pt-4 pb-6 space-y-6">
        <motion.div variants={sectionItem}>
          <AdmisionHero />
        </motion.div>

        <motion.div variants={sectionItem}>
          <ToolGrid />
        </motion.div>

        <motion.div variants={sectionItem}>
          <AlertFeed />
        </motion.div>

        <motion.div variants={sectionItem}>
          <DocumentsSection />
        </motion.div>

        <motion.div variants={sectionItem}>
          <MaterialsSection />
        </motion.div>

        <motion.div variants={sectionItem}>
          <OfficialLinks />
        </motion.div>
      </div>
    </motion.main>
  );
}
