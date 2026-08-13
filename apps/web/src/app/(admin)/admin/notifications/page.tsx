'use client';

import { useMemo, useState } from 'react';
import { Bell, Send, Copy, Trash2, Clock, Smartphone } from 'lucide-react';
import { useAdminMockData } from '../../../../hooks/admin/useAdminMockData';
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from '../../../../components/admin/AdminTable';
import { Badge } from '../../../../components/admin/Badge';
import { Button3D } from '@ingresa-pe/ui';
import { Card3D } from '@ingresa-pe/ui';
import { AdminTabs } from '../../../../components/admin/AdminTabs';
import type {
  NotificationAudience,
  NotificationStatus,
  PushNotification,
} from '../../../../lib/admin/types';

const audienceLabels: Record<NotificationAudience, string> = {
  all: 'Todos',
  free: 'Free',
  premium: 'Premium',
  inactive: 'Inactivos',
  career: 'Por carrera',
};

const statusLabels: Record<NotificationStatus, string> = {
  scheduled: 'Programada',
  sent: 'Enviada',
  failed: 'Fallida',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminNotificationsPage() {
  const mock = useAdminMockData();
  const [tab, setTab] = useState<'composer' | 'history'>('composer');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState('/dashboard');
  const [audience, setAudience] = useState<NotificationAudience>('all');
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState('');

  const history = useMemo(() => {
    return [...mock.notifications].sort(
      (a, b) =>
        new Date(b.scheduledAt ?? b.sentAt ?? 0).getTime() -
        new Date(a.scheduledAt ?? a.sentAt ?? 0).getTime()
    );
  }, [mock.notifications]);

  const addNotification = () => {
    if (!title.trim() || !body.trim()) return;
    const now = new Date().toISOString();
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      deepLink: deepLink.trim() || undefined,
      audience,
      status: sendMode === 'now' ? 'sent' : 'scheduled',
      sentAt: sendMode === 'now' ? now : undefined,
      scheduledAt: sendMode === 'schedule' ? scheduledAt || now : undefined,
    };
    mock.setData((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
    mock.logAction(
      sendMode === 'now' ? 'envió notificación' : 'programó notificación',
      title.trim()
    );
    setTitle('');
    setBody('');
    setDeepLink('/dashboard');
    setAudience('all');
    setSendMode('now');
    setScheduledAt('');
    setTab('history');
  };

  const duplicate = (n: PushNotification) => {
    const copy: PushNotification = {
      ...n,
      id: `notif-${Date.now()}`,
      status: 'scheduled',
      sentAt: undefined,
      scheduledAt: new Date().toISOString(),
    };
    mock.setData((prev) => ({
      ...prev,
      notifications: [copy, ...prev.notifications],
    }));
    mock.logAction('duplicó notificación', n.title);
  };

  const remove = (id: string) => {
    mock.setData((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
    mock.logAction('eliminó notificación', id);
  };

  return (
    <div className="space-y-6">
      <AdminTabs
        tabs={[
          { value: 'composer', label: 'Componer' },
          { value: 'history', label: 'Historial' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'composer' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card3D variant="surface" padding="md">
            <h2 className="text-[16px] font-black text-surface-800 mb-4">
              Nueva notificación push
            </h2>
            <div className="space-y-4">
              <Field label="Título">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Nuevo simulacro este fin de semana"
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500"
                />
              </Field>
              <Field label="Cuerpo">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Mensaje corto que verá el usuario..."
                  className="w-full h-24 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </Field>
              <Field label="Deep link">
                <input
                  type="text"
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  placeholder="/simulacros"
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500"
                />
              </Field>
              <Field label="Audiencia">
                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value as NotificationAudience)
                  }
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
                >
                  {Object.entries(audienceLabels).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[13px] font-bold text-surface-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={sendMode === 'now'}
                    onChange={() => setSendMode('now')}
                    className="w-5 h-5 accent-primary-500"
                  />
                  Enviar ahora
                </label>
                <label className="flex items-center gap-2 text-[13px] font-bold text-surface-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={sendMode === 'schedule'}
                    onChange={() => setSendMode('schedule')}
                    className="w-5 h-5 accent-primary-500"
                  />
                  Programar
                </label>
              </div>

              {sendMode === 'schedule' && (
                <Field label="Fecha y hora">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </Field>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button3D
                  variant="primary"
                  size="md"
                  onClick={addNotification}
                  disabled={!title.trim() || !body.trim()}
                >
                  <Send size={16} className="mr-2" />
                  {sendMode === 'now' ? 'Enviar notificación' : 'Programar'}
                </Button3D>
                <Button3D
                  variant="surface"
                  size="md"
                  onClick={() =>
                    alert(`Prueba enviada a ti: ${title}\n${body}`)
                  }
                  disabled={!title.trim() || !body.trim()}
                >
                  <Bell size={16} className="mr-2" />
                  Enviar prueba a mí
                </Button3D>
              </div>
            </div>
          </Card3D>

          {/** Preview */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Smartphone size={18} className="text-surface-400" />
                <span className="text-[12px] font-black uppercase tracking-wider text-surface-400">
                  Vista previa
                </span>
              </div>
              <Card3D
                variant="surface"
                padding="md"
                className="border-l-4 border-l-primary-500"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0">
                    <Bell size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-surface-800 truncate">
                      {title.trim() || 'Título de la notificación'}
                    </p>
                    <p className="text-[12px] font-bold text-surface-600 leading-snug">
                      {body.trim() ||
                        'Aquí aparecerá el cuerpo del mensaje push.'}
                    </p>
                    <p className="text-[10px] font-bold text-surface-400 mt-1 truncate">
                      {deepLink || 'Sin deep link'} · {audienceLabels[audience]}
                    </p>
                  </div>
                </div>
              </Card3D>
            </div>
          </div>
        </div>
      ) : (
        <Card3D variant="surface" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-black text-surface-800">
              Historial
            </h2>
            <span className="text-[11px] font-black uppercase tracking-wider text-surface-400">
              {history.length} notificaciones
            </span>
          </div>
          <AdminTable
            empty={history.length === 0}
            columns={[
              { key: 'title', label: 'Notificación' },
              { key: 'audience', label: 'Audiencia', width: '110px' },
              { key: 'status', label: 'Estado', width: '110px' },
              { key: 'date', label: 'Fecha', width: '140px' },
              { key: 'actions', label: 'Acciones', width: '120px' },
            ]}
          >
            {history.map((n) => (
              <AdminTableRow key={n.id}>
                <AdminTableCell>
                  <div className="leading-tight">
                    <div className="text-[13px] font-black text-surface-800 truncate">
                      {n.title}
                    </div>
                    <div className="text-[11px] font-bold text-surface-400 truncate">
                      {n.body}
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="text-[12px] font-bold text-surface-500">
                    {audienceLabels[n.audience]}
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <Badge
                    variant={
                      n.status === 'sent'
                        ? 'success'
                        : n.status === 'scheduled'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {statusLabels[n.status]}
                  </Badge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1 text-[12px] font-bold text-surface-500">
                    <Clock size={12} />
                    {formatDate(n.sentAt ?? n.scheduledAt)}
                  </div>
                </AdminTableCell>
                <AdminTableCell width="120px">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => duplicate(n)}
                      className="w-9 h-9 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(n.id)}
                      className="w-9 h-9 rounded-xl bg-error-100 text-error-500 flex items-center justify-center hover:bg-error-200 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        </Card3D>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
