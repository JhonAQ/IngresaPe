'use client';

import React from 'react';
import { DashboardHeader } from '../../components/dashboard/Header';
import { BottomNav } from '../../components/dashboard/BottomNav';
import { useDashboardData } from '../../hooks/useDashboardData';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useDashboardData();

  if (isLoading || !data.stats) {
    return (
      <div className="w-full h-dvh flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-md mx-auto relative flex flex-col overflow-hidden font-sans bg-white shadow-2xl border-x border-slate-100"
      style={{ height: '100dvh' }}
    >
      <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none opacity-50"></div>

      {/* Top Section */}
      <div className="bg-white border-b-2 border-slate-200 shrink-0 z-40 relative flex flex-col pt-0">
        <DashboardHeader stats={data.stats} />
      </div>

      {/* Main Content Area - It's injected dynamically here based on the route */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {children}
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
