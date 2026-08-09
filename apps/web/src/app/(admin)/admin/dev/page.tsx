'use client';

import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { UserPlus, Calendar, Plus, Trash2, Save, Flag } from 'lucide-react';
import { useAdminMockData } from '../../../../hooks/admin/useAdminMockData';
import { trpc } from '../../../../utils/trpc';
import { AdminTabs } from '../../../../components/admin/AdminTabs';
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from '../../../../components/admin/AdminTable';
import { Button3D } from '@ingresa-pe/ui';
import { Card3D } from '@ingresa-pe/ui';
import { QuestionType } from '@ingresa-pe/domain';
import type {
  AdminUser,
  AdminCourse,
  AdminTopic,
} from '../../../../lib/admin/types';

type Tab = 'users' | 'simulacro' | 'questions' | 'tree' | 'flags';

export default function AdminDevPage() {
  const [tab, setTab] = useState<Tab>('users');

  return (
    <div className="space-y-6">
      <AdminTabs
        tabs={[
          { value: 'users', label: 'Usuarios' },
          { value: 'simulacro', label: 'Simulacro' },
          { value: 'questions', label: 'Preguntas' },
          { value: 'tree', label: 'Árbol' },
          { value: 'flags', label: 'Feature flags' },
        ]}
        value={tab}
        onChange={(v) => setTab(v as Tab)}
      />

      {tab === 'users' && <UsersTab />}
      {tab === 'simulacro' && <SimulacroTab />}
      {tab === 'questions' && <QuestionsTab />}
      {tab === 'tree' && <TreeTab />}
      {tab === 'flags' && <FlagsTab />}
    </div>
  );
}

// ---------- Users ----------

function UsersTab() {
  const mock = useAdminMockData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('USER');
  const [search, setSearch] = useState('');

  const create = () => {
    if (!name.trim() || !email.trim()) return;
    const newUser: AdminUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      isPremium: false,
      streak: 0,
      gems: 50,
      energy: 25,
      lastActiveAt: new Date().toISOString(),
    };
    mock.setData((prev) => ({
      ...prev,
      users: [newUser, ...prev.users],
    }));
    mock.logAction('creó usuario rápido', newUser.name);
    setName('');
    setEmail('');
    setPassword('');
    setRole('USER');
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mock.users.slice(0, 20);
    return mock.users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [mock.users, search]);

  const updateUser = (id: string, patch: Partial<AdminUser>) => {
    mock.setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
    mock.logAction('editó usuario (dev)', id);
  };

  return (
    <div className="space-y-6">
      <Card3D variant="surface" padding="md">
        <h2 className="text-[16px] font-black text-surface-800 mb-4 flex items-center gap-2">
          <UserPlus size={18} /> Crear usuario rápido
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Nombre" value={name} onChange={setName} />
          <TextField label="Email" value={email} onChange={setEmail} />
          <TextField
            label="Contraseña"
            value={password}
            onChange={setPassword}
            type="password"
          />
          <SelectField
            label="Rol"
            value={role}
            onChange={(v) => setRole(v as AdminUser['role'])}
            options={[
              { value: 'USER', label: 'Usuario' },
              { value: 'DATA_ENTRY', label: 'Data Entry' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
          />
        </div>
        <div className="mt-4">
          <Button3D
            variant="success"
            size="md"
            onClick={create}
            disabled={!name.trim() || !email.trim()}
          >
            Crear usuario
          </Button3D>
        </div>
      </Card3D>

      <Card3D variant="surface" padding="md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-[16px] font-black text-surface-800">
            Usuarios recientes
          </h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="md:w-64 h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <AdminTable
          empty={filtered.length === 0}
          columns={[
            { key: 'name', label: 'Usuario' },
            { key: 'streak', label: 'Racha', width: '90px' },
            { key: 'gems', label: 'Gemas', width: '90px' },
            { key: 'energy', label: 'Energía', width: '90px' },
            { key: 'premium', label: 'Premium', width: '100px' },
            { key: 'actions', label: 'Acciones', width: '120px' },
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
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <NumberInput
                  value={u.streak}
                  onChange={(v) => updateUser(u.id, { streak: v })}
                />
              </AdminTableCell>
              <AdminTableCell>
                <NumberInput
                  value={u.gems}
                  onChange={(v) => updateUser(u.id, { gems: v })}
                />
              </AdminTableCell>
              <AdminTableCell>
                <NumberInput
                  value={u.energy}
                  onChange={(v) => updateUser(u.id, { energy: v })}
                  max={25}
                />
              </AdminTableCell>
              <AdminTableCell>
                <button
                  type="button"
                  onClick={() => updateUser(u.id, { isPremium: !u.isPremium })}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-colors ${
                    u.isPremium
                      ? 'bg-success-500 text-white'
                      : 'bg-surface-200 text-surface-700'
                  }`}
                >
                  {u.isPremium ? 'Sí' : 'No'}
                </button>
              </AdminTableCell>
              <AdminTableCell width="120px">
                <button
                  type="button"
                  onClick={() => {
                    mock.setData((prev) => ({
                      ...prev,
                      users: prev.users.filter((x) => x.id !== u.id),
                    }));
                    mock.logAction('eliminó usuario', u.name);
                  }}
                  className="w-9 h-9 rounded-xl bg-error-100 text-error-500 flex items-center justify-center hover:bg-error-200 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      </Card3D>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const v = parseInt(e.target.value || '0', 10);
        onChange(max !== undefined ? Math.min(v, max) : v);
      }}
      className="w-full h-10 px-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-[13px] font-bold text-surface-800 focus:outline-none focus:border-blue-500"
    />
  );
}

// ---------- Simulacro ----------

function SimulacroTab() {
  const mock = useAdminMockData();
  const [date, setDate] = useState(mock.simulacroDate.slice(0, 16));

  const save = () => {
    mock.setData((prev) => ({
      ...prev,
      simulacroDate: new Date(date).toISOString(),
    }));
    mock.logAction('cambió día de simulacro', date);
  };

  return (
    <Card3D variant="surface" padding="md">
      <h2 className="text-[16px] font-black text-surface-800 mb-4 flex items-center gap-2">
        <Calendar size={18} /> Forzar fecha de simulacro
      </h2>
      <p className="text-[14px] font-bold text-surface-600 mb-4">
        Fecha actual forzada:{' '}
        {new Date(mock.simulacroDate).toLocaleString('es-PE')}
      </p>
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-80">
          <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
            Nueva fecha y hora
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
          />
        </div>
        <Button3D variant="primary" size="md" onClick={save}>
          Guardar fecha
        </Button3D>
        <Button3D
          variant="surface"
          size="md"
          onClick={() => {
            const reset = '2026-07-19T09:00:00-05:00';
            setDate(reset.slice(0, 16));
            mock.setData((prev) => ({
              ...prev,
              simulacroDate: new Date(reset).toISOString(),
            }));
            mock.logAction('reseteó fecha de simulacro', reset);
          }}
        >
          Resetear
        </Button3D>
      </div>
    </Card3D>
  );
}

// ---------- Questions ----------

function QuestionsTab() {
  const mock = useAdminMockData();
  const [statement, setStatement] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(
    'MEDIUM'
  );
  const [courseId, setCourseId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [options, setOptions] = useState([
    { id: 'a', text: '' },
    { id: 'b', text: '' },
  ]);
  const [correctId, setCorrectId] = useState('a');
  const [message, setMessage] = useState<string | null>(null);

  const { data: courses } = trpc.content.getCourses.useQuery();
  const { data: topics } = trpc.content.getTopics.useQuery(
    { courseId },
    { enabled: !!courseId }
  );
  const create = trpc.admin.createQuestion.useMutation({
    onSuccess: (q) => {
      mock.setData((prev) => ({
        ...prev,
        questions: [q, ...prev.questions],
      }));
      mock.logAction('creó pregunta', q.statement);
      setMessage('Pregunta creada correctamente');
      setStatement('');
      setExplanation('');
      setOptions([
        { id: 'a', text: '' },
        { id: 'b', text: '' },
      ]);
    },
    onError: (err) => setMessage(`Error: ${err.message}`),
  });

  const addOption = () => {
    const id = String.fromCharCode(97 + options.length);
    setOptions([...options, { id, text: '' }]);
  };

  const removeOption = (id: string) => {
    const next = options.filter((o) => o.id !== id);
    setOptions(next);
    if (correctId === id) setCorrectId(next[0]?.id ?? '');
  };

  const submit = () => {
    if (!statement.trim() || !topicId || options.length < 2 || !correctId)
      return;
    const content = {
      type: QuestionType.MULTIPLE_CHOICE,
      options: options.map((o) => ({ ...o, isCorrect: o.id === correctId })),
    };
    create.mutate({
      statement: statement.trim(),
      explanation: explanation.trim(),
      difficulty,
      topicId,
      type: QuestionType.MULTIPLE_CHOICE,
      content,
    });
  };

  return (
    <div className="space-y-6">
      <Card3D variant="surface" padding="md">
        <h2 className="text-[16px] font-black text-surface-800 mb-4">
          Crear pregunta (múltiple choice)
        </h2>
        <div className="space-y-4">
          <TextAreaField
            label="Enunciado"
            value={statement}
            onChange={setStatement}
          />
          <TextAreaField
            label="Explicación"
            value={explanation}
            onChange={setExplanation}
          />
          <div className="grid md:grid-cols-3 gap-4">
            <SelectField
              label="Dificultad"
              value={difficulty}
              onChange={(v) => setDifficulty(v as typeof difficulty)}
              options={[
                { value: 'EASY', label: 'Fácil' },
                { value: 'MEDIUM', label: 'Media' },
                { value: 'HARD', label: 'Difícil' },
              ]}
            />
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
                Curso
              </label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setTopicId('');
                }}
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar curso</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
                Tema
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar tema</option>
                {topics?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500">
              Alternativas
            </label>
            {options.map((o) => (
              <div key={o.id} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct"
                  checked={correctId === o.id}
                  onChange={() => setCorrectId(o.id)}
                  className="w-5 h-5 accent-primary-500"
                />
                <input
                  type="text"
                  value={o.text}
                  onChange={(e) =>
                    setOptions(
                      options.map((x) =>
                        x.id === o.id ? { ...x, text: e.target.value } : x
                      )
                    )
                  }
                  placeholder={`Alternativa ${o.id.toUpperCase()}`}
                  className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeOption(o.id)}
                  className="w-9 h-9 rounded-xl bg-error-100 text-error-500 flex items-center justify-center hover:bg-error-200 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <Button3D variant="surface" size="sm" onClick={addOption}>
              <Plus size={14} className="mr-1" /> Agregar alternativa
            </Button3D>
          </div>

          {message && (
            <p
              className={`text-[13px] font-bold ${
                message.startsWith('Error')
                  ? 'text-error-500'
                  : 'text-success-600'
              }`}
            >
              {message}
            </p>
          )}

          <Button3D
            variant="primary"
            size="md"
            onClick={submit}
            disabled={
              create.isPending ||
              !statement.trim() ||
              !topicId ||
              options.some((o) => !o.text.trim())
            }
          >
            <Save size={16} className="mr-2" /> Crear pregunta real
          </Button3D>
        </div>
      </Card3D>
    </div>
  );
}

// ---------- Tree ----------

function TreeTab() {
  const mock = useAdminMockData();
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [editingTopic, setEditingTopic] = useState<AdminTopic | null>(null);

  const saveCourse = (c: AdminCourse) => {
    mock.setData((prev) => ({
      ...prev,
      courses: prev.courses.map((x) => (x.id === c.id ? c : x)),
    }));
    mock.logAction('editó curso', c.name);
    setEditingCourse(null);
  };

  const saveTopic = (t: AdminTopic) => {
    mock.setData((prev) => ({
      ...prev,
      topics: prev.topics.map((x) => (x.id === t.id ? t : x)),
    }));
    mock.logAction('editó tema', t.name);
    setEditingTopic(null);
  };

  return (
    <div className="space-y-6">
      <Card3D variant="surface" padding="md">
        <h2 className="text-[16px] font-black text-surface-800 mb-4">Cursos</h2>
        <div className="space-y-2">
          {mock.courses.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface-50"
            >
              <div>
                <div className="text-[13px] font-black text-surface-800">
                  {c.name}
                </div>
                <div className="text-[11px] font-bold text-surface-400">
                  /{c.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourse(c)}
                className="w-9 h-9 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-colors"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      </Card3D>

      <Card3D variant="surface" padding="md">
        <h2 className="text-[16px] font-black text-surface-800 mb-4">Temas</h2>
        <div className="space-y-2">
          {mock.topics.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface-50"
            >
              <div>
                <div className="text-[13px] font-black text-surface-800">
                  {t.name}
                </div>
                <div className="text-[11px] font-bold text-surface-400">
                  Orden {t.order} · {t.nodeCount} nodos de {t.nodeSize} preg ·
                  curso {t.courseId}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTopic(t)}
                className="w-9 h-9 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-colors"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      </Card3D>

      <EditCourseModal
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
        onSave={saveCourse}
      />
      <EditTopicModal
        topic={editingTopic}
        onClose={() => setEditingTopic(null)}
        onSave={saveTopic}
      />
    </div>
  );
}

function EditCourseModal({
  course,
  onClose,
  onSave,
}: {
  course: AdminCourse | null;
  onClose: () => void;
  onSave: (c: AdminCourse) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (course) {
      setName(course.name);
      setSlug(course.slug);
    }
  }, [course?.id]);

  return (
    <AdminModal
      open={!!course}
      onClose={onClose}
      title="Editar curso"
      size="sm"
    >
      <div className="space-y-4">
        <TextField label="Nombre" value={name} onChange={setName} />
        <TextField label="Slug" value={slug} onChange={setSlug} />
        <div className="flex gap-3">
          <Button3D
            variant="primary"
            size="md"
            onClick={() => course && onSave({ ...course, name, slug })}
            disabled={!name.trim() || !slug.trim()}
          >
            Guardar
          </Button3D>
          <Button3D variant="surface" size="md" onClick={onClose}>
            Cancelar
          </Button3D>
        </div>
      </div>
    </AdminModal>
  );
}

function EditTopicModal({
  topic,
  onClose,
  onSave,
}: {
  topic: AdminTopic | null;
  onClose: () => void;
  onSave: (t: AdminTopic) => void;
}) {
  const [name, setName] = useState('');
  const [order, setOrder] = useState(1);
  const [nodeSize, setNodeSize] = useState(7);
  const [nodeCount, setNodeCount] = useState(1);

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setOrder(topic.order);
      setNodeSize(topic.nodeSize);
      setNodeCount(topic.nodeCount);
    }
  }, [topic?.id]);

  return (
    <AdminModal open={!!topic} onClose={onClose} title="Editar tema" size="sm">
      <div className="space-y-4">
        <TextField label="Nombre" value={name} onChange={setName} />
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="Orden" value={order} onChange={setOrder} />
          <NumberField
            label="Node size"
            value={nodeSize}
            onChange={setNodeSize}
          />
          <NumberField
            label="Node count"
            value={nodeCount}
            onChange={setNodeCount}
          />
        </div>
        <div className="flex gap-3">
          <Button3D
            variant="primary"
            size="md"
            onClick={() =>
              topic && onSave({ ...topic, name, order, nodeSize, nodeCount })
            }
            disabled={!name.trim()}
          >
            Guardar
          </Button3D>
          <Button3D variant="surface" size="md" onClick={onClose}>
            Cancelar
          </Button3D>
        </div>
      </div>
    </AdminModal>
  );
}

// ---------- Feature flags ----------

function FlagsTab() {
  const mock = useAdminMockData();

  const toggle = (key: string) => {
    mock.setData((prev) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: !prev.featureFlags[key],
      },
    }));
    mock.logAction('cambió feature flag', key);
  };

  return (
    <Card3D variant="surface" padding="md">
      <h2 className="text-[16px] font-black text-surface-800 mb-4 flex items-center gap-2">
        <Flag size={18} /> Feature flags
      </h2>
      <div className="space-y-3">
        {Object.entries(mock.featureFlags).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 rounded-2xl bg-surface-50"
          >
            <span className="text-[13px] font-bold text-surface-700">
              {key}
            </span>
            <button
              type="button"
              onClick={() => toggle(key)}
              className={`px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-colors ${
                value
                  ? 'bg-success-500 text-white'
                  : 'bg-surface-200 text-surface-700'
              }`}
            >
              {value ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>
    </Card3D>
  );
}

// ---------- Shared inputs ----------

function TextField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || '0', 10))}
        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-24 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500 resize-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AdminModal({
  open,
  onClose,
  title,
  size = 'md',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}) {
  // Inline minimal modal to avoid import path issues in this file
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full bg-white rounded-[2rem] border-2 border-surface-200 border-b-[6px] shadow-2xl p-6 ${
          size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-surface-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-colors"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
