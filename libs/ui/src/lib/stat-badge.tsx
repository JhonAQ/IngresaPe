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
  streak: 'text-warning-500 fill-warning-500', // Naranja/Fuego = Warning
  gem: 'text-primary-500 fill-primary-500', // Gemas azules = Primary
  heart: 'text-error-500 fill-error-500', // Vidas rojas = Error
  xp: 'text-success-500 fill-success-500', // XP Verde = Success (o podría ser warning también según prefieras)
};

export const StatBadge = forwardRef<HTMLDivElement, StatBadgeProps>(
  ({ type, value, icon, className = '', ...props }, ref) => {
    // Convertimos números largos a un formato legible si se requiere (ej. 1500 -> 1.5k)
    // Para escalar a Duolingo style si los números crecen mucho
    const displayValue =
      value >= 10000 ? `${(value / 1000).toFixed(1)}k` : value;

    return (
      <div
        ref={ref}
        className={`flex items-center gap-1.5 font-bold ${className}`}
        {...props}
      >
        {/* Envolvemos el ícono forzando a que herede el color por la clase combinada (fill y text) */}
        <div
          className={`flex items-center justify-center ${typeColorClasses[type]}`}
        >
          {icon}
        </div>
        {/* El texto según tus reglas usa color negro de superficie o adopta el color semántico (usaremos el semántico como Duolingo) */}
        <span
          className={`text-lg font-black tracking-tight ${
            typeColorClasses[type].split(' ')[0]
          }`}
        >
          {displayValue}
        </span>
      </div>
    );
  }
);

StatBadge.displayName = 'StatBadge';
