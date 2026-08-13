import { AdminModal } from './AdminModal';
import { Button3D } from '@ingresa-pe/ui';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AdminModal open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-[15px] font-bold text-surface-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button3D variant="surface" size="md" fullWidth onClick={onCancel}>
          {cancelLabel}
        </Button3D>
        <Button3D
          variant={variant === 'danger' ? 'error' : 'primary'}
          size="md"
          fullWidth
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button3D>
      </div>
    </AdminModal>
  );
}
