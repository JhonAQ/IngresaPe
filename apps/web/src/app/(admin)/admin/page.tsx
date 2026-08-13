'use client';

import Link from 'next/link';
import {
  Users,
  Activity,
  Headphones,
  Bug,
  CreditCard,
  Plus,
  Bell,
  BarChart3,
  Newspaper,
  Clock,
} from 'lucide-react';
import { StatCard } from '../../../components/admin/StatCard';
import { Card3D } from '@ingresa-pe/ui';
import { useAdminMockData } from '../../../hooks/admin/useAdminMockData';
import { Button3D } from '@ingresa-pe/ui';

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return 'ahora';
  if (diff < 60) return `hace ${diff} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function AdminDashboardPage() {
  const data = useAdminMockData();

  const pendingItems = [
    ...data.tickets
      .filter((t) => t.status === 'open' || t.status === 'in_progress')
      .map((t) => ({
        id: t.id,
        type: 'Soporte' as const,
        text: `${t.userName}: ${t.subject}`,
        href: '/admin/support',
      })),
    ...data.reportedQuestions
      .filter((q) => q.status === 'pending' || q.status === 'reviewed')
      .map((q) => ({
        id: q.id,
        type: 'Pregunta' as const,
        text: q.statement,
        href: '/admin/reported-questions',
      })),
    ...data.bugs
      .filter((b) => b.status === 'open' || b.status === 'in_progress')
      .map((b) => ({
        id: b.id,
        type: 'Bug' as const,
        text: b.title,
        href: '/admin/bugs',
      })),
  ].slice(0, 6);

  const quickActions = [
    {
      href: '/admin/content',
      label: 'Crear noticia',
      icon: Newspaper,
      variant: 'primary' as const,
    },
    {
      href: '/admin/notifications',
      label: 'Enviar notificación',
      icon: Bell,
      variant: 'primary' as const,
    },
    {
      href: '/admin/dev',
      label: 'Nueva pregunta',
      icon: Plus,
      variant: 'success' as const,
    },
    {
      href: '/admin/users',
      label: 'Crear usuario',
      icon: Users,
      variant: 'success' as const,
    },
    {
      href: '/admin/subscriptions',
      label: 'Ver suscripciones',
      icon: CreditCard,
      variant: 'warning' as const,
    },
    {
      href: '/admin/analytics',
      label: 'Ver analíticas',
      icon: BarChart3,
      variant: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/** KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Usuarios totales"
          value={data.analytics.totalUsers.toLocaleString('es-PE')}
          icon={Users}
          delta={`+${data.analytics.newThisWeek} esta semana`}
        />
        <StatCard
          label="Activos hoy"
          value={data.analytics.activeToday.toLocaleString('es-PE')}
          icon={Activity}
          delta="Últimas 24h"
          variant="success"
        />
        <StatCard
          label="Tickets abiertos"
          value={data.tickets.filter((t) => t.status === 'open').length}
          icon={Headphones}
          variant="warning"
        />
        <StatCard
          label="Bugs abiertos"
          value={data.bugs.filter((b) => b.status === 'open').length}
          icon={Bug}
          variant="error"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/** Pending queue */}
        <Card3D variant="surface" padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-black text-surface-800">
              Trabajo pendiente
            </h2>
            <span className="text-[11px] font-black uppercase tracking-wider text-surface-400">
              {pendingItems.length} items
            </span>
          </div>
          {pendingItems.length === 0 ? (
            <p className="text-[14px] font-bold text-surface-400 text-center py-8">
              ¡Todo al día! No hay items pendientes.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-surface-50 hover:bg-surface-100 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-primary-100 text-primary-600 shrink-0">
                    {item.type}
                  </span>
                  <span className="text-[13px] font-bold text-surface-700 truncate">
                    {item.text}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card3D>

        {/** Recent activity */}
        <Card3D variant="surface" padding="md">
          <h2 className="text-[16px] font-black text-surface-800 mb-4">
            Actividad reciente
          </h2>
          <div className="space-y-3">
            {data.activityLog.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-surface-400" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-surface-700 leading-snug">
                    {log.actor} {log.action} {log.target}
                  </p>
                  <p className="text-[11px] font-bold text-surface-400">
                    {formatRelative(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card3D>
      </div>

      {/** Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button3D
              variant={action.variant}
              size="md"
              fullWidth
              className="h-full flex-col gap-2 py-5"
            >
              <action.icon size={24} />
              <span className="text-[12px]">{action.label}</span>
            </Button3D>
          </Link>
        ))}
      </div>
    </div>
  );
}
