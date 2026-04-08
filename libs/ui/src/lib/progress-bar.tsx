import { HTMLAttributes, forwardRef } from 'react';

export type ProgressBarColor = 'primary' | 'success' | 'warning' | 'error';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Porcentaje de progreso de 0 a 100 */
  progress: number;
  /** Color del indicador de la barra. Por defecto es verde (success) */
  indicatorColor?: ProgressBarColor;
  /** Grosor de la barra */
  size?: ProgressBarSize;
}

const colorClasses: Record<ProgressBarColor, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

const sizeClasses: Record<ProgressBarSize, string> = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-6',
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      progress,
      indicatorColor = 'success',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    // Blindamos la prop matemática para que nunca rompa el width CSS (debe ser siempre entre 0 y 100)
    const clampedProgress = Math.min(Math.max(Math.round(progress), 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full bg-surface-200 rounded-pill overflow-hidden flex items-start ${sizeClasses[size]} ${className}`}
        {...props}
      >
        <div
          className={`h-full rounded-pill relative overflow-hidden transition-all duration-500 ease-out ${colorClasses[indicatorColor]}`}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* El toque Duolingo: Brillo superior para volumen cilíndrico / Glossy Effect de luz */}
          <div className="absolute top-[10%] left-2 right-2 h-[30%] bg-white/20 rounded-pill pointer-events-none" />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
