'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Users, Activity, TrendingUp, Clock, Eye } from 'lucide-react';
import { useAdminMockData } from '../../../../hooks/admin/useAdminMockData';
import { StatCard } from '../../../../components/admin/StatCard';
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from '../../../../components/admin/AdminTable';
import { AdminTabs } from '../../../../components/admin/AdminTabs';
import { Card3D } from '@ingresa-pe/ui';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import('recharts').then((m) => m.Line), {
  ssr: false,
});
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), {
  ssr: false,
});
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), {
  ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import('recharts').then((m) => m.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), {
  ssr: false,
});

const COLORS = ['#9B0F1C', '#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6'];

type Range = '7' | '30' | '90';

export default function AdminAnalyticsPage() {
  const mock = useAdminMockData();
  const [range, setRange] = useState<Range>('30');
  const days = parseInt(range, 10);

  const slice = (arr: { date: string; value: number }[]) => arr.slice(-days);

  const retention = [
    { cohort: 'Sem 1', d1: 45, d7: 32, d30: 20 },
    { cohort: 'Sem 2', d1: 42, d7: 28, d30: 18 },
    { cohort: 'Sem 3', d1: 48, d7: 30, d30: 19 },
    { cohort: 'Sem 4', d1: 44, d7: 29, d30: 17 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-[16px] font-black text-surface-800">Analíticas</h2>
        <AdminTabs
          tabs={[
            { value: '7', label: '7 días' },
            { value: '30', label: '30 días' },
            { value: '90', label: '90 días' },
          ]}
          value={range}
          onChange={(v) => setRange(v as Range)}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Usuarios totales"
          value={mock.analytics.totalUsers}
          icon={Users}
        />
        <StatCard
          label="Activos hoy"
          value={mock.analytics.activeToday}
          icon={Activity}
          variant="success"
        />
        <StatCard
          label="Activos 7d"
          value={mock.analytics.active7d}
          icon={TrendingUp}
          variant="warning"
        />
        <StatCard
          label="Retención D1"
          value={`${mock.analytics.retentionD1}%`}
          icon={Clock}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Usuarios activos diarios">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={slice(mock.analytics.dailyActive)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#9B0F1C"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nuevos registros">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={slice(mock.analytics.signups)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Usuarios por área">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mock.analytics.byArea}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {mock.analytics.byArea.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Actividad por curso">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mock.analytics.activityByCourse}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="lessons" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="simulacros" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card3D variant="surface" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} className="text-surface-400" />
            <h3 className="text-[16px] font-black text-surface-800">
              Páginas más visitadas
            </h3>
          </div>
          <AdminTable
            empty={mock.analytics.topPages.length === 0}
            columns={[
              { key: 'path', label: 'Ruta' },
              { key: 'views', label: 'Vistas', width: '120px' },
            ]}
          >
            {mock.analytics.topPages.map((p, i) => (
              <AdminTableRow key={p.path}>
                <AdminTableCell>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-surface-100 text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-bold text-surface-700">
                      {p.path}
                    </span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="text-[13px] font-black text-surface-800">
                    {p.views.toLocaleString('es-PE')}
                  </span>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        </Card3D>

        <Card3D variant="surface" padding="md">
          <h3 className="text-[16px] font-black text-surface-800 mb-4">
            Retención por cohorte
          </h3>
          <AdminTable
            empty={retention.length === 0}
            columns={[
              { key: 'cohort', label: 'Cohorte', width: '100px' },
              { key: 'd1', label: 'D1', width: '80px' },
              { key: 'd7', label: 'D7', width: '80px' },
              { key: 'd30', label: 'D30', width: '80px' },
            ]}
          >
            {retention.map((r) => (
              <AdminTableRow key={r.cohort}>
                <AdminTableCell>
                  <span className="text-[13px] font-bold text-surface-700">
                    {r.cohort}
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="text-[13px] font-black text-surface-800">
                    {r.d1}%
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="text-[13px] font-black text-surface-800">
                    {r.d7}%
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="text-[13px] font-black text-surface-800">
                    {r.d30}%
                  </span>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        </Card3D>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card3D variant="surface" padding="md">
      <h3 className="text-[14px] font-black text-surface-800 mb-4">{title}</h3>
      {children}
    </Card3D>
  );
}
