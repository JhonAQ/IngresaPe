'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ToolSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  accent: string;
  children: React.ReactNode;
}

export function ToolSheet({
  isOpen,
  onClose,
  title,
  accent,
  children,
}: ToolSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sheet = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[720px]"
            style={{ height: '90dvh' }}
          >
            <div
              className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100"
              style={{ backgroundColor: `${accent}10` }}
            >
              <span
                className="font-black text-[18px]"
                style={{ color: accent }}
              >
                {title}
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white text-[#8B8F98] flex items-center justify-center hover:bg-slate-100 transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(sheet, document.body);
}
