'use client';

import { useMemo, useState, useEffect } from 'react';
import { Users, Crown, Zap, Flame, Gem, Mail, Shield } from 'lucide-react';
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
import { StatCard } from '../../../../components/admin/StatCard';
import type { AdminUser } from '../../../../lib/admin/types';

function formatRelative(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return 'ahora';
  if (diff < 60) return `hace ${diff} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

export default function AdminUsersPage() {
  const mock = useAdminMockData();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | AdminUser['role']>(
    'ALL'
  );
  const [premiumFilter, setPremiumFilter] = useState<
    'ALL' | 'premium' | 'free'
  >('ALL');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mock.users.filter((u) => {
      const matchesSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.career ?? '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesPremium =
        premiumFilter === 'ALL' ||
        (premiumFilter === 'premium' ? u.isPremium : !u.isPremium);
      return matchesSearch && matchesRole && matchesPremium;
    });
  }, [mock.users, search, roleFilter, premiumFilter]);

  const changeRole = (userId: string, role: AdminUser['role']) => {
    mock.setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, role } : u)),
    }));
    mock.logAction('cambió rol', userId);
  };

  const sendDirectNotification = (user: AdminUser) => {
    mock.logAction('envió notificación directa', user.name);
    window.alert(`Notificación directa enviada a ${user.name} (simulado)`);
  };

  return (
    <div className="space-y-6">
      {/** KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={mock.users.length} icon={Users} />
        <StatCard
          label="Premium"
          value={mock.users.filter((u) => u.isPremium).length}
          icon={Crown}
          variant="success"
        />
        <StatCard
          label="Admins"
          value={mock.users.filter((u) => u.role === 'ADMIN').length}
          icon={Shield}
        />
        <StatCard
          label="Activos hoy"
          value={
            mock.users.filter((u) => {
              const diff = Date.now() - new Date(u.lastActiveAt).getTime();
              return diff < 24 * 60 * 60 * 1000;
            }).length
          }
          icon={Zap}
          variant="warning"
        />
      </div>

      {/** Filters */}
      <Card3D variant="surface" padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchInput
            placeholder="Buscar por nombre, email o carrera..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:w-80">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
                Rol
              </label>
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as typeof roleFilter)
                }
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Todos</option>
                <option value="USER">Usuario</option>
                <option value="ADMIN">Admin</option>
                <option value="DATA_ENTRY">Data Entry</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
                Plan
              </label>
              <select
                value={premiumFilter}
                onChange={(e) =>
                  setPremiumFilter(e.target.value as typeof premiumFilter)
                }
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Todos</option>
                <option value="premium">Premium</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>
        </div>
      </Card3D>

      {/** Table */}
      <Card3D variant="surface" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-black text-surface-800">Usuarios</h2>
          <span className="text-[11px] font-black uppercase tracking-wider text-surface-400">
            {filtered.length} resultados
          </span>
        </div>

        <AdminTable
          empty={filtered.length === 0}
          columns={[
            { key: 'name', label: 'Usuario' },
            { key: 'role', label: 'Rol', width: '110px' },
            { key: 'premium', label: 'Plan', width: '100px' },
            { key: 'streak', label: 'Racha', width: '80px' },
            { key: 'lastActive', label: 'Última actividad', width: '130px' },
            { key: 'actions', label: 'Acciones', width: '220px' },
          ]}
        >
          {filtered.map((u) => (
            <AdminTableRow key={u.id}>
              <AdminTableCell>
                <div className="leading-tight">
                  <div className="text-[13px] font-black text-surface-800 truncate">
                    {u.name}
                  </div>
                  <div className="text-[11px] font-bold text-surface-400 truncate">
                    {u.email}
                  </div>
                  {u.career && (
                    <div className="text-[10px] font-black text-primary-600 truncate">
                      {u.career}
                    </div>
                  )}
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={
                    u.role === 'ADMIN'
                      ? 'error'
                      : u.role === 'DATA_ENTRY'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {u.role}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant={u.isPremium ? 'success' : 'default'}>
                  {u.isPremium ? 'Premium' : 'Free'}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex items-center gap-1 text-[13px] font-black text-surface-700">
                  <Flame size={14} className="text-warning-500" /> {u.streak}
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-[12px] font-bold text-surface-500">
                  {formatRelative(u.lastActiveAt)}
                </span>
              </AdminTableCell>
              <AdminTableCell width="220px">
                <div className="flex items-center gap-2">
                  <Button3D
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedUser(u)}
                  >
                    Ver
                  </Button3D>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      changeRole(u.id, e.target.value as AdminUser['role'])
                    }
                    className="h-9 px-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-[12px] font-bold text-surface-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="USER">USER</option>
                    <option value="DATA_ENTRY">DATA_ENTRY</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => sendDirectNotification(u)}
                    className="w-9 h-9 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-colors"
                    title="Enviar notificación directa"
                  >
                    <Mail size={14} />
                  </button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      </Card3D>

      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}

function UserDetailDrawer({
  user,
  onClose,
}: {
  user: AdminUser | null;
  onClose: () => void;
}) {
  const mock = useAdminMockData();
  const [gems, setGems] = useState(user?.gems ?? 0);
  const [energy, setEnergy] = useState(user?.energy ?? 0);
  const [streak, setStreak] = useState(user?.streak ?? 0);

  // keep local inputs in sync when user changes
  useEffect(() => {
    if (user) {
      setGems(user.gems);
      setEnergy(user.energy);
      setStreak(user.streak);
    }
  }, [user]);

  const save = () => {
    if (!user) return;
    mock.setData((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === user.id ? { ...u, gems, energy, streak } : u
      ),
    }));
    mock.logAction('editó stats de usuario', user.name);
    onClose();
  };

  return (
    <AdminDrawer
      open={!!user}
      onClose={onClose}
      title={user?.name ?? 'Detalle de usuario'}
      width="lg"
    >
      {user ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-2xl font-black">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[14px] font-bold text-surface-400">
                {user.email}
              </p>
              <p className="text-[13px] font-black text-surface-700">
                {user.career ?? 'Sin carrera'} ·{' '}
                {user.isPremium ? 'Premium' : 'Free'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat
              icon={Flame}
              label="Racha"
              value={user.streak}
              color="text-warning-500"
            />
            <MiniStat
              icon={Gem}
              label="Gemas"
              value={user.gems}
              color="text-blue-500"
            />
            <MiniStat
              icon={Zap}
              label="Energía"
              value={user.energy}
              color="text-success-500"
            />
          </div>

          <Card3D variant="surface" padding="md">
            <h3 className="text-[14px] font-black text-surface-800 mb-4">
              Editar stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberField label="Racha" value={streak} onChange={setStreak} />
              <NumberField label="Gemas" value={gems} onChange={setGems} />
              <NumberField
                label="Energía"
                value={energy}
                onChange={setEnergy}
                max={25}
              />
            </div>
            <div className="mt-4 flex gap-3">
              <Button3D variant="primary" size="md" onClick={save}>
                Guardar cambios
              </Button3D>
              <Button3D variant="surface" size="md" onClick={onClose}>
                Cancelar
              </Button3D>
            </div>
          </Card3D>
        </div>
      ) : null}
    </AdminDrawer>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card3D variant="surface" padding="sm" className="text-center">
      <Icon size={20} className={`mx-auto mb-1 ${color}`} />
      <p className="text-[18px] font-black text-surface-800">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">
        {label}
      </p>
    </Card3D>
  );
}

function NumberField({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value || '0', 10);
          onChange(max !== undefined ? Math.min(v, max) : v);
        }}
        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
