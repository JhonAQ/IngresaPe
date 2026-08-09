export type PhaseType =
  | 'inscripcion'
  | 'pago'
  | 'examen'
  | 'resultados'
  | 'matricula';

export interface AdmissionPhase {
  id: string;
  type: PhaseType;
  title: string;
  date: string;
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
  url?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subtitle: string;
  format: 'PDF' | 'LINK' | 'VIDEO';
  url?: string;
}

export interface OfficialLink {
  id: string;
  label: string;
  url: string;
  color: string;
}

export interface CareerCutoff {
  id: string;
  name: string;
  area: string;
  sede: string;
  scores: { year: number; score: number; vacancies: number }[];
  malla: string[];
  perfil: string;
}

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'escalated';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  assignedTo?: string;
}

export interface ReportedQuestion {
  id: string;
  questionId: string;
  statement: string;
  topicName: string;
  reason: string;
  reportedBy: string;
  count: number;
  status: 'pending' | 'reviewed' | 'fixed' | 'dismissed';
}

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  severity: BugSeverity;
  status: BugStatus;
  platform: string;
  version: string;
  reporter: string;
  createdAt: string;
}

export type NotificationAudience =
  | 'all'
  | 'free'
  | 'premium'
  | 'inactive'
  | 'career';
export type NotificationStatus = 'scheduled' | 'sent' | 'failed';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  deepLink?: string;
  audience: NotificationAudience;
  scheduledAt?: string;
  sentAt?: string;
  status: NotificationStatus;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'DATA_ENTRY';
  isPremium: boolean;
  streak: number;
  gems: number;
  energy: number;
  lastActiveAt: string;
  career?: string;
}

export interface AnalyticsSnapshot {
  totalUsers: number;
  activeToday: number;
  active7d: number;
  active30d: number;
  newThisWeek: number;
  approvedToday: number;
  revenueThisMonth: number;
  retentionD1: number;
  retentionD7: number;
  retentionD30: number;
  dailyActive: { date: string; value: number }[];
  signups: { date: string; value: number }[];
  byArea: { name: string; value: number }[];
  activityByCourse: { name: string; lessons: number; simulacros: number }[];
  topPages: { path: string; views: number }[];
  topUsers: { name: string; actions: number }[];
}

export interface AdminCourse {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
}

export interface AdminTopic {
  id: string;
  courseId: string;
  name: string;
  slug: string;
  order: number;
  nodeSize: number;
  nodeCount: number;
  summary: unknown;
}

export interface AdminExam {
  id: string;
  title: string;
  year: number;
  phase?: string;
  type?: string;
  questionCount: number;
  timeLimitMinutes: number;
}

export interface AdminActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface AdminMockData {
  phases: AdmissionPhase[];
  alerts: AdmisionAlert[];
  documents: OfficialDocument[];
  materials: StudyMaterial[];
  links: OfficialLink[];
  cutoffs: CareerCutoff[];
  tickets: SupportTicket[];
  reportedQuestions: ReportedQuestion[];
  bugs: BugReport[];
  notifications: PushNotification[];
  users: AdminUser[];
  analytics: AnalyticsSnapshot;
  courses: AdminCourse[];
  topics: AdminTopic[];
  questions: unknown[];
  exams: AdminExam[];
  simulacroDate: string;
  featureFlags: Record<string, boolean>;
  activityLog: AdminActivityLog[];
}

export type Updater<T> = (prev: T) => T;
