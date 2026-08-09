'use client';

import { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminNav } from './AdminNav';
import { AdminDrawer } from './AdminDrawer';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50">
      {/** Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 flex-col bg-white border-r-2 border-surface-200 z-40">
        <div className="h-16 flex items-center px-5 border-b-2 border-surface-200">
          <span className="text-[18px] font-black text-primary-600">
            Ingresa.pe
          </span>
          <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-surface-400 bg-surface-100 px-2 py-1 rounded-full">
            Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <AdminNav />
        </div>
      </aside>

      {/** Main area */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/** Mobile drawer */}
      <AdminDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Menú admin"
        width="md"
      >
        <AdminNav onNavigate={() => setMobileOpen(false)} />
      </AdminDrawer>
    </div>
  );
}
