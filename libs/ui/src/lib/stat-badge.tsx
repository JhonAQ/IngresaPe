import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { Zap } from 'lucide-react';
import { FlameIcon } from './icons/FlameIcon';
import { GemIcon } from './icons/GemIcon';

export type StatBadgeType = 'streak' | 'gem' | 'heart' | 'xp' | 'energy';

export interface StatBadgeProps extends HTMLAttributes<HTMLDivElement> {
  /** Tipo de estadística que dictará semánticamente los colores por defecto */
  type: StatBadgeType;
  /** El valor numérico a mostrar (ej. 450, 12, 5) */
  value: number;
  /** Permite pasar un ícono personalizado (ej. un componente Lucide o un SVG propio) */
  icon?: ReactNode;
}

const typeColorClasses: Record<StatBadgeType, string> = {
  streak: 'text-[#ff9600]', // Naranja fuego
  gem: 'text-[#1CB0F6]', // Cyan gema
  heart: 'text-[#ff4b4b]', // Vidas rojas
  xp: 'text-[#FFC800]', // Amarillo XP
  energy: 'text-[#FFC800]', // Amarillo/rayo para energía
};

export const StatBadge = forwardRef<HTMLDivElement, StatBadgeProps>(
  ({ type, value, icon, className = '', ...props }, ref) => {
    // Convertimos números largos a un formato legible
    const displayValue =
      value >= 10000 ? `${(value / 1000).toFixed(1)}k` : value;

    // Icono por defecto según el tipo
    const renderIcon = () => {
      if (icon) return icon;

      switch (type) {
        case 'streak':
          return <FlameIcon active={value > 0} />;
        case 'gem':
          return <GemIcon />;
        case 'energy':
          return <Zap size={20} className="fill-current" strokeWidth={2.5} />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={`flex items-center gap-1 cursor-pointer select-none hover:opacity-80 transition-opacity ${className}`}
        {...props}
      >
        <div className="flex items-center justify-center shrink-0 w-5 h-5">
          {renderIcon()}
        </div>
        <span
          className={`text-[16px] font-black tracking-tight ${
            type === 'streak' && value === 0
              ? 'text-slate-400'
              : typeColorClasses[type]
          }`}
          style={{ letterSpacing: '-0.02em' }}
        >
          {displayValue}
        </span>
      </div>
    );
  }
);

StatBadge.displayName = 'StatBadge';
