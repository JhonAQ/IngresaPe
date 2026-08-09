'use client';

import { usePathname } from 'next/navigation';
import { Menu, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/content': 'Contenido',
  '/admin/support': 'Soporte técnico',
  '/admin/reported-questions': 'Preguntas reportadas',
  '/admin/bugs': 'Bugs de beta',
  '/admin/notifications': 'Notificaciones push',
  '/admin/subscriptions': 'Suscripciones',
  '/admin/analytics': 'Analíticas',
  '/admin/users': 'Usuarios',
  '/admin/dev': 'Dev tools',
};

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Admin';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b-2 border-surface-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden w-10 h-10 rounded-xl bg-surface-100 text-surface-600 flex items-center justify-center"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[16px] font-black text-surface-800 leading-tight">
                {title}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">
                Panel de control
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-[11px] font-black uppercase tracking-wider">
            <Shield size={12} strokeWidth={3} />
            {user?.role ?? 'ADMIN'}
          </span>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-black text-surface-500 hover:bg-surface-100 transition-colors"
          >
            <LogOut size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
