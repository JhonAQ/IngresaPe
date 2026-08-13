import type { AdminMockData } from './types';

export const initialMockData: AdminMockData = {
  phases: [
    {
      id: 'inscripcion-cierra',
      type: 'inscripcion',
      title: 'Cierre de Inscripciones',
      date: '2026-08-15T23:59:59-05:00',
      description: 'Último día para registrar tu ficha en el SISADMISION.',
    },
    {
      id: 'pago-ordinario',
      type: 'pago',
      title: 'Fin de Pago Ordinario',
      date: '2026-08-16T18:00:00-05:00',
      description:
        'Vence el plazo para pagar el derecho de examen sin recargo.',
    },
    {
      id: 'examen-ordinario-1',
      type: 'examen',
      title: 'Examen Ordinario I Fase',
      date: '2026-09-20T08:00:00-05:00',
      description: 'Primera fase del examen de admisión presencial.',
    },
    {
      id: 'resultados-ordinario-1',
      type: 'resultados',
      title: 'Publicación de Resultados I Fase',
      date: '2026-09-25T10:00:00-05:00',
      description: 'Lista de ingresantes y puntajes de corte.',
    },
    {
      id: 'matricula',
      type: 'matricula',
      title: 'Matrícula de Ingresantes',
      date: '2026-11-20T09:00:00-05:00',
      description: 'Presenta tus documentos y confirma tu vacante.',
    },
  ],
  alerts: [
    {
      id: 'alerta-1',
      level: 'urgent',
      title: 'Ampliación de pago hasta las 18:00 h',
      body: 'El sistema SISADMISION extiende el plazo de pago ordinario por saturación.',
      date: 'Hace 2 horas',
    },
    {
      id: 'alerta-2',
      level: 'urgent',
      title: 'Cambio de local: Ciencias Sociales',
      body: 'Los postulantes a Ciencias Sociales rendirán en el Pabellón de Humanidades.',
      date: 'Hace 5 horas',
    },
    {
      id: 'info-1',
      level: 'info',
      title: 'Publicado el padrón de locales',
      body: 'Ya puedes consultar tu aula y pabellón asignado con tu DNI.',
      date: 'Ayer',
    },
  ],
  documents: [
    {
      id: 'doc-1',
      title: 'Reglamento de Admisión 2026',
      subtitle: 'Versión resumida + PDF completo',
      tag: 'Vigente',
      size: '2.4 MB',
      url: '#',
    },
    {
      id: 'doc-2',
      title: 'Cuadro de Vacantes por Proceso',
      subtitle: 'Vacantes por carrera y fase',
      tag: '2026-II',
      size: '1.1 MB',
      url: '#',
    },
    {
      id: 'doc-3',
      title: 'Temario Oficial Desglosado',
      subtitle: 'Por áreas: Ingenierías, Biomédicas, Sociales',
      tag: 'PDF',
      size: '3.8 MB',
      url: '#',
    },
  ],
  materials: [
    {
      id: 'mat-1',
      title: 'Prácticas CEPRUNSA 2023–2025',
      subtitle: 'PDFs con claves comentadas',
      format: 'PDF',
      url: '#',
    },
    {
      id: 'mat-2',
      title: 'Exámenes de Admisión Pasados',
      subtitle: 'Ordinarios y extraordinarios UNSA',
      format: 'PDF',
      url: '#',
    },
    {
      id: 'mat-3',
      title: 'Biblioteca Virtual Recomendada',
      subtitle: 'Lumbreras, Khan Academy y más',
      format: 'LINK',
      url: '#',
    },
  ],
  links: [
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
  ],
  cutoffs: [
    {
      id: 'cutoff-1',
      name: 'Medicina Humana',
      area: 'Biomédicas',
      sede: 'Av. Independencia',
      scores: [
        { year: 2025, score: 1420, vacancies: 95 },
        { year: 2024, score: 1412, vacancies: 90 },
        { year: 2023, score: 1405, vacancies: 88 },
      ],
      malla: [
        'Anatomía',
        'Fisiología',
        'Bioquímica',
        'Patología',
        'Farmacología',
      ],
      perfil: 'Médico cirujano con formación científica y ética.',
    },
    {
      id: 'cutoff-2',
      name: 'Ingeniería de Sistemas',
      area: 'Ingenierías',
      sede: 'Av. Independencia',
      scores: [
        { year: 2025, score: 1250, vacancies: 120 },
        { year: 2024, score: 1230, vacancies: 115 },
        { year: 2023, score: 1210, vacancies: 110 },
      ],
      malla: [
        'Programación',
        'Bases de Datos',
        'Redes',
        'Inteligencia Artificial',
      ],
      perfil: 'Ingeniero con visión tecnológica y empresarial.',
    },
  ],
  tickets: [
    {
      id: 'ticket-1',
      userId: 'u-1',
      userName: 'Juan Pérez',
      subject: 'No puedo iniciar sesión con Google',
      category: 'Auth',
      priority: 'high',
      status: 'open',
      createdAt: '2026-07-17T10:00:00Z',
    },
    {
      id: 'ticket-2',
      userId: 'u-2',
      userName: 'María López',
      subject: 'Mi pago no aparece reflejado',
      category: 'Pagos',
      priority: 'urgent',
      status: 'in_progress',
      createdAt: '2026-07-16T18:30:00Z',
      assignedTo: 'Soporte 1',
    },
    {
      id: 'ticket-3',
      userId: 'u-3',
      userName: 'Carlos Ruiz',
      subject: 'Pregunta con alternativa duplicada',
      category: 'Contenido',
      priority: 'medium',
      status: 'resolved',
      createdAt: '2026-07-15T09:15:00Z',
    },
  ],
  reportedQuestions: [
    {
      id: 'rq-1',
      questionId: 'q-1',
      statement: '¿Cuál es la derivada de x²?',
      topicName: 'Cálculo',
      reason: 'Respuesta incorrecta',
      reportedBy: 'Ana M.',
      count: 3,
      status: 'pending',
    },
    {
      id: 'rq-2',
      questionId: 'q-2',
      statement: 'Completa la oración: El sol es una ___',
      topicName: 'RV',
      reason: 'Poco clara',
      reportedBy: 'Luis R.',
      count: 1,
      status: 'reviewed',
    },
  ],
  bugs: [
    {
      id: 'bug-1',
      title: 'Modal de simulacro se corta en pantallas pequeñas',
      description: 'En iPhone SE el modal de ficha óptica tiene scroll extra.',
      stepsToReproduce: '1. Abrir simulacro. 2. Ver ficha óptica.',
      severity: 'high',
      status: 'open',
      platform: 'iOS Safari',
      version: '1.0.3',
      reporter: 'Pedro G.',
      createdAt: '2026-07-17T08:00:00Z',
    },
    {
      id: 'bug-2',
      title: 'Botón de compra no se deshabilita sin gemas',
      description: 'En la tienda se puede tocar comprar aunque el saldo sea 0.',
      stepsToReproduce:
        '1. Gastar todas las gemas. 2. Ir a tienda. 3. Tocar comprar.',
      severity: 'medium',
      status: 'in_progress',
      platform: 'Android Chrome',
      version: '1.0.3',
      reporter: 'Sofía T.',
      createdAt: '2026-07-16T14:20:00Z',
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      title: 'Nuevo simulacro oficial este fin de semana',
      body: 'No olvides participar para subir de división.',
      deepLink: '/simulacros',
      audience: 'all',
      sentAt: '2026-07-14T10:00:00Z',
      status: 'sent',
    },
  ],
  users: [
    {
      id: 'u-1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'USER',
      isPremium: false,
      streak: 5,
      gems: 120,
      energy: 20,
      lastActiveAt: '2026-07-17T12:00:00Z',
      career: 'Ingeniería de Sistemas',
    },
    {
      id: 'u-2',
      name: 'María López',
      email: 'maria@example.com',
      role: 'USER',
      isPremium: true,
      streak: 12,
      gems: 340,
      energy: 25,
      lastActiveAt: '2026-07-16T20:00:00Z',
      career: 'Medicina Humana',
    },
    {
      id: 'u-3',
      name: 'Carlos Ruiz',
      email: 'carlos@example.com',
      role: 'USER',
      isPremium: false,
      streak: 0,
      gems: 50,
      energy: 10,
      lastActiveAt: '2026-07-10T09:00:00Z',
      career: 'Derecho',
    },
  ],
  analytics: {
    totalUsers: 1248,
    activeToday: 312,
    active7d: 876,
    active30d: 1102,
    newThisWeek: 94,
    approvedToday: 4,
    revenueThisMonth: 1235.0,
    retentionD1: 42,
    retentionD7: 28,
    retentionD30: 18,
    dailyActive: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      value: 200 + Math.floor(Math.random() * 150),
    })),
    signups: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      value: 5 + Math.floor(Math.random() * 20),
    })),
    byArea: [
      { name: 'Ingenierías', value: 420 },
      { name: 'Biomédicas', value: 380 },
      { name: 'Sociales', value: 310 },
      { name: 'Sin carrera', value: 138 },
    ],
    activityByCourse: [
      { name: 'Matemática', lessons: 1200, simulacros: 340 },
      { name: 'Química', lessons: 980, simulacros: 210 },
      { name: 'Física', lessons: 870, simulacros: 250 },
      { name: 'RV', lessons: 1100, simulacros: 400 },
    ],
    topPages: [
      { path: '/dashboard', views: 12400 },
      { path: '/simulacros', views: 8300 },
      { path: '/news', views: 6100 },
      { path: '/ranking', views: 5400 },
      { path: '/perfil', views: 4200 },
    ],
    topUsers: [
      { name: 'María López', actions: 342 },
      { name: 'Juan Pérez', actions: 298 },
      { name: 'Sofía T.', actions: 245 },
    ],
  },
  courses: [
    { id: 'course-1', name: 'Matemática', slug: 'matematica', iconUrl: '' },
    { id: 'course-2', name: 'Química', slug: 'quimica', iconUrl: '' },
    { id: 'course-3', name: 'Física', slug: 'fisica', iconUrl: '' },
    {
      id: 'course-4',
      name: 'Razonamiento Verbal',
      slug: 'razonamiento-verbal',
      iconUrl: '',
    },
  ],
  topics: [
    {
      id: 'topic-1',
      courseId: 'course-1',
      name: 'Ecuaciones Lineales',
      slug: 'ecuaciones-lineales',
      order: 1,
      nodeSize: 7,
      nodeCount: 3,
      summary: [],
    },
    {
      id: 'topic-2',
      courseId: 'course-1',
      name: 'Funciones Cuadráticas',
      slug: 'funciones-cuadraticas',
      order: 2,
      nodeSize: 7,
      nodeCount: 3,
      summary: [],
    },
  ],
  questions: [],
  exams: [
    {
      id: 'exam-1',
      title: 'Admisión UNSA 2024 - Fase I',
      year: 2024,
      phase: 'I',
      type: 'ORDINARIO',
      questionCount: 100,
      timeLimitMinutes: 120,
    },
  ],
  simulacroDate: '2026-07-19T09:00:00-05:00',
  featureFlags: {
    enableShop: true,
    enableRanking: true,
    enableSimulacro: true,
    enableSubscriptions: true,
  },
  activityLog: [
    {
      id: 'log-1',
      actor: 'Admin',
      action: 'aprobó suscripción',
      target: 'María López',
      createdAt: '2026-07-17T11:00:00Z',
    },
    {
      id: 'log-2',
      actor: 'Admin',
      action: 'envió notificación',
      target: 'Simulacro oficial',
      createdAt: '2026-07-16T10:00:00Z',
    },
  ],
};

export function loadMockData(): AdminMockData {
  if (typeof window === 'undefined') return initialMockData;
  try {
    const raw = localStorage.getItem('ingresa-admin-mock-data');
    if (!raw) return initialMockData;
    const parsed = JSON.parse(raw) as Partial<AdminMockData>;
    return { ...initialMockData, ...parsed };
  } catch {
    return initialMockData;
  }
}

export function saveMockData(data: AdminMockData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('ingresa-admin-mock-data', JSON.stringify(data));
  } catch {
    // ignore
  }
}
