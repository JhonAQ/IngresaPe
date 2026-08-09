'use client';

import { useMemo, useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  DollarSign,
  Crown,
  Image as ImageIcon,
} from 'lucide-react';
import { trpc } from '../../../../utils/trpc';
import { useAdminMockData } from '../../../../hooks/admin/useAdminMockData';
import { useConfirm } from '../../../../hooks/useConfirm';
import { StatCard } from '../../../../components/admin/StatCard';
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from '../../../../components/admin/AdminTable';
import { Badge } from '../../../../components/admin/Badge';
import { SearchInput } from '../../../../components/admin/SearchInput';
import { AdminModal } from '../../../../components/admin/AdminModal';
import { ConfirmDialog } from '../../../../components/admin/ConfirmDialog';
import { Button3D } from '@ingresa-pe/ui';
import { Card3D } from '@ingresa-pe/ui';
import { ErrorState } from '../../../../components/admin/ErrorState';
import { AdminSkeleton } from '../../../../components/admin/AdminSkeleton';
import type { AdminUser } from '../../../../lib/admin/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMoney(amount: number) {
  return `S/ ${amount.toFixed(2)}`;
}

export default function AdminSubscriptionsPage() {
  const mock = useAdminMockData();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const {
    data: pending,
    isLoading,
    error,
    refetch,
  } = trpc.subscription.getPendingRequests.useQuery();

  const process = trpc.subscription.processRequest.useMutation({
    onSuccess: () => refetch(),
  });

  const filtered = useMemo(() => {
    if (!pending) return [];
    const term = search.trim().toLowerCase();
    if (!term) return pending;
    return pending.filter(
      (s) =>
        (s.user?.name ?? '').toLowerCase().includes(term) ||
        (s.user?.email ?? '').toLowerCase().includes(term) ||
        s.plan.toLowerCase().includes(term)
    );
  }, [pending, search]);

  const premiumUsers = useMemo(
    () => mock.users.filter((u) => u.isPremium).length,
    [mock.users]
  );

  if (isLoading) return <AdminSkeleton />;
  if (error) {
    return (
      <ErrorState
        title="No se pudieron cargar las solicitudes"
        message={error.message}
        action={
          <Button3D variant="primary" size="md" onClick={() => refetch()}>
            Reintentar
          </Button3D>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/** KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pendientes"
          value={filtered.length}
          icon={CreditCard}
          variant="warning"
        />
        <StatCard
          label="Aprobadas hoy"
          value={mock.analytics.approvedToday ?? 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          label="Ingresos mes"
          value={formatMoney(mock.analytics.revenueThisMonth ?? 0)}
          icon={DollarSign}
        />
        <StatCard
          label="Usuarios premium"
          value={premiumUsers}
          icon={Crown}
          variant="success"
        />
      </div>

      {/** Requests table */}
      <Card3D variant="surface" padding="md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-[16px] font-black text-surface-800">
            Solicitudes de suscripción
          </h2>
          <SearchInput
            placeholder="Buscar usuario, email o plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-72"
          />
        </div>

        <AdminTable
          empty={filtered.length === 0}
          columns={[
            { key: 'user', label: 'Usuario' },
            { key: 'plan', label: 'Plan', width: '110px' },
            { key: 'amount', label: 'Monto', width: '100px' },
            { key: 'voucher', label: 'Voucher', width: '100px' },
            { key: 'date', label: 'Fecha', width: '150px' },
            { key: 'actions', label: 'Acciones', width: '180px' },
          ]}
        >
          {filtered.map((s) => (
            <AdminTableRow key={s.id}>
              <AdminTableCell>
                <div className="leading-tight">
                  <div className="text-[13px] font-black text-surface-800 truncate">
                    {s.user?.name ?? '—'}
                  </div>
                  <div className="text-[11px] font-bold text-surface-400 truncate">
                    {s.user?.email ?? '—'}
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant={s.plan === 'ANNUAL' ? 'success' : 'info'}>
                  {s.plan === 'ANNUAL' ? 'Anual' : 'Mensual'}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>{formatMoney(s.amount)}</AdminTableCell>
              <AdminTableCell>
                {s.proofUrl ? (
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(s.proofUrl)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-black text-primary-600 hover:text-primary-700"
                  >
                    <ImageIcon size={14} /> Ver voucher
                  </button>
                ) : (
                  <span className="text-[12px] font-bold text-surface-400">
                    Sin voucher
                  </span>
                )}
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-[12px] font-bold text-surface-500">
                  {formatDate(s.createdAt.toString())}
                </span>
              </AdminTableCell>
              <AdminTableCell width="180px">
                <div className="flex items-center gap-2">
                  <Button3D
                    variant="success"
                    size="sm"
                    onClick={() =>
                      confirm.confirm({
                        title: 'Aprobar suscripción',
                        message: `¿Confirmas aprobar la suscripción ${
                          s.plan === 'ANNUAL' ? 'anual' : 'mensual'
                        } de ${s.user?.name ?? 'este usuario'}?`,
                        onConfirm: () =>
                          process.mutate({
                            subscriptionId: s.id,
                            action: 'APPROVE',
                          }),
                      })
                    }
                    disabled={process.isPending}
                  >
                    <CheckCircle size={14} className="mr-1" /> Aprobar
                  </Button3D>
                  <Button3D
                    variant="error"
                    size="sm"
                    onClick={() =>
                      confirm.confirm({
                        title: 'Rechazar suscripción',
                        message: `¿Rechazar la solicitud de ${
                          s.user?.name ?? 'este usuario'
                        }?`,
                        variant: 'danger',
                        onConfirm: () =>
                          process.mutate({
                            subscriptionId: s.id,
                            action: 'REJECT',
                          }),
                      })
                    }
                    disabled={process.isPending}
                  >
                    <XCircle size={14} />
                  </Button3D>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      </Card3D>

      {/** Manual premium grant */}
      <ManualPremiumGrant users={mock.users} />

      {/** Voucher lightbox */}
      <AdminModal
        open={!!lightboxUrl}
        onClose={() => setLightboxUrl(null)}
        title="Comprobante de pago"
        size="lg"
      >
        {lightboxUrl ? (
          <img
            src={lightboxUrl}
            alt="Comprobante de pago"
            className="w-full rounded-2xl border-2 border-surface-200"
          />
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={!!confirm.state?.open}
        title={confirm.state?.title ?? ''}
        message={confirm.state?.message ?? ''}
        variant={confirm.state?.variant}
        confirmLabel={confirm.state?.confirmLabel}
        cancelLabel={confirm.state?.cancelLabel}
        onConfirm={() => {
          confirm.state?.onConfirm();
          confirm.close();
        }}
        onCancel={confirm.close}
      />
    </div>
  );
}

function ManualPremiumGrant({ users }: { users: AdminUser[] }) {
  const mock = useAdminMockData();
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [days, setDays] = useState(plan === 'MONTHLY' ? 30 : 365);
  const selected = users.find((u) => u.id === userId);

  const grant = () => {
    if (!selected) return;
    mock.setData((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === selected.id ? { ...u, isPremium: true } : u
      ),
    }));
    mock.logAction('otorgó premium manual', selected.name);
    setUserId('');
  };

  return (
    <Card3D variant="surface" padding="md">
      <h2 className="text-[16px] font-black text-surface-800 mb-4">
        Otorgar premium manual
      </h2>
      <div className="grid md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
            Usuario
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="">Seleccionar usuario</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email}){u.isPremium ? ' — premium' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
            Plan
          </label>
          <select
            value={plan}
            onChange={(e) => {
              const p = e.target.value as 'MONTHLY' | 'ANNUAL';
              setPlan(p);
              setDays(p === 'MONTHLY' ? 30 : 365);
            }}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="MONTHLY">Mensual</option>
            <option value="ANNUAL">Anual</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
            Días
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value || '0', 10))}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
          />
        </div>
        <Button3D
          variant="primary"
          size="md"
          onClick={grant}
          disabled={!selected || selected.isPremium}
          className="md:col-span-4 w-full md:w-auto"
        >
          Otorgar premium
        </Button3D>
      </div>
    </Card3D>
  );
}
