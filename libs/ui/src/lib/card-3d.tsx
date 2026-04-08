import { HTMLAttributes, forwardRef } from 'react';

export type Card3DVariant = 'surface' | 'primary' | 'success';
export type Card3DPadding = 'none' | 'sm' | 'md' | 'lg';

export interface Card3DProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Card3DVariant;
  padding?: Card3DPadding;
}

const variantClasses: Record<Card3DVariant, string> = {
  // Surface: Tarjeta blanca clásica flotante para contenido (listas interactuables, formularios)
  surface:
    'bg-white border-2 border-surface-100 shadow-surface-200 text-surface-800',
  // Primary: Tarjeta de marca (ej. resumen de lección)
  primary: 'bg-primary-500 text-white shadow-primary-600 border-none',
  // Success: Tarjeta de logro/felicitación
  success: 'bg-success-500 text-white shadow-success-600 border-none',
};

const paddingClasses: Record<Card3DPadding, string> = {
  none: 'p-0',
  sm: 'p-4', // 16px
  md: 'p-6', // 24px
  lg: 'p-8', // 32px
};

export const Card3D = forwardRef<HTMLDivElement, Card3DProps>(
  (
    { variant = 'surface', padding = 'md', className = '', children, ...props },
    ref
  ) => {
    // Base de la tarjeta: Radio grande (24px) y Sombra Larga (6px) para dar sensación de bloque estático pero profundo
    const baseClasses =
      'rounded-card shadow-3d-lg relative overflow-hidden transition-all';

    const classes = [
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {/* Efecto Glossy/Brillo automático en la esquina superior para tarjetas de color fuerte (vibe EdTech) */}
        {(variant === 'primary' || variant === 'success') && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        )}
        {/* Envolvemos el contenido en un z-index para que el resplandor no hunda interacciones */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

Card3D.displayName = 'Card3D';
