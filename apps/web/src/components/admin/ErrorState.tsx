import { AlertTriangle } from 'lucide-react';
import { Card3D } from '@ingresa-pe/ui';

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'No se pudieron cargar los datos.',
  action,
}: ErrorStateProps) {
  return (
    <Card3D variant="surface" padding="lg" className="text-center">
      <div className="w-16 h-16 bg-error-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={32} className="text-error-500" strokeWidth={2} />
      </div>
      <h3 className="text-lg font-black text-surface-800 mb-1">{title}</h3>
      <p className="text-[14px] font-bold text-surface-500 mb-4">{message}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </Card3D>
  );
}
