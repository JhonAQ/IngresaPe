import { LucideIcon } from 'lucide-react';
import { Card3D } from '@ingresa-pe/ui';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card3D variant="surface" padding="lg" className="text-center">
      <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon size={32} className="text-surface-400" strokeWidth={2} />
      </div>
      <h3 className="text-lg font-black text-surface-800 mb-1">{title}</h3>
      {description && (
        <p className="text-[14px] font-bold text-surface-500 mb-4">
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </Card3D>
  );
}
