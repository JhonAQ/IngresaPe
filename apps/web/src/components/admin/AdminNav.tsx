'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Headphones,
  AlertCircle,
  Bug,
  Bell,
  CreditCard,
  BarChart3,
  Wrench,
  Users,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Contenido', icon: Newspaper },
  { href: '/admin/support', label: 'Soporte', icon: Headphones },
  { href: '/admin/reported-questions', label: 'Preguntas', icon: AlertCircle },
  { href: '/admin/bugs', label: 'Bugs', icon: Bug },
  { href: '/admin/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/admin/subscriptions', label: 'Suscripciones', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analíticas', icon: BarChart3 },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/dev', label: 'Dev', icon: Wrench },
];

interface AdminNavProps {
  onNavigate?: () => void;
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-black transition-all border-b-[4px] active:border-b-0 active:translate-y-[4px]',
              isActive
                ? 'bg-primary-500 text-white border-primary-600'
                : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-50'
            )}
          >
            <Icon size={20} strokeWidth={2.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
