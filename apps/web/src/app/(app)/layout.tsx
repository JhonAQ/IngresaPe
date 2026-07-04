'use client';

import React from 'react';
import { DashboardHeader } from '../../components/dashboard/Header';
import { BottomNav } from '../../components/dashboard/BottomNav';
import { useDashboardData } from '../../hooks/useDashboardData';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { ImmersiveOverlayProvider, useImmersiveOverlay } from '../../components/dashboard/ImmersiveOverlayContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useDashboardData();
  const { isOpen } = useImmersiveOverlay();

  return (
    <AuthGuard>
      {isLoading || !data.stats ? (
        <div className="w-full h-dvh flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-duo-blue/20 border-t-duo-blue"></div>
            <span className="text-sm font-bold text-slate-400">Cargando...</span>
          </div>
        </div>
      ) : (
        <div
          className="w-full max-w-md mx-auto relative flex flex-col overflow-hidden bg-white shadow-2xl border-x border-slate-100"
          style={{ height: '100dvh' }}
        >
          <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none opacity-50" />

          {!isOpen && <DashboardHeader stats={data.stats} />}

          <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
            {children}
          </div>

          {!isOpen && <BottomNav />}
        </div>
      )}
    </AuthGuard>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImmersiveOverlayProvider>
      <LayoutContent>{children}</LayoutContent>
    </ImmersiveOverlayProvider>
  );
}
