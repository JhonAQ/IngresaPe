'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

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
  const isOpen = mode !== null;
  const manualCloseRef = useRef(false);

  const open = useCallback((nextMode: ImmersiveOverlayMode) => {
    setMode(nextMode);
    if (typeof window !== 'undefined' && !window.history.state?.immersiveOverlay) {
      window.history.pushState({ immersiveOverlay: true }, '');
    }
  }, []);

  const close = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.immersiveOverlay) {
      manualCloseRef.current = true;
      window.history.back();
    }
    setMode(null);
  }, []);

  useEffect(() => {
    const handlePop = () => {
      if (manualCloseRef.current) {
        manualCloseRef.current = false;
        return;
      }
      if (isOpen) {
        setMode(null);
      }
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [isOpen]);

  return (
    <ImmersiveOverlayContext.Provider value={{ mode, isOpen, open, close }}>
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
