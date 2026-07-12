export type PhaseType = 'inscripcion' | 'pago' | 'examen' | 'resultados' | 'matricula';

export interface AdmissionPhase {
  id: string;
  type: PhaseType;
  title: string;
  date: Date;
  description: string;
}

export type AlertLevel = 'urgent' | 'info';

export interface AdmisionAlert {
  id: string;
  level: AlertLevel;
  title: string;
  body: string;
  date: string;
}

export interface OfficialDocument {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  size?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subtitle: string;
  format: 'PDF' | 'LINK' | 'VIDEO';
}

export interface OfficialLink {
  id: string;
  label: string;
  url: string;
  color: string;
}

export interface CareerCutoff {
  name: string;
  area: string;
  sede: string;
  scores: { year: number; score: number; vacancies: number }[];
  malla: string[];
  perfil: string;
}

// Fechas de referencia para el proceso de admisión 2026-II / 2027-I.
// En producción estas vendrían del backend o se calcularían desde un CMS.
export const ADMISSION_PHASES: AdmissionPhase[] = [
  {
    id: 'inscripcion-cierra',
    type: 'inscripcion',
    title: 'Cierre de Inscripciones',
    date: new Date('2026-08-15T23:59:59-05:00'),
    description: 'Último día para registrar tu ficha en el SISADMISION.',
  },
  {
    id: 'pago-ordinario',
    type: 'pago',
    title: 'Fin de Pago Ordinario',
    date: new Date('2026-08-16T18:00:00-05:00'),
    description: 'Vence el plazo para pagar el derecho de examen sin recargo.',
  },
  {
    id: 'examen-ordinario-1',
    type: 'examen',
    title: 'Examen Ordinario I Fase',
    date: new Date('2026-09-20T08:00:00-05:00'),
    description: 'Primera fase del examen de admisión presencial.',
  },
  {
    id: 'resultados-ordinario-1',
    type: 'resultados',
    title: 'Publicación de Resultados I Fase',
    date: new Date('2026-09-25T10:00:00-05:00'),
    description: 'Lista de ingresantes y puntajes de corte.',
  },
  {
    id: 'examen-ordinario-2',
    type: 'examen',
    title: 'Examen Ordinario II Fase',
    date: new Date('2026-11-08T08:00:00-05:00'),
    description: 'Segunda fase para carreras con vacantes remanentes.',
  },
  {
    id: 'matricula',
    type: 'matricula',
    title: 'Matrícula de Ingresantes',
    date: new Date('2026-11-20T09:00:00-05:00'),
    description: 'Presenta tus documentos y confirma tu vacante.',
  },
];

export const ALERTS: AdmisionAlert[] = [
  {
    id: 'alerta-1',
    level: 'urgent',
    title: 'Ampliación de pago hasta las 18:00 h',
    body: 'El sistema SISADMISION extiende el plazo de pago ordinario por saturación. Aprovecha antes del cierre.',
    date: 'Hace 2 horas',
  },
  {
    id: 'alerta-2',
    level: 'urgent',
    title: 'Cambio de local: Ciencias Sociales',
    body: 'Los postulantes a Ciencias Sociales rendirán en el Pabellón de Humanidades, no en el de Letras.',
    date: 'Hace 5 horas',
  },
  {
    id: 'info-1',
    level: 'info',
    title: 'Publicado el padrón de locales',
    body: 'Ya puedes consultar tu aula y pabellón asignado con tu DNI.',
    date: 'Ayer',
  },
  {
    id: 'info-2',
    level: 'info',
    title: 'Objetos prohibidos en el examen',
    body: 'No se permite celulares, aretes, relojes ni audífonos. Revisa la lista completa.',
    date: 'Hace 2 días',
  },
  {
    id: 'info-3',
    level: 'info',
    title: 'Horarios de ingreso al local',
    body: 'Apertura de puertas 07:00 h. Cierra 07:45 h. Llega con anticipación.',
    date: 'Hace 3 días',
  },
];

export const OFFICIAL_DOCUMENTS: OfficialDocument[] = [
  {
    id: 'doc-1',
    title: 'Reglamento de Admisión 2026',
    subtitle: 'Versión resumida + PDF completo',
    tag: 'Vigente',
    size: '2.4 MB',
  },
  {
    id: 'doc-2',
    title: 'Cuadro de Vacantes por Proceso',
    subtitle: 'Vacantes por carrera y fase',
    tag: '2026-II',
    size: '1.1 MB',
  },
  {
    id: 'doc-3',
    title: 'Temario Oficial Desglosado',
    subtitle: 'Por áreas: Ingenierías, Biomédicas, Sociales',
    tag: 'PDF',
    size: '3.8 MB',
  },
];

export const STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Prácticas CEPRUNSA 2023–2025',
    subtitle: 'PDFs con claves comentadas',
    format: 'PDF',
  },
  {
    id: 'mat-2',
    title: 'Exámenes de Admisión Pasados',
    subtitle: 'Ordinarios y extraordinarios UNSA',
    format: 'PDF',
  },
  {
    id: 'mat-3',
    title: '50 Fórmulas que no puedes olvidar',
    subtitle: 'Matemática y Física resumidas',
    format: 'PDF',
  },
  {
    id: 'mat-4',
    title: 'Biblioteca Virtual Recomendada',
    subtitle: 'Lumbreras, Khan Academy y más',
    format: 'LINK',
  },
];

export const OFFICIAL_LINKS: OfficialLink[] = [
  {
    id: 'link-1',
    label: 'Facebook Admisión UNSA',
    url: 'https://www.facebook.com/AdmisionUNSA',
    color: '#1877F2',
  },
  {
    id: 'link-2',
    label: 'Web oficial UNSA',
    url: 'https://www.unsa.edu.pe',
    color: '#9B0F1C',
  },
  {
    id: 'link-3',
    label: 'SISADMISION',
    url: 'https://admision.unsa.edu.pe',
    color: '#15192B',
  },
];

export const CAREERS: CareerCutoff[] = [
  {
    name: 'Medicina Humana',
    area: 'Biomédicas',
    sede: 'Av. Independencia',
    scores: [
      { year: 2025, score: 1420, vacancies: 95 },
      { year: 2024, score: 1412, vacancies: 90 },
      { year: 2023, score: 1405, vacancies: 88 },
    ],
    malla: ['Anatomía', 'Fisiología', 'Bioquímica', 'Patología', 'Farmacología'],
    perfil: 'Médico cirujano con formación científica y ética.',
  },
  {
    name: 'Arquitectura',
    area: 'Sociales',
    sede: 'Campus Universitario',
    scores: [
      { year: 2025, score: 1180, vacancies: 70 },
      { year: 2024, score: 1165, vacancies: 68 },
      { year: 2023, score: 1150, vacancies: 65 },
    ],
    malla: ['Diseño Arquitectónico', 'Estructuras', 'Urbanismo', 'Construcción'],
    perfil: 'Arquitecto capaz de diseñar espacios sostenibles.',
  },
  {
    name: 'Ingeniería de Sistemas',
    area: 'Ingenierías',
    sede: 'Av. Independencia',
    scores: [
      { year: 2025, score: 1250, vacancies: 120 },
      { year: 2024, score: 1230, vacancies: 115 },
      { year: 2023, score: 1210, vacancies: 110 },
    ],
    malla: ['Programación', 'Bases de Datos', 'Redes', 'Inteligencia Artificial'],
    perfil: 'Ingeniero con visión tecnológica y empresarial.',
  },
  {
    name: 'Derecho',
    area: 'Sociales',
    sede: 'Palacio Universitario',
    scores: [
      { year: 2025, score: 1195, vacancies: 180 },
      { year: 2024, score: 1180, vacancies: 175 },
      { year: 2023, score: 1160, vacancies: 170 },
    ],
    malla: ['Derecho Constitucional', 'Penal', 'Civil', 'Procesal'],
    perfil: 'Abogado con sólida formación en justicia y derechos.',
  },
  {
    name: 'Administración',
    area: 'Sociales',
    sede: 'Campus Universitario',
    scores: [
      { year: 2025, score: 1050, vacancies: 200 },
      { year: 2024, score: 1040, vacancies: 195 },
      { year: 2023, score: 1030, vacancies: 190 },
    ],
    malla: ['Marketing', 'Finanzas', 'Gestión', 'Emprendimiento'],
    perfil: 'Gestor estratégico de organizaciones públicas y privadas.',
  },
  {
    name: 'Ingeniería Civil',
    area: 'Ingenierías',
    sede: 'Av. Independencia',
    scores: [
      { year: 2025, score: 1280, vacancies: 100 },
      { year: 2024, score: 1260, vacancies: 95 },
      { year: 2023, score: 1240, vacancies: 92 },
    ],
    malla: ['Mecánica de Suelos', 'Estructuras', 'Hidráulica', 'Vías'],
    perfil: 'Ingeniero civil proyectista y constructor.',
  },
  {
    name: 'Psicología',
    area: 'Sociales',
    sede: 'Palacio Universitario',
    scores: [
      { year: 2025, score: 1150, vacancies: 90 },
      { year: 2024, score: 1135, vacancies: 85 },
      { year: 2023, score: 1120, vacancies: 80 },
    ],
    malla: ['Psicología Clínica', 'Educacional', 'Social', 'Organizacional'],
    perfil: 'Psicólogo con enfoque humanista e investigativo.',
  },
  {
    name: 'Odontología',
    area: 'Biomédicas',
    sede: 'Av. Independencia',
    scores: [
      { year: 2025, score: 1380, vacancies: 55 },
      { year: 2024, score: 1365, vacancies: 50 },
      { year: 2023, score: 1350, vacancies: 48 },
    ],
    malla: ['Anatomía Dental', 'Operatoria', 'Periodoncia', 'Cirugía Bucal'],
    perfil: 'Odontólogo con formación clínica y preventiva.',
  },
];

export function getCurrentPhase(): AdmissionPhase {
  const now = new Date();
  const upcoming = ADMISSION_PHASES.filter((p) => p.date.getTime() > now.getTime());
  if (upcoming.length === 0) return ADMISSION_PHASES[ADMISSION_PHASES.length - 1];
  return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
}

export function formatCountdown(target: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = new Date().getTime();
  const distance = target.getTime() - now;

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    expired: false,
  };
}

export function formatPhaseTitle(phase: AdmissionPhase): string {
  const { days, hours, expired } = formatCountdown(phase.date);
  if (expired) return `${phase.title} — en curso`;

  if (days > 0) {
    return `Faltan ${days} ${days === 1 ? 'Día' : 'Días'} para el ${phase.title}`;
  }
  if (hours > 0) {
    return `Faltan ${hours} ${hours === 1 ? 'Hora' : 'Horas'} para el ${phase.title}`;
  }
  return `Faltan minutos para el ${phase.title}`;
}
