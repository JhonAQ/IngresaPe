'use client';

import { AdminGuard } from '../../../components/admin/AdminGuard';
import { AdminShell } from '../../../components/admin/AdminShell';
import { AdminMockDataProvider } from '../../../hooks/admin/useAdminMockData';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminMockDataProvider>
        <AdminShell>{children}</AdminShell>
      </AdminMockDataProvider>
    </AdminGuard>
  );
}
