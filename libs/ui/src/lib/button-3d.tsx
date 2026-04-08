import { ButtonHTMLAttributes, forwardRef } from 'react';

export type Button3DVariant =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'surface';
export type Button3DSize = 'sm' | 'md' | 'lg';

export interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Button3DVariant;
  size?: Button3DSize;
  fullWidth?: boolean;
}

const variantClasses: Record<Button3DVariant, string> = {
  primary: 'bg-primary-500 text-white shadow-primary-600',
  success: 'bg-success-500 text-white shadow-success-600',
  error: 'bg-error-500 text-white shadow-error-600',
  warning: 'bg-warning-500 text-white shadow-warning-600',
  // Surface es un caso especial para botones secundarios o cancelaciones
  surface:
    'bg-surface-100 text-surface-600 shadow-surface-300 border-2 border-surface-200',
};

const sizeClasses: Record<Button3DSize, string> = {
  sm: 'px-4 py-2 text-sm shadow-3d-sm active:translate-y-[2px] rounded-xl',
  md: 'px-6 py-3 text-base shadow-3d-md active:translate-y-[4px] rounded-2xl',
  lg: 'px-8 py-4 text-lg shadow-3d-lg active:translate-y-[6px] rounded-2xl font-bold',
};

export const Button3D = forwardRef<HTMLButtonElement, Button3DProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Clases base transversales a todos los botones 3D
    const baseClasses =
      'inline-flex items-center justify-center font-bold outline-none transition-all active:shadow-none';

    const widthClass = fullWidth ? 'w-full' : '';

    // Si está deshabilitado, anulamos la sombra visualmente y lo fogueamos
    const disabledClasses = disabled
      ? 'opacity-60 cursor-not-allowed transform translate-y-[4px] !shadow-none'
      : 'cursor-pointer';

    // Ensamblamos todas las clases
    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClass,
      disabledClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} disabled={disabled} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button3D.displayName = 'Button3D';
