'use client';

import { useMemo, useState } from 'react';
import { Smartphone, Code, User, Calendar, AlertTriangle } from 'lucide-react';
import { useAdminMockData } from '../../../../hooks/admin/useAdminMockData';
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from '../../../../components/admin/AdminTable';
import { Badge } from '../../../../components/admin/Badge';
import { SearchInput } from '../../../../components/admin/SearchInput';
import { AdminDrawer } from '../../../../components/admin/AdminDrawer';
import { Button3D } from '@ingresa-pe/ui';
import { Card3D } from '@ingresa-pe/ui';
import type {
  BugReport,
  BugSeverity,
  BugStatus,
} from '../../../../lib/admin/types';

const statusLabels: Record<BugStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

const severityLabels: Record<BugSeverity, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminBugsPage() {
  const mock = useAdminMockData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BugStatus>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | BugSeverity>(
    'ALL'
  );
  const [selected, setSelected] = useState<BugReport | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mock.bugs.filter((b) => {
      const matchesSearch =
        !term ||
        b.title.toLowerCase().includes(term) ||
        b.description.toLowerCase().includes(term) ||
        b.platform.toLowerCase().includes(term) ||
        b.reporter.toLowerCase().includes(term);
      return (
        matchesSearch &&
        (statusFilter === 'ALL' || b.status === statusFilter) &&
        (severityFilter === 'ALL' || b.severity === severityFilter)
      );
    });
  }, [mock.bugs, search, statusFilter, severityFilter]);

  const updateStatus = (id: string, status: BugStatus) => {
    mock.setData((prev) => ({
      ...prev,
      bugs: prev.bugs.map((b) => (b.id === id ? { ...b, status } : b)),
    }));
    mock.logAction('actualizó bug', id);
    setSelected((s) => (s?.id === id ? { ...s, status } : s));
  };

  return (
    <div className="space-y-6">
      <Card3D variant="surface" padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchInput
            placeholder="Buscar título, descripción, plataforma o reportante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:w-80">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Todos</option>
                {Object.entries(statusLabels).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
                Severidad
              </label>
              <select
                value={severityFilter}
                onChange={(e) =>
                  setSeverityFilter(e.target.value as typeof severityFilter)
                }
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Todas</option>
                {Object.entries(severityLabels).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card3D>

      <Card3D variant="surface" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-black text-surface-800">
            Reportes de bugs
          </h2>
          <span className="text-[11px] font-black uppercase tracking-wider text-surface-400">
            {filtered.length} resultados
          </span>
        </div>

        <AdminTable
          empty={filtered.length === 0}
          columns={[
            { key: 'title', label: 'Bug' },
            { key: 'severity', label: 'Severidad', width: '100px' },
            { key: 'status', label: 'Estado', width: '110px' },
            { key: 'platform', label: 'Plataforma', width: '130px' },
            { key: 'date', label: 'Fecha', width: '140px' },
            { key: 'actions', label: 'Acciones', width: '160px' },
          ]}
        >
          {filtered.map((b) => (
            <AdminTableRow key={b.id}>
              <AdminTableCell>
                <div className="leading-tight">
                  <div className="text-[13px] font-black text-surface-800 truncate">
                    {b.title}
                  </div>
                  <div className="text-[11px] font-bold text-surface-400 truncate">
                    {b.reporter}
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={
                    b.severity === 'critical'
                      ? 'error'
                      : b.severity === 'high'
                      ? 'warning'
                      : b.severity === 'medium'
                      ? 'info'
                      : 'default'
                  }
                >
                  {severityLabels[b.severity]}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={
                    b.status === 'open'
                      ? 'warning'
                      : b.status === 'resolved' || b.status === 'closed'
                      ? 'success'
                      : 'info'
                  }
                >
                  {statusLabels[b.status]}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-[12px] font-bold text-surface-500">
                  {b.platform}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-[12px] font-bold text-surface-500">
                  {formatDate(b.createdAt)}
                </span>
              </AdminTableCell>
              <AdminTableCell width="160px">
                <div className="flex items-center gap-2">
                  <Button3D
                    variant="primary"
                    size="sm"
                    onClick={() => setSelected(b)}
                  >
                    Ver
                  </Button3D>
                  {b.status === 'open' && (
                    <Button3D
                      variant="warning"
                      size="sm"
                      onClick={() => updateStatus(b.id, 'in_progress')}
                    >
                      Iniciar
                    </Button3D>
                  )}
                  {(b.status === 'open' || b.status === 'in_progress') && (
                    <Button3D
                      variant="success"
                      size="sm"
                      onClick={() => updateStatus(b.id, 'resolved')}
                    >
                      Resolver
                    </Button3D>
                  )}
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      </Card3D>

      <BugDrawer
        bug={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}

function BugDrawer({
  bug,
  onClose,
  onUpdateStatus,
}: {
  bug: BugReport | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: BugStatus) => void;
}) {
  const [comment, setComment] = useState('');

  return (
    <AdminDrawer
      open={!!bug}
      onClose={onClose}
      title={bug?.title ?? 'Bug'}
      width="lg"
    >
      {bug ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow icon={User} label="Reportado por" value={bug.reporter} />
            <InfoRow
              icon={Smartphone}
              label="Plataforma"
              value={bug.platform}
            />
            <InfoRow icon={Code} label="Versión" value={bug.version} />
            <InfoRow
              icon={Calendar}
              label="Fecha"
              value={formatDate(bug.createdAt)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                bug.severity === 'critical'
                  ? 'error'
                  : bug.severity === 'high'
                  ? 'warning'
                  : bug.severity === 'medium'
                  ? 'info'
                  : 'default'
              }
            >
              Severidad: {severityLabels[bug.severity]}
            </Badge>
            <Badge
              variant={
                bug.status === 'open'
                  ? 'warning'
                  : bug.status === 'resolved' || bug.status === 'closed'
                  ? 'success'
                  : 'info'
              }
            >
              Estado: {statusLabels[bug.status]}
            </Badge>
          </div>

          <Card3D variant="surface" padding="md">
            <h3 className="text-[14px] font-black text-surface-800 mb-2">
              Descripción
            </h3>
            <p className="text-[14px] font-bold text-surface-600 whitespace-pre-line">
              {bug.description}
            </p>
          </Card3D>

          <Card3D variant="surface" padding="md">
            <h3 className="text-[14px] font-black text-surface-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Pasos para reproducir
            </h3>
            <p className="text-[14px] font-bold text-surface-600 whitespace-pre-line">
              {bug.stepsToReproduce}
            </p>
          </Card3D>

          <Card3D variant="surface" padding="md">
            <h3 className="text-[14px] font-black text-surface-800 mb-2">
              Cambiar estado
            </h3>
            <div className="flex flex-wrap gap-2">
              {(
                ['open', 'in_progress', 'resolved', 'closed'] as BugStatus[]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdateStatus(bug.id, s)}
                  disabled={bug.status === s}
                  className={`px-3 py-2 rounded-xl text-[12px] font-black border-2 transition-colors ${
                    bug.status === s
                      ? 'bg-surface-100 text-surface-400 border-surface-200'
                      : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </Card3D>

          <Card3D variant="surface" padding="md">
            <h3 className="text-[14px] font-black text-surface-800 mb-2">
              Comentario
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Agrega un comentario interno..."
              className="w-full h-28 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <Button3D
                variant="primary"
                size="sm"
                onClick={() => {
                  setComment('');
                  alert('Comentario guardado (simulado)');
                }}
              >
                Guardar comentario
              </Button3D>
            </div>
          </Card3D>
        </div>
      ) : null}
    </AdminDrawer>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-surface-500" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">
          {label}
        </p>
        <p className="text-[13px] font-bold text-surface-700">{value}</p>
      </div>
    </div>
  );
}
