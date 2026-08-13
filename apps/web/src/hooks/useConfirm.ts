'use client';

import { useCallback, useState } from 'react';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback(
    (
      options: Omit<Partial<ConfirmState>, 'open' | 'onConfirm' | 'onCancel'> &
        Pick<ConfirmState, 'title' | 'message' | 'onConfirm'>
    ) => {
      setState({
        open: true,
        title: options.title,
        message: options.message,
        onConfirm: options.onConfirm,
        onCancel: () => setState(null),
        confirmLabel: options.confirmLabel ?? 'Confirmar',
        cancelLabel: options.cancelLabel ?? 'Cancelar',
        variant: options.variant ?? 'default',
      });
    },
    []
  );

  const close = useCallback(() => {
    setState(null);
  }, []);

  return { state, confirm, close };
}
