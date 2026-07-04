import type { ComponentPropsWithoutRef } from 'react';
import SkeletonPrimitive from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { cn } from '../../lib/utils';

const BASE_COLOR = '#e2e8f0';
const HIGHLIGHT_COLOR = '#f1f5f9';

export function Skeleton({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SkeletonPrimitive>) {
  return (
    <SkeletonPrimitive
      baseColor={BASE_COLOR}
      highlightColor={HIGHLIGHT_COLOR}
      className={cn('leading-none', className)}
      {...props}
    />
  );
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
        <div key={i} className={i === 0 ? 'w-3/4' : 'w-full'}>
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Avatar circular.
 */
export function SkeletonCircle({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Skeleton
      circle
      height={size}
      width={size}
      className={className}
    />
  );
}

/**
 * Tarjeta con imagen/encabezado y líneas de contenido.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle size={40} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
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
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm h-24">
        <Skeleton height="100%" className="w-full rounded-xl" />
      </div>

      <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm h-20">
        <Skeleton height="100%" className="w-full rounded-xl" />
      </div>

      <div className="sticky top-0 z-40 -mx-1 px-1 pt-2 pb-3 bg-slate-50/95 backdrop-blur-sm">
        <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm h-20">
          <Skeleton height="100%" className="w-full rounded-xl" />
        </div>
      </div>

      <div className="space-y-8 py-4 flex flex-col items-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-[300px] h-40 rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"
          >
            <Skeleton height="100%" className="w-full rounded-xl" />
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
      <Skeleton className="h-6 w-1/2 mb-8" />

      <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm mb-6 h-48">
        <Skeleton height="100%" className="w-full rounded-xl" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl border-2 border-slate-100 bg-white shadow-sm p-3"
          >
            <Skeleton height="100%" className="w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}
