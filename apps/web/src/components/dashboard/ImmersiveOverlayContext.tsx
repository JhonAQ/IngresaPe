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

export type ImmersiveOverlayMode = 'courseSelector' | 'summary' | 'academicDna';

interface ImmersiveOverlayContextValue {
  mode: ImmersiveOverlayMode | null;
  payload: unknown;
  isOpen: boolean;
  open: (mode: ImmersiveOverlayMode, payload?: unknown) => void;
  close: (options?: { popHistory?: boolean }) => void;
}

const ImmersiveOverlayContext = createContext<ImmersiveOverlayContextValue | null>(null);

export function ImmersiveOverlayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ImmersiveOverlayMode | null>(null);
  const [payload, setPayload] = useState<unknown>(null);
  const isOpen = mode !== null;
  const manualCloseRef = useRef(false);

  const open = useCallback((nextMode: ImmersiveOverlayMode, nextPayload?: unknown) => {
    setMode(nextMode);
    setPayload(nextPayload ?? null);
    if (typeof window !== 'undefined' && !window.history.state?.immersiveOverlay) {
      window.history.pushState({ immersiveOverlay: true }, '');
    }
  }, []);

  const close = useCallback((options?: { popHistory?: boolean }) => {
    const popHistory = options?.popHistory ?? true;
    if (typeof window !== 'undefined' && window.history.state?.immersiveOverlay) {
      if (popHistory) {
        manualCloseRef.current = true;
        window.history.back();
      } else {
        window.history.replaceState({}, '');
      }
    }
    setMode(null);
    setPayload(null);
  }, []);

  useEffect(() => {
    const handlePop = () => {
      if (manualCloseRef.current) {
        manualCloseRef.current = false;
        return;
      }
      if (isOpen) {
        setMode(null);
        setPayload(null);
      }
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [isOpen]);

  return (
    <ImmersiveOverlayContext.Provider value={{ mode, payload, isOpen, open, close }}>
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
