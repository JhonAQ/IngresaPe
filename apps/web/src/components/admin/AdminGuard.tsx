'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { AdminSkeleton } from './AdminSkeleton';

interface AdminGuardProps {
  children: React.ReactNode;
  allowDataEntry?: boolean;
}

export function AdminGuard({
  children,
  allowDataEntry = false,
}: AdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const role = user?.role;
    const allowed =
      role === 'ADMIN' || (allowDataEntry && role === 'DATA_ENTRY');

    if (!allowed) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, allowDataEntry, router]);

  if (isLoading || !isAuthenticated) {
    return <AdminSkeleton />;
  }

  const role = user?.role;
  const allowed = role === 'ADMIN' || (allowDataEntry && role === 'DATA_ENTRY');

  if (!allowed) {
    return <AdminSkeleton />;
  }

  return <>{children}</>;
}
