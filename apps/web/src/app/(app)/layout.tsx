'use client';

import React from 'react';
import { DashboardHeader } from '../../components/dashboard/Header';
import { BottomNav } from '../../components/dashboard/BottomNav';
import { useDashboardData } from '../../hooks/useDashboardData';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { DashboardSkeleton } from '../../components/ui/skeleton';
import { ImmersiveOverlayProvider, useImmersiveOverlay } from '../../components/dashboard/ImmersiveOverlayContext';
import { DashboardCourseProvider, useDashboardCourse } from '../../components/dashboard/DashboardCourseContext';
import { AttemptsHistoryOverlay } from '../../components/simulacros/AttemptsHistoryOverlay';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useDashboardData();
  const { isOpen, open } = useImmersiveOverlay();
  const selectedCourse = useDashboardCourse();

  return (
    <AuthGuard>
      {isLoading || !data.stats ? (
        <DashboardSkeleton />
      ) : (
        <div
          className="w-full max-w-md mx-auto relative flex flex-col overflow-hidden bg-white shadow-2xl border-x border-slate-100"
          style={{ height: '100dvh' }}
        >
          <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none opacity-50" />

          {!isOpen && (
            <DashboardHeader
              stats={data.stats}
              selectedCourse={selectedCourse}
              onOpenCourseSelector={() => open('courseSelector')}
            />
          )}

          <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
            {children}
          </div>

          <AttemptsHistoryOverlay />

          {!isOpen && <BottomNav />}
        </div>
      )}
    </AuthGuard>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImmersiveOverlayProvider>
      <DashboardCourseProvider>
        <LayoutContent>{children}</LayoutContent>
      </DashboardCourseProvider>
    </ImmersiveOverlayProvider>
  );
}
