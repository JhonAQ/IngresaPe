import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

export type MapNodeStatus = 'locked' | 'current' | 'completed';
export type MapNodeColor = 'primary' | 'success' | 'warning' | 'error';

export interface MapNodeProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  status?: MapNodeStatus;
  icon: ReactNode;
  /** Permite sobreescribir el color si la isla "actual" debe ser de otra familia semántica */
  currentColor?: MapNodeColor;
}

const statusColorClasses: Record<
  MapNodeColor | 'locked' | 'completed',
  string
> = {
  completed: 'bg-success-500 shadow-success-600 text-white',
  locked: 'bg-surface-100 shadow-surface-300 text-surface-400',
  // Variantes para cuando el nodo está "current"
  primary: 'bg-primary-500 shadow-primary-600 text-white',
  success: 'bg-success-500 shadow-success-600 text-white',
  warning: 'bg-warning-500 shadow-warning-600 text-white',
  error: 'bg-error-500 shadow-error-600 text-white',
};

export const MapNode = forwardRef<HTMLButtonElement, MapNodeProps>(
  (
    {
      status = 'locked',
      icon,
      currentColor = 'warning',
      className = '',
      ...props
    },
    ref
  ) => {
    const isCurrent = status === 'current';
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';

    // Determinar qué color semántico usar
    const colorKey = isCompleted
      ? 'completed'
      : isLocked
      ? 'locked'
      : currentColor;
    const themeClasses = statusColorClasses[colorKey];

    // Base: Circular (rounded-pill), tamaño fijo 68x68, transición y sombra gruesa 3D (shadow-3d-lg)
    let buttonClasses = `relative z-10 w-[68px] h-[68px] rounded-pill flex items-center justify-center transition-all duration-100 outline-none shadow-3d-lg ${themeClasses}`;

    if (!isLocked) {
      // Táctil sólo si no está bloqueado: Aplasta la sombra y lo hunde 6px (coincide con shadow-3d-lg)
      buttonClasses +=
        ' active:translate-y-[6px] active:shadow-none cursor-pointer hover:brightness-110';
    } else {
      // Bloqueado: Sombra estática, sin interacciones de hundimiento
      buttonClasses += ' cursor-not-allowed opacity-90';
    }

    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Efecto Domino/Ripple si la lección es la Actual (Vibe exacto de Duolingo) */}
        {isCurrent && (
          <>
            <div className="absolute w-[88px] h-[88px] bg-white rounded-pill z-0 shadow-surface-200 shadow-3d-sm border-2 border-surface-100" />
            <div className="absolute w-[88px] h-[88px] rounded-pill border-[4px] border-surface-200 animate-ripple-pro z-0" />
          </>
        )}

        <button
          ref={ref}
          disabled={isLocked}
          className={buttonClasses}
          {...props}
        >
          {icon}
        </button>
      </div>
    );
  }
);

MapNode.displayName = 'MapNode';
