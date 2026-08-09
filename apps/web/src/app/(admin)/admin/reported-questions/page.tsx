'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Eye, Check, X, Edit3 } from 'lucide-react';
import { useAdminMockData } from '../../../../hooks/admin/useAdminMockData';
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from '../../../../components/admin/AdminTable';
import { Badge } from '../../../../components/admin/Badge';
import { SearchInput } from '../../../../components/admin/SearchInput';
import { AdminDrawer } from '../../../../components/admin/AdminDrawer';
import { AdminModal } from '../../../../components/admin/AdminModal';
import { Button3D } from '@ingresa-pe/ui';
import { Card3D } from '@ingresa-pe/ui';
import type { ReportedQuestion } from '../../../../lib/admin/types';

const statusLabels: Record<ReportedQuestion['status'], string> = {
  pending: 'Pendiente',
  reviewed: 'Revisado',
  fixed: 'Corregido',
  dismissed: 'Descartado',
};

export default function AdminReportedQuestionsPage() {
  const mock = useAdminMockData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | ReportedQuestion['status']
  >('ALL');
  const [selected, setSelected] = useState<ReportedQuestion | null>(null);
  const [preview, setPreview] = useState<ReportedQuestion | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mock.reportedQuestions.filter((q) => {
      const matchesSearch =
        !term ||
        q.statement.toLowerCase().includes(term) ||
        q.topicName.toLowerCase().includes(term) ||
        q.reason.toLowerCase().includes(term);
      return (
        matchesSearch && (statusFilter === 'ALL' || q.status === statusFilter)
      );
    });
  }, [mock.reportedQuestions, search, statusFilter]);

  const updateStatus = (id: string, status: ReportedQuestion['status']) => {
    mock.setData((prev) => ({
      ...prev,
      reportedQuestions: prev.reportedQuestions.map((q) =>
        q.id === id ? { ...q, status } : q
      ),
    }));
    mock.logAction('actualizó pregunta reportada', id);
    setSelected((s) => (s?.id === id ? { ...s, status } : s));
    setPreview((p) => (p?.id === id ? { ...p, status } : p));
  };

  const saveStatement = (id: string, statement: string) => {
    mock.setData((prev) => ({
      ...prev,
      reportedQuestions: prev.reportedQuestions.map((q) =>
        q.id === id ? { ...q, statement } : q
      ),
    }));
    mock.logAction('editó enunciado de pregunta', id);
    setSelected((s) => (s?.id === id ? { ...s, statement } : s));
    setPreview((p) => (p?.id === id ? { ...p, statement } : p));
  };

  return (
    <div className="space-y-6">
      <Card3D variant="surface" padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchInput
            placeholder="Buscar pregunta, tema o motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="md:w-56">
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
        </div>
      </Card3D>

      <Card3D variant="surface" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-black text-surface-800">
            Preguntas reportadas
          </h2>
          <span className="text-[11px] font-black uppercase tracking-wider text-surface-400">
            {filtered.length} resultados
          </span>
        </div>

        <AdminTable
          empty={filtered.length === 0}
          columns={[
            { key: 'question', label: 'Pregunta' },
            { key: 'topic', label: 'Tema', width: '130px' },
            { key: 'reason', label: 'Motivo', width: '140px' },
            { key: 'reports', label: 'Reportes', width: '90px' },
            { key: 'status', label: 'Estado', width: '110px' },
            { key: 'actions', label: 'Acciones', width: '180px' },
          ]}
        >
          {filtered.map((q) => (
            <AdminTableRow key={q.id}>
              <AdminTableCell>
                <span className="text-[13px] font-bold text-surface-700 line-clamp-2">
                  {q.statement}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-[12px] font-bold text-surface-500">
                  {q.topicName}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-[12px] font-bold text-surface-500">
                  {q.reason}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex items-center gap-1 text-[13px] font-black text-surface-700">
                  <AlertCircle size={14} className="text-error-500" /> {q.count}
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={
                    q.status === 'pending'
                      ? 'warning'
                      : q.status === 'fixed'
                      ? 'success'
                      : q.status === 'dismissed'
                      ? 'default'
                      : 'info'
                  }
                >
                  {statusLabels[q.status]}
                </Badge>
              </AdminTableCell>
              <AdminTableCell width="180px">
                <div className="flex items-center gap-2">
                  <Button3D
                    variant="primary"
                    size="sm"
                    onClick={() => setPreview(q)}
                  >
                    <Eye size={14} />
                  </Button3D>
                  <Button3D
                    variant="warning"
                    size="sm"
                    onClick={() => setSelected(q)}
                  >
                    <Edit3 size={14} />
                  </Button3D>
                  {q.status === 'pending' && (
                    <Button3D
                      variant="success"
                      size="sm"
                      onClick={() => updateStatus(q.id, 'reviewed')}
                    >
                      <Check size={14} />
                    </Button3D>
                  )}
                  {q.status !== 'dismissed' && (
                    <Button3D
                      variant="error"
                      size="sm"
                      onClick={() => updateStatus(q.id, 'dismissed')}
                    >
                      <X size={14} />
                    </Button3D>
                  )}
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      </Card3D>

      <QuestionPreviewModal
        question={preview}
        onClose={() => setPreview(null)}
      />
      <QuestionEditDrawer
        question={selected}
        onClose={() => setSelected(null)}
        onSave={saveStatement}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}

function QuestionPreviewModal({
  question,
  onClose,
}: {
  question: ReportedQuestion | null;
  onClose: () => void;
}) {
  return (
    <AdminModal
      open={!!question}
      onClose={onClose}
      title="Vista previa"
      size="md"
    >
      {question && (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1">
              Enunciado
            </p>
            <p className="text-[15px] font-bold text-surface-800">
              {question.statement}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1">
                Tema
              </p>
              <p className="text-[13px] font-bold text-surface-700">
                {question.topicName}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1">
                Reportes
              </p>
              <p className="text-[13px] font-bold text-surface-700">
                {question.count}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="warning">{question.reason}</Badge>
            <Badge
              variant={
                question.status === 'pending'
                  ? 'warning'
                  : question.status === 'fixed'
                  ? 'success'
                  : question.status === 'dismissed'
                  ? 'default'
                  : 'info'
              }
            >
              {statusLabels[question.status]}
            </Badge>
          </div>
        </div>
      )}
    </AdminModal>
  );
}

function QuestionEditDrawer({
  question,
  onClose,
  onSave,
  onUpdateStatus,
}: {
  question: ReportedQuestion | null;
  onClose: () => void;
  onSave: (id: string, statement: string) => void;
  onUpdateStatus: (id: string, status: ReportedQuestion['status']) => void;
}) {
  const [statement, setStatement] = useState(question?.statement ?? '');

  if (question && statement !== question.statement) {
    setStatement(question.statement);
  }

  return (
    <AdminDrawer
      open={!!question}
      onClose={onClose}
      title="Editar pregunta"
      width="lg"
    >
      {question ? (
        <div className="space-y-6">
          <Card3D variant="surface" padding="md">
            <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
              Enunciado
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full h-40 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="mt-3 flex gap-3">
              <Button3D
                variant="primary"
                size="md"
                onClick={() => {
                  onSave(question.id, statement);
                  onClose();
                }}
              >
                Guardar enunciado
              </Button3D>
              <Button3D variant="surface" size="md" onClick={onClose}>
                Cancelar
              </Button3D>
            </div>
          </Card3D>

          <Card3D variant="surface" padding="md">
            <h3 className="text-[14px] font-black text-surface-800 mb-2">
              Cambiar estado
            </h3>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'pending',
                  'reviewed',
                  'fixed',
                  'dismissed',
                ] as ReportedQuestion['status'][]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdateStatus(question.id, s)}
                  disabled={question.status === s}
                  className={`px-3 py-2 rounded-xl text-[12px] font-black border-2 transition-colors ${
                    question.status === s
                      ? 'bg-surface-100 text-surface-400 border-surface-200'
                      : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </Card3D>
        </div>
      ) : null}
    </AdminDrawer>
  );
}
