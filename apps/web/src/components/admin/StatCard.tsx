import { LucideIcon } from 'lucide-react';
import { Card3D } from '@ingresa-pe/ui';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantIconBg: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'bg-primary-100 text-primary-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  error: 'bg-error-100 text-error-600',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  variant = 'default',
}: StatCardProps) {
  return (
    <Card3D variant="surface" padding="md" className="flex items-center gap-4">
      <div
        className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
          variantIconBg[variant]
        )}
      >
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wider text-surface-500 truncate">
          {label}
        </p>
        <p className="text-[22px] font-black text-surface-800 leading-tight">
          {value}
        </p>
        {delta && (
          <p className="text-[11px] font-bold text-surface-400 truncate">
            {delta}
          </p>
        )}
      </div>
    </Card3D>
  );
}
