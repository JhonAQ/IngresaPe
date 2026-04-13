import { HTMLAttributes, forwardRef, ReactNode } from 'react';

export type StatBadgeType = 'streak' | 'gem' | 'heart' | 'xp';

export interface StatBadgeProps extends HTMLAttributes<HTMLDivElement> {
  /** Tipo de estadística que dictará semánticamente los colores por defecto */
  type: StatBadgeType;
  /** El valor numérico a mostrar (ej. 450, 12, 5) */
  value: number;
  /** Permite pasar un ícono personalizado (ej. un componente Lucide o un SVG propio) */
  icon: ReactNode;
}

const typeColorClasses: Record<StatBadgeType, string> = {
  streak: 'text-warning-500', // Naranja/Fuego
  gem: 'text-[#1CB0F6]', // Cyan brillante de Duolingo (Info)
  heart: 'text-error-500', // Vidas rojas
  xp: 'text-success-500', // XP Verde
};

export const StatBadge = forwardRef<HTMLDivElement, StatBadgeProps>(
  ({ type, value, icon, className = '', ...props }, ref) => {
    // Convertimos números largos a un formato legible
    const displayValue =
      value >= 10000 ? `${(value / 1000).toFixed(1)}k` : value;

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-surface-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer select-none active:scale-95 active:translate-y-0 active:shadow-none ${className}`}
        {...props}
      >
        <div className="flex items-center justify-center shrink-0 w-6 h-6">
          {icon}
        </div>
        <span
          className={`text-[15px] font-extrabold tracking-tight ${typeColorClasses[type]}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          {displayValue}
        </span>
      </div>
    );
  }
);

StatBadge.displayName = 'StatBadge';
