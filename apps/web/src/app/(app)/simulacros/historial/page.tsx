'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '../../../../utils/trpc';
import { RecentAttempts } from '../../../../components/simulacros';

export default function AttemptsHistoryPage() {
  const { data: attempts, isLoading } = trpc.simulacro.getRecentAttempts.useQuery();

  return (
    <main className="flex-1 overflow-y-auto px-5 pt-6 pb-32 hide-scrollbar relative">
      <Link
        href="/simulacros"
        className="inline-flex items-center gap-2 text-blue-500 font-black text-[13px] uppercase mb-4"
      >
        <ArrowLeft size={18} strokeWidth={3} /> Volver
      </Link>

      <h1 className="font-black text-slate-800 text-[26px] mb-6 leading-tight">
        Historial de intentos
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 rounded-[2rem] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <RecentAttempts
          attempts={attempts ?? []}
          title="Todos tus intentos"
        />
      )}
    </main>
  );
}
