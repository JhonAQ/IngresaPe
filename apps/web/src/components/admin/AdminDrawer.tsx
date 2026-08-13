'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

const widthClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function AdminDrawer({
  open,
  onClose,
  title,
  children,
  width = 'md',
}: AdminDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 right-0 h-full z-50 w-full bg-white shadow-2xl overflow-y-auto',
              widthClasses[width]
            )}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-surface-100">
              <h2 className="text-lg font-black text-surface-800 truncate">
                {title ?? 'Detalle'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-colors shrink-0"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
