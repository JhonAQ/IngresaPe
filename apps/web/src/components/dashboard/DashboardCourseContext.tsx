'use client';

import React, { createContext, useContext, useState } from 'react';

export interface DashboardSelectedCourse {
  id: string;
  name: string;
  iconUrl?: string;
}

interface DashboardCourseContextValue {
  selectedCourse: DashboardSelectedCourse | null;
  setSelectedCourse: (course: DashboardSelectedCourse | null) => void;
}

const DashboardCourseContext = createContext<DashboardCourseContextValue | null>(null);

export function DashboardCourseProvider({ children }: { children: React.ReactNode }) {
  const [selectedCourse, setSelectedCourse] = useState<DashboardSelectedCourse | null>(null);

  return (
    <DashboardCourseContext.Provider value={{ selectedCourse, setSelectedCourse }}>
      {children}
    </DashboardCourseContext.Provider>
  );
}

export function useDashboardCourse() {
  const ctx = useContext(DashboardCourseContext);
  if (!ctx) {
    throw new Error('useDashboardCourse debe usarse dentro de DashboardCourseProvider');
  }
  return ctx.selectedCourse;
}

export function useSetDashboardCourse() {
  const ctx = useContext(DashboardCourseContext);
  if (!ctx) {
    throw new Error('useSetDashboardCourse debe usarse dentro de DashboardCourseProvider');
  }
  return ctx.setSelectedCourse;
}
