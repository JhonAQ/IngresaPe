'use client';

import { useEffect, useRef } from 'react';

const EXIT_CONFIRM_STATE = { exitConfirm: true };

/**
 * Intercepta el botón "atrás" del navegador para mostrar primero una
 * confirmación de salida. Si el modal ya está abierto, el segundo "atrás"
 * lo cierra. Al confirmar la salida desde el modal se debe llamar a
 * `onConfirmExit` manualmente.
 */
export function useExitConfirm(
  isOpen: boolean,
  onOpen: () => void,
  onClose: () => void,
  enabled = true
) {
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Creamos una entrada extra en el history para que el primer "atrás"
    // no navegue fuera de la actividad, sino que dispare el modal.
    if (!window.history.state?.exitConfirm) {
      window.history.pushState(EXIT_CONFIRM_STATE, '');
    }

    const handlePopState = () => {
      if (isOpenRef.current) {
        onClose();
      } else {
        onOpen();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled, onOpen, onClose]);
}
