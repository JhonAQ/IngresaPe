import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'card' | 'text';
}

/**
 * Skeleton base con animación de pulso.
 * Úsalo directamente o con los helpers de abajo.
 */
export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const base = 'animate-pulse bg-slate-200';
  const variants = {
    default: 'rounded-md',
    circle: 'rounded-full',
    card: 'rounded-2xl',
    text: 'rounded',
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}

/**
 * Líneas de texto con alturas típicas de párrafo/título.
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === 0 ? 'h-4 w-3/4' : 'h-4 w-full'}
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}

/**
 * Avatar circular.
 */
export function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton variant="circle" className={cn('h-10 w-10', className)} />;
}

/**
 * Tarjeta con imagen/encabezado y líneas de contenido.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm', className)}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-1/2" />
          <Skeleton variant="text" className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

/**
 * Layout de carga para una página completa tipo dashboard.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4 p-5 pb-32 overflow-y-auto hide-scrollbar bg-slate-50/50">
      <Skeleton variant="card" className="h-24 w-full" />
      <Skeleton variant="card" className="h-20 w-full" />

      <div className="space-y-6 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            <Skeleton variant="card" className="h-40 w-[300px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Layout de carga para el motor de preguntas.
 */
export function EngineSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] flex flex-col px-5 pt-6 pb-32 bg-white">
      <Skeleton variant="text" className="h-6 w-1/2 mb-8" />
      <Skeleton variant="card" className="h-48 w-full mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
