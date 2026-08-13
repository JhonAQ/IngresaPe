'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Newspaper } from 'lucide-react';
import { useAdminMockData } from '../../../../hooks/admin/useAdminMockData';
import { AdminTabs } from '../../../../components/admin/AdminTabs';
import { AdminModal } from '../../../../components/admin/AdminModal';
import { Button3D } from '@ingresa-pe/ui';
import { Card3D } from '@ingresa-pe/ui';
import { Badge } from '../../../../components/admin/Badge';
import type {
  AdmissionPhase,
  AdmisionAlert,
  OfficialDocument,
  StudyMaterial,
  OfficialLink,
  CareerCutoff,
  PhaseType,
  AlertLevel,
} from '../../../../lib/admin/types';

type Tab =
  | 'phases'
  | 'alerts'
  | 'documents'
  | 'materials'
  | 'links'
  | 'cutoffs';

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>('phases');

  return (
    <div className="space-y-6">
      <AdminTabs
        tabs={[
          { value: 'phases', label: 'Fases' },
          { value: 'alerts', label: 'Alertas' },
          { value: 'documents', label: 'Documentos' },
          { value: 'materials', label: 'Materiales' },
          { value: 'links', label: 'Links' },
          { value: 'cutoffs', label: 'Cortes' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'phases' && <PhasesTab />}
      {tab === 'alerts' && <AlertsTab />}
      {tab === 'documents' && <DocumentsTab />}
      {tab === 'materials' && <MaterialsTab />}
      {tab === 'links' && <LinksTab />}
      {tab === 'cutoffs' && <CutoffsTab />}
    </div>
  );
}

// ---------- Phases ----------

function PhasesTab() {
  const mock = useAdminMockData();
  const [editing, setEditing] = useState<AdmissionPhase | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const save = (item: AdmissionPhase) => {
    const exists = mock.phases.some((p) => p.id === item.id);
    mock.setData((prev) => ({
      ...prev,
      phases: exists
        ? prev.phases.map((p) => (p.id === item.id ? item : p))
        : [...prev.phases, item],
    }));
    mock.logAction(exists ? 'editó fase' : 'creó fase', item.title);
    setIsOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    mock.setData((prev) => ({
      ...prev,
      phases: prev.phases.filter((p) => p.id !== id),
    }));
    mock.logAction('eliminó fase', id);
  };

  return (
    <Card3D variant="surface" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-black text-surface-800">
          Fases de admisión
        </h2>
        <Button3D
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing({
              id: `phase-${Date.now()}`,
              type: 'inscripcion',
              title: '',
              date: '',
              description: '',
            });
            setIsOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Agregar
        </Button3D>
      </div>

      <div className="space-y-3">
        {mock.phases.map((p) => (
          <ListItem
            key={p.id}
            title={p.title}
            subtitle={`${p.type} · ${new Date(p.date).toLocaleString('es-PE')}`}
            description={p.description}
            onEdit={() => {
              setEditing(p);
              setIsOpen(true);
            }}
            onDelete={() => remove(p.id)}
          />
        ))}
      </div>

      <PhaseModal
        item={editing}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </Card3D>
  );
}

function PhaseModal({
  item,
  open,
  onClose,
  onSave,
}: {
  item: AdmissionPhase | null;
  open: boolean;
  onClose: () => void;
  onSave: (i: AdmissionPhase) => void;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [type, setType] = useState<PhaseType>(item?.type ?? 'inscripcion');
  const [date, setDate] = useState(item?.date ?? '');
  const [description, setDescription] = useState(item?.description ?? '');

  if (item && title !== item.title) {
    setTitle(item.title);
    setType(item.type);
    setDate(item.date);
    setDescription(item.description);
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={item?.title ? 'Editar fase' : 'Nueva fase'}
      size="md"
    >
      <div className="space-y-4">
        <TextField label="Título" value={title} onChange={setTitle} />
        <SelectField
          label="Tipo"
          value={type}
          onChange={(v) => setType(v as PhaseType)}
          options={[
            { value: 'inscripcion', label: 'Inscripción' },
            { value: 'pago', label: 'Pago' },
            { value: 'examen', label: 'Examen' },
            { value: 'resultados', label: 'Resultados' },
            { value: 'matricula', label: 'Matrícula' },
          ]}
        />
        <TextField
          label="Fecha"
          value={date}
          onChange={setDate}
          type="datetime-local"
        />
        <TextAreaField
          label="Descripción"
          value={description}
          onChange={setDescription}
        />
        <div className="flex gap-3 pt-2">
          <Button3D
            variant="primary"
            size="md"
            onClick={() =>
              item && onSave({ ...item, title, type, date, description })
            }
            disabled={!title.trim() || !date}
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

// ---------- Alerts ----------

function AlertsTab() {
  const mock = useAdminMockData();
  const [editing, setEditing] = useState<AdmisionAlert | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const save = (item: AdmisionAlert) => {
    const exists = mock.alerts.some((a) => a.id === item.id);
    mock.setData((prev) => ({
      ...prev,
      alerts: exists
        ? prev.alerts.map((a) => (a.id === item.id ? item : a))
        : [...prev.alerts, item],
    }));
    mock.logAction(exists ? 'editó alerta' : 'creó alerta', item.title);
    setIsOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    mock.setData((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((a) => a.id !== id),
    }));
    mock.logAction('eliminó alerta', id);
  };

  return (
    <Card3D variant="surface" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-black text-surface-800">Alertas</h2>
        <Button3D
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing({
              id: `alert-${Date.now()}`,
              level: 'info',
              title: '',
              body: '',
              date: '',
            });
            setIsOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Agregar
        </Button3D>
      </div>

      <div className="space-y-3">
        {mock.alerts.map((a) => (
          <ListItem
            key={a.id}
            title={a.title}
            subtitle={a.date}
            description={a.body}
            badge={
              <Badge variant={a.level === 'urgent' ? 'error' : 'info'}>
                {a.level === 'urgent' ? 'Urgente' : 'Info'}
              </Badge>
            }
            onEdit={() => {
              setEditing(a);
              setIsOpen(true);
            }}
            onDelete={() => remove(a.id)}
          />
        ))}
      </div>

      <AlertModal
        item={editing}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </Card3D>
  );
}

function AlertModal({
  item,
  open,
  onClose,
  onSave,
}: {
  item: AdmisionAlert | null;
  open: boolean;
  onClose: () => void;
  onSave: (i: AdmisionAlert) => void;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [level, setLevel] = useState<AlertLevel>(item?.level ?? 'info');
  const [body, setBody] = useState(item?.body ?? '');
  const [date, setDate] = useState(item?.date ?? '');

  if (item && title !== item.title) {
    setTitle(item.title);
    setLevel(item.level);
    setBody(item.body);
    setDate(item.date);
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={item?.title ? 'Editar alerta' : 'Nueva alerta'}
      size="md"
    >
      <div className="space-y-4">
        <TextField label="Título" value={title} onChange={setTitle} />
        <SelectField
          label="Nivel"
          value={level}
          onChange={(v) => setLevel(v as AlertLevel)}
          options={[
            { value: 'urgent', label: 'Urgente' },
            { value: 'info', label: 'Informativa' },
          ]}
        />
        <TextField
          label="Fecha / Hace cuánto"
          value={date}
          onChange={setDate}
          placeholder="Ej: Hace 2 horas"
        />
        <TextAreaField label="Cuerpo" value={body} onChange={setBody} />
        <div className="flex gap-3 pt-2">
          <Button3D
            variant="primary"
            size="md"
            onClick={() =>
              item && onSave({ ...item, title, level, body, date })
            }
            disabled={!title.trim() || !body.trim()}
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

// ---------- Documents ----------

function DocumentsTab() {
  const mock = useAdminMockData();
  const [editing, setEditing] = useState<OfficialDocument | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const save = (item: OfficialDocument) => {
    const exists = mock.documents.some((d) => d.id === item.id);
    mock.setData((prev) => ({
      ...prev,
      documents: exists
        ? prev.documents.map((d) => (d.id === item.id ? item : d))
        : [...prev.documents, item],
    }));
    mock.logAction(exists ? 'editó documento' : 'creó documento', item.title);
    setIsOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    mock.setData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
    mock.logAction('eliminó documento', id);
  };

  return (
    <Card3D variant="surface" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-black text-surface-800">
          Documentos oficiales
        </h2>
        <Button3D
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing({
              id: `doc-${Date.now()}`,
              title: '',
              subtitle: '',
              tag: '',
              size: '',
              url: '',
            });
            setIsOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Agregar
        </Button3D>
      </div>

      <div className="space-y-3">
        {mock.documents.map((d) => (
          <ListItem
            key={d.id}
            title={d.title}
            subtitle={d.subtitle}
            description={`Tag: ${d.tag} · ${d.size}`}
            badge={<Badge>{d.tag}</Badge>}
            onEdit={() => {
              setEditing(d);
              setIsOpen(true);
            }}
            onDelete={() => remove(d.id)}
          />
        ))}
      </div>

      <DocumentModal
        item={editing}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </Card3D>
  );
}

function DocumentModal({
  item,
  open,
  onClose,
  onSave,
}: {
  item: OfficialDocument | null;
  open: boolean;
  onClose: () => void;
  onSave: (i: OfficialDocument) => void;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [subtitle, setSubtitle] = useState(item?.subtitle ?? '');
  const [tag, setTag] = useState(item?.tag ?? '');
  const [size, setSize] = useState(item?.size ?? '');
  const [url, setUrl] = useState(item?.url ?? '');

  if (item && title !== item.title) {
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setTag(item.tag);
    setSize(item.size ?? '');
    setUrl(item.url ?? '');
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={item?.title ? 'Editar documento' : 'Nuevo documento'}
      size="md"
    >
      <div className="space-y-4">
        <TextField label="Título" value={title} onChange={setTitle} />
        <TextField label="Subtítulo" value={subtitle} onChange={setSubtitle} />
        <TextField label="Tag" value={tag} onChange={setTag} />
        <TextField
          label="Tamaño"
          value={size}
          onChange={setSize}
          placeholder="Ej: 2.4 MB"
        />
        <TextField label="URL" value={url} onChange={setUrl} />
        <div className="flex gap-3 pt-2">
          <Button3D
            variant="primary"
            size="md"
            onClick={() =>
              item && onSave({ ...item, title, subtitle, tag, size, url })
            }
            disabled={!title.trim()}
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

// ---------- Materials ----------

function MaterialsTab() {
  const mock = useAdminMockData();
  const [editing, setEditing] = useState<StudyMaterial | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const save = (item: StudyMaterial) => {
    const exists = mock.materials.some((m) => m.id === item.id);
    mock.setData((prev) => ({
      ...prev,
      materials: exists
        ? prev.materials.map((m) => (m.id === item.id ? item : m))
        : [...prev.materials, item],
    }));
    mock.logAction(exists ? 'editó material' : 'creó material', item.title);
    setIsOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    mock.setData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
    mock.logAction('eliminó material', id);
  };

  return (
    <Card3D variant="surface" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-black text-surface-800">
          Materiales de estudio
        </h2>
        <Button3D
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing({
              id: `mat-${Date.now()}`,
              title: '',
              subtitle: '',
              format: 'PDF',
              url: '',
            });
            setIsOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Agregar
        </Button3D>
      </div>

      <div className="space-y-3">
        {mock.materials.map((m) => (
          <ListItem
            key={m.id}
            title={m.title}
            subtitle={m.subtitle}
            description={`Formato: ${m.format}`}
            badge={<Badge variant="info">{m.format}</Badge>}
            onEdit={() => {
              setEditing(m);
              setIsOpen(true);
            }}
            onDelete={() => remove(m.id)}
          />
        ))}
      </div>

      <MaterialModal
        item={editing}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </Card3D>
  );
}

function MaterialModal({
  item,
  open,
  onClose,
  onSave,
}: {
  item: StudyMaterial | null;
  open: boolean;
  onClose: () => void;
  onSave: (i: StudyMaterial) => void;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [subtitle, setSubtitle] = useState(item?.subtitle ?? '');
  const [format, setFormat] = useState<StudyMaterial['format']>(
    item?.format ?? 'PDF'
  );
  const [url, setUrl] = useState(item?.url ?? '');

  if (item && title !== item.title) {
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setFormat(item.format);
    setUrl(item.url ?? '');
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={item?.title ? 'Editar material' : 'Nuevo material'}
      size="md"
    >
      <div className="space-y-4">
        <TextField label="Título" value={title} onChange={setTitle} />
        <TextField label="Subtítulo" value={subtitle} onChange={setSubtitle} />
        <SelectField
          label="Formato"
          value={format}
          onChange={(v) => setFormat(v as StudyMaterial['format'])}
          options={[
            { value: 'PDF', label: 'PDF' },
            { value: 'LINK', label: 'Link' },
            { value: 'VIDEO', label: 'Video' },
          ]}
        />
        <TextField label="URL" value={url} onChange={setUrl} />
        <div className="flex gap-3 pt-2">
          <Button3D
            variant="primary"
            size="md"
            onClick={() =>
              item && onSave({ ...item, title, subtitle, format, url })
            }
            disabled={!title.trim()}
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

// ---------- Links ----------

function LinksTab() {
  const mock = useAdminMockData();
  const [editing, setEditing] = useState<OfficialLink | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const save = (item: OfficialLink) => {
    const exists = mock.links.some((l) => l.id === item.id);
    mock.setData((prev) => ({
      ...prev,
      links: exists
        ? prev.links.map((l) => (l.id === item.id ? item : l))
        : [...prev.links, item],
    }));
    mock.logAction(exists ? 'editó link' : 'creó link', item.label);
    setIsOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    mock.setData((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
    }));
    mock.logAction('eliminó link', id);
  };

  return (
    <Card3D variant="surface" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-black text-surface-800">
          Links oficiales
        </h2>
        <Button3D
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing({
              id: `link-${Date.now()}`,
              label: '',
              url: '',
              color: '#000000',
            });
            setIsOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Agregar
        </Button3D>
      </div>

      <div className="space-y-3">
        {mock.links.map((l) => (
          <ListItem
            key={l.id}
            title={l.label}
            subtitle={l.url}
            badge={
              <span
                className="w-4 h-4 rounded-full border-2 border-surface-200"
                style={{ backgroundColor: l.color }}
              />
            }
            onEdit={() => {
              setEditing(l);
              setIsOpen(true);
            }}
            onDelete={() => remove(l.id)}
          />
        ))}
      </div>

      <LinkModal
        item={editing}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </Card3D>
  );
}

function LinkModal({
  item,
  open,
  onClose,
  onSave,
}: {
  item: OfficialLink | null;
  open: boolean;
  onClose: () => void;
  onSave: (i: OfficialLink) => void;
}) {
  const [label, setLabel] = useState(item?.label ?? '');
  const [url, setUrl] = useState(item?.url ?? '');
  const [color, setColor] = useState(item?.color ?? '#000000');

  if (item && label !== item.label) {
    setLabel(item.label);
    setUrl(item.url);
    setColor(item.color);
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={item?.label ? 'Editar link' : 'Nuevo link'}
      size="md"
    >
      <div className="space-y-4">
        <TextField label="Etiqueta" value={label} onChange={setLabel} />
        <TextField label="URL" value={url} onChange={setUrl} />
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-surface-500 mb-1.5">
            Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 rounded-xl border-2 border-slate-200 bg-slate-50"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button3D
            variant="primary"
            size="md"
            onClick={() => item && onSave({ ...item, label, url, color })}
            disabled={!label.trim() || !url.trim()}
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

// ---------- Cutoffs ----------

function CutoffsTab() {
  const mock = useAdminMockData();
  const [editing, setEditing] = useState<CareerCutoff | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const save = (item: CareerCutoff) => {
    const exists = mock.cutoffs.some((c) => c.id === item.id);
    mock.setData((prev) => ({
      ...prev,
      cutoffs: exists
        ? prev.cutoffs.map((c) => (c.id === item.id ? item : c))
        : [...prev.cutoffs, item],
    }));
    mock.logAction(exists ? 'editó corte' : 'creó corte', item.name);
    setIsOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    mock.setData((prev) => ({
      ...prev,
      cutoffs: prev.cutoffs.filter((c) => c.id !== id),
    }));
    mock.logAction('eliminó corte', id);
  };

  return (
    <Card3D variant="surface" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-black text-surface-800">
          Puntajes de corte
        </h2>
        <Button3D
          variant="primary"
          size="sm"
          onClick={() => {
            setEditing({
              id: `cutoff-${Date.now()}`,
              name: '',
              area: '',
              sede: '',
              scores: [],
              malla: [],
              perfil: '',
            });
            setIsOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Agregar
        </Button3D>
      </div>

      <div className="space-y-3">
        {mock.cutoffs.map((c) => (
          <ListItem
            key={c.id}
            title={c.name}
            subtitle={`${c.area} · ${c.sede}`}
            description={`Último puntaje: ${c.scores[0]?.score ?? '—'} (${
              c.scores[0]?.year ?? '—'
            })`}
            onEdit={() => {
              setEditing(c);
              setIsOpen(true);
            }}
            onDelete={() => remove(c.id)}
          />
        ))}
      </div>

      <CutoffModal
        item={editing}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </Card3D>
  );
}

function CutoffModal({
  item,
  open,
  onClose,
  onSave,
}: {
  item: CareerCutoff | null;
  open: boolean;
  onClose: () => void;
  onSave: (i: CareerCutoff) => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [area, setArea] = useState(item?.area ?? '');
  const [sede, setSede] = useState(item?.sede ?? '');
  const [perfil, setPerfil] = useState(item?.perfil ?? '');

  if (item && name !== item.name) {
    setName(item.name);
    setArea(item.area);
    setSede(item.sede);
    setPerfil(item.perfil);
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={item?.name ? 'Editar corte' : 'Nuevo corte'}
      size="md"
    >
      <div className="space-y-4">
        <TextField label="Carrera" value={name} onChange={setName} />
        <TextField label="Área" value={area} onChange={setArea} />
        <TextField label="Sede" value={sede} onChange={setSede} />
        <TextAreaField label="Perfil" value={perfil} onChange={setPerfil} />
        <div className="flex gap-3 pt-2">
          <Button3D
            variant="primary"
            size="md"
            onClick={() =>
              item && onSave({ ...item, name, area, sede, perfil })
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

// ---------- Shared UI ----------

function ListItem({
  title,
  subtitle,
  description,
  badge,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-50 hover:bg-surface-100 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white border-2 border-surface-200 flex items-center justify-center shrink-0">
        <Newspaper size={18} className="text-surface-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black text-surface-800 truncate">
            {title}
          </span>
          {badge}
        </div>
        {subtitle && (
          <div className="text-[11px] font-bold text-surface-400 truncate">
            {subtitle}
          </div>
        )}
        {description && (
          <div className="text-[11px] font-bold text-surface-500 truncate">
            {description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="w-9 h-9 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-9 h-9 rounded-xl bg-error-100 text-error-500 flex items-center justify-center hover:bg-error-200 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500"
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
        className="w-full h-28 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-surface-800 font-bold placeholder:text-surface-400 focus:outline-none focus:border-blue-500 resize-none"
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
