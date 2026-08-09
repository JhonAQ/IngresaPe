'use client';

import { useMemo, useState } from 'react';
import { Headphones, User, Calendar, Tag, MessageSquare } from 'lucide-react';
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
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from '../../../../lib/admin/types';

const statusLabels: Record<TicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  escalated: 'Escalado',
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
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

export default function AdminSupportPage() {
  const mock = useAdminMockData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TicketPriority>(
    'ALL'
  );
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mock.tickets.filter((t) => {
      const matchesSearch =
        !term ||
        t.userName.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term);
      return (
        matchesSearch &&
        (statusFilter === 'ALL' || t.status === statusFilter) &&
        (priorityFilter === 'ALL' || t.priority === priorityFilter)
      );
    });
  }, [mock.tickets, search, statusFilter, priorityFilter]);

  const updateStatus = (id: string, status: TicketStatus) => {
    mock.setData((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    mock.logAction('actualizó ticket', id);
    if (selected?.id === id) setSelected((s) => (s ? { ...s, status } : s));
  };

  const assignToMe = (id: string) => {
    mock.setData((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === id
          ? { ...t, assignedTo: 'Admin', status: 'in_progress' as TicketStatus }
          : t
      ),
    }));
    mock.logAction('asignó ticket', id);
    if (selected?.id === id)
      setSelected((s) =>
        s ? { ...s, assignedTo: 'Admin', status: 'in_progress' } : s
      );
  };

  return (
    <div className="space-y-6">
      <Card3D variant="surface" padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchInput
            placeholder="Buscar usuario, asunto o categoría..."
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
                Prioridad
              </label>
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as typeof priorityFilter)
                }
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Todas</option>
                {Object.entries(priorityLabels).map(([k, label]) => (
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
            Tickets de soporte
          </h2>
          <span className="text-[11px] font-black uppercase tracking-wider text-surface-400">
            {filtered.length} resultados
          </span>
        </div>

        <AdminTable
          empty={filtered.length === 0}
          columns={[
            { key: 'user', label: 'Usuario' },
            { key: 'subject', label: 'Asunto' },
            { key: 'priority', label: 'Prioridad', width: '100px' },
            { key: 'status', label: 'Estado', width: '110px' },
            { key: 'date', label: 'Creado', width: '140px' },
            { key: 'actions', label: 'Acciones', width: '220px' },
          ]}
        >
          {filtered.map((t) => (
            <AdminTableRow key={t.id}>
              <AdminTableCell>
                <div className="leading-tight">
                  <div className="text-[13px] font-black text-surface-800 truncate">
                    {t.userName}
                  </div>
                  <div className="text-[11px] font-bold text-surface-400 truncate">
                    {t.category}
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-[13px] font-bold text-surface-700 truncate">
                  {t.subject}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={
                    t.priority === 'urgent'
                      ? 'error'
                      : t.priority === 'high'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {priorityLabels[t.priority]}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={
                    t.status === 'open'
                      ? 'warning'
                      : t.status === 'resolved' || t.status === 'closed'
                      ? 'success'
                      : t.status === 'escalated'
                      ? 'error'
                      : 'info'
                  }
                >
                  {statusLabels[t.status]}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-[12px] font-bold text-surface-500">
                  {formatDate(t.createdAt)}
                </span>
              </AdminTableCell>
              <AdminTableCell width="220px">
                <div className="flex items-center gap-2">
                  <Button3D
                    variant="primary"
                    size="sm"
                    onClick={() => setSelected(t)}
                  >
                    Ver
                  </Button3D>
                  {t.status === 'open' && (
                    <Button3D
                      variant="warning"
                      size="sm"
                      onClick={() => assignToMe(t.id)}
                    >
                      Asignar
                    </Button3D>
                  )}
                  {(t.status === 'open' || t.status === 'in_progress') && (
                    <Button3D
                      variant="success"
                      size="sm"
                      onClick={() => updateStatus(t.id, 'resolved')}
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

      <TicketDrawer
        ticket={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={updateStatus}
        onAssign={assignToMe}
      />
    </div>
  );
}

function TicketDrawer({
  ticket,
  onClose,
  onUpdateStatus,
  onAssign,
}: {
  ticket: SupportTicket | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onAssign: (id: string) => void;
}) {
  const [note, setNote] = useState('');

  return (
    <AdminDrawer
      open={!!ticket}
      onClose={onClose}
      title={ticket?.subject ?? 'Ticket'}
      width="lg"
    >
      {ticket ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow icon={User} label="Usuario" value={ticket.userName} />
            <InfoRow icon={Tag} label="Categoría" value={ticket.category} />
            <InfoRow
              icon={Calendar}
              label="Creado"
              value={formatDate(ticket.createdAt)}
            />
            <InfoRow
              icon={Headphones}
              label="Asignado"
              value={ticket.assignedTo ?? 'Sin asignar'}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                ticket.priority === 'urgent'
                  ? 'error'
                  : ticket.priority === 'high'
                  ? 'warning'
                  : 'default'
              }
            >
              Prioridad: {priorityLabels[ticket.priority]}
            </Badge>
            <Badge
              variant={
                ticket.status === 'open'
                  ? 'warning'
                  : ticket.status === 'resolved' || ticket.status === 'closed'
                  ? 'success'
                  : ticket.status === 'escalated'
                  ? 'error'
                  : 'info'
              }
            >
              Estado: {statusLabels[ticket.status]}
            </Badge>
          </div>

          <Card3D variant="surface" padding="md">
            <h3 className="text-[14px] font-black text-surface-800 mb-2">
              Cambiar estado
            </h3>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'open',
                  'in_progress',
                  'resolved',
                  'escalated',
                  'closed',
                ] as TicketStatus[]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdateStatus(ticket.id, s)}
                  disabled={ticket.status === s}
                  className={`px-3 py-2 rounded-xl text-[12px] font-black border-2 transition-colors ${
                    ticket.status === s
                      ? 'bg-surface-100 text-surface-400 border-surface-200'
                      : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </Card3D>

          {!ticket.assignedTo && (
            <Button3D
              variant="warning"
              size="md"
              onClick={() => onAssign(ticket.id)}
            >
              Asignarme ticket
            </Button3D>
          )}

          <Card3D variant="surface" padding="md">
            <h3 className="text-[14px] font-black text-surface-800 mb-2 flex items-center gap-2">
              <MessageSquare size={16} /> Nota interna
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe una nota para este ticket..."
              className="w-full h-28 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <Button3D
                variant="primary"
                size="sm"
                onClick={() => {
                  setNote('');
                  alert('Nota guardada (simulado)');
                }}
              >
                Guardar nota
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
