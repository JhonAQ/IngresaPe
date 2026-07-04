'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CourseSelectorContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CourseSelectorContext = createContext<CourseSelectorContextValue | null>(null);

export function CourseSelectorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <CourseSelectorContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CourseSelectorContext.Provider>
  );
}

export function useCourseSelector() {
  const ctx = useContext(CourseSelectorContext);
  if (!ctx) {
    throw new Error('useCourseSelector must be used within CourseSelectorProvider');
  }
  return ctx;
}
