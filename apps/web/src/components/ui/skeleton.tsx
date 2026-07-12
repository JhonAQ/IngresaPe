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
      <div className="h-24 rounded-2xl bg-slate-200 animate-pulse" />

      <div className="h-20 rounded-2xl bg-slate-200 animate-pulse" />

      <div className="sticky top-0 z-40 -mx-1 px-1 pt-2 pb-3 bg-slate-50/95 backdrop-blur-sm">
        <div className="h-20 rounded-2xl bg-slate-200 animate-pulse" />
      </div>

      <div className="space-y-8 py-4 flex flex-col items-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-[300px] h-40 rounded-2xl bg-slate-200 animate-pulse"
          />
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

/**
 * Layout de carga para el ranking.
 */
export function RankingSkeleton() {
  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-white">
      <div className="shrink-0 px-3 sm:px-4 pt-3 bg-white z-20 space-y-2">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar relative z-10 px-3 sm:px-4 pb-24 pt-3 space-y-3">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            <Skeleton className="h-10 w-full rounded-xl" />
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <Skeleton key={rowIndex} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

/**
 * Layout de carga para el perfil completo.
 */
export function ProfileSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto hide-scrollbar bg-slate-50 pb-8">
      {/* Header */}
      <div className="bg-success-200 pt-8 pb-14 px-5 rounded-b-[2.5rem] flex flex-col items-center gap-4">
        <SkeletonCircle size={100} />
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-4 -mt-8 relative z-20">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] px-3 py-3 flex flex-col items-center gap-2"
          >
            <SkeletonCircle size={28} />
            <Skeleton className="h-5 w-10 rounded-lg" />
            <Skeleton className="h-3 w-14 rounded-full" />
          </div>
        ))}
      </div>

      {/* Level card */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonCircle size={40} />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-3 w-16 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-6 w-12 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>
      </div>

      {/* ADN + Trophies */}
      <div className="px-5 mt-6 space-y-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </main>
  );
}

/**
 * Layout de carga para la lista de cursos.
 */
export function CourseListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
      <div className="flex-1 p-5 pb-bottom-nav space-y-6">
        <Skeleton className="h-10 w-3/4 mx-auto rounded-2xl" />

        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t-2 border-slate-100 px-4 py-4 z-30">
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Layout de carga para la pantalla de simulacros.
 */
export function SimulacrosSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto pt-6 pb-32 hide-scrollbar relative">
      {/* GoalCard */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-[1.8rem] p-4 border-2 border-slate-200 border-b-[6px] border-b-slate-300 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-3 w-20 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-4 w-full bg-slate-200 rounded-full animate-pulse mb-2" />
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-3 w-20 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* AIExamCard */}
      <div className="px-5 mb-8">
        <div className="bg-[#020617] rounded-[2rem] p-5 border-2 border-slate-800 border-b-[8px] border-b-black">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-28 bg-slate-800 rounded-xl animate-pulse" />
            <div className="w-6 h-6 bg-slate-800 rounded-full animate-pulse" />
          </div>
          <div className="h-6 w-40 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-3 w-48 bg-slate-800 rounded-lg animate-pulse mb-5" />

          <div className="space-y-3 mb-6">
            {Array.from({ length: 2 }).map((_, row) => (
              <div key={row} className="flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
                <div className="flex gap-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-9 h-7 bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="h-4 w-44 bg-slate-800 rounded animate-pulse mb-4" />
          <div className="h-12 w-full bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>

      {/* HistoryArchive */}
      <div className="mb-8">
        <div className="flex justify-between items-end px-7 mb-3">
          <div className="h-3 w-36 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-14 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="mx-5 overflow-hidden">
          <div className="flex overflow-x-auto hide-scrollbar gap-4 px-1 pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[135px] h-[180px] bg-white rounded-[1.5rem] border-2 border-slate-200 border-b-[6px] border-b-slate-300 p-3.5 flex flex-col shadow-sm"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse mb-2" />
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="h-4 w-14 bg-slate-200 rounded animate-pulse mb-auto" />
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-full bg-slate-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RecentAttempts */}
      <div className="px-5 pb-12">
        <div className="flex justify-between items-end mb-4">
          <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[2rem] border-2 border-slate-100 border-b-[6px] border-b-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-5 pt-5 pb-3 flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-5 w-16 bg-slate-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse" />
                </div>
                <div className="h-14 w-16 bg-slate-200 rounded-2xl animate-pulse" />
              </div>
              <div className="px-5 py-3 flex items-center gap-6 border-y border-slate-50 bg-slate-50/50">
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="p-4 flex gap-3">
                <div className="flex-1 h-11 bg-slate-200 rounded-2xl animate-pulse" />
                <div className="w-12 h-12 bg-slate-200 rounded-2xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
