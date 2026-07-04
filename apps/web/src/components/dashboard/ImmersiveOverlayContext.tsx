'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ImmersiveOverlayMode = 'courseSelector' | 'summary';

interface ImmersiveOverlayContextValue {
  mode: ImmersiveOverlayMode | null;
  isOpen: boolean;
  open: (mode: ImmersiveOverlayMode) => void;
  close: () => void;
}

const ImmersiveOverlayContext = createContext<ImmersiveOverlayContextValue | null>(null);

export function ImmersiveOverlayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ImmersiveOverlayMode | null>(null);

  const open = useCallback((nextMode: ImmersiveOverlayMode) => setMode(nextMode), []);
  const close = useCallback(() => setMode(null), []);

  return (
    <ImmersiveOverlayContext.Provider value={{ mode, isOpen: mode !== null, open, close }}>
      {children}
    </ImmersiveOverlayContext.Provider>
  );
}

export function useImmersiveOverlay() {
  const ctx = useContext(ImmersiveOverlayContext);
  if (!ctx) {
    throw new Error('useImmersiveOverlay must be used within ImmersiveOverlayProvider');
  }
  return ctx;
}

/**
 * Alias de compatibilidad para componentes que aún referencian
 * el selector de cursos de forma semántica.
 */
export function useCourseSelector() {
  const ctx = useImmersiveOverlay();
  return {
    isOpen: ctx.mode === 'courseSelector',
    open: () => ctx.open('courseSelector'),
    close: ctx.close,
    toggle: () => ctx.open(ctx.mode === 'courseSelector' ? 'courseSelector' : 'courseSelector'),
  };
}
