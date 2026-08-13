'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadMockData, saveMockData } from '../../lib/admin/mockData';
import type { AdminMockData, Updater } from '../../lib/admin/types';

interface AdminMockContextValue extends AdminMockData {
  isLoading: boolean;
  setData: (updater: Updater<AdminMockData>) => void;
  logAction: (action: string, target: string) => void;
}

const AdminMockContext = createContext<AdminMockContextValue | null>(null);

export function AdminMockDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setInternalData] = useState<AdminMockData | null>(null);

  useEffect(() => {
    setInternalData(loadMockData());
  }, []);

  const setData = useCallback((updater: Updater<AdminMockData>) => {
    setInternalData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveMockData(next);
      return next;
    });
  }, []);

  const logAction = useCallback(
    (action: string, target: string) => {
      setData((prev) => ({
        ...prev,
        activityLog: [
          {
            id: `log-${Date.now()}`,
            actor: 'Admin',
            action,
            target,
            createdAt: new Date().toISOString(),
          },
          ...prev.activityLog.slice(0, 49),
        ],
      }));
    },
    [setData]
  );

  const value = useMemo(() => {
    if (!data) {
      return {
        ...loadMockData(),
        isLoading: true,
        setData,
        logAction,
      };
    }
    return { ...data, isLoading: false, setData, logAction };
  }, [data, setData, logAction]);

  return (
    <AdminMockContext.Provider value={value}>
      {children}
    </AdminMockContext.Provider>
  );
}

export function useAdminMockData() {
  const ctx = useContext(AdminMockContext);
  if (!ctx) {
    throw new Error(
      'useAdminMockData must be used within AdminMockDataProvider'
    );
  }
  return ctx;
}
