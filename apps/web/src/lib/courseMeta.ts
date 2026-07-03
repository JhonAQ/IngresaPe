import {
  Calculator,
  BookOpen,
  BookA,
  FlaskConical,
  Zap,
  Dna,
  Globe,
  LucideIcon,
} from 'lucide-react';

export interface CourseMeta {
  icon: LucideIcon;
  colorHex: string;
  bgTint: string;
  areaLabel: string;
}

const DEFAULT_META: CourseMeta = {
  icon: BookOpen,
  colorHex: '#58cc02',
  bgTint: '#f1fcdb',
  areaLabel: 'Curso',
};

const COURSE_META: Record<string, CourseMeta> = {
  'razonamiento-matematico': {
    icon: Calculator,
    colorHex: '#1cb0f6',
    bgTint: '#ddf4ff',
    areaLabel: 'Matemática',
  },
  algebra: {
    icon: Calculator,
    colorHex: '#1cb0f6',
    bgTint: '#ddf4ff',
    areaLabel: 'Matemática',
  },
  geometria: {
    icon: Calculator,
    colorHex: '#1cb0f6',
    bgTint: '#ddf4ff',
    areaLabel: 'Matemática',
  },
  'razonamiento-verbal': {
    icon: BookOpen,
    colorHex: '#ce82ff',
    bgTint: '#f8eaff',
    areaLabel: 'Letras',
  },
  literatura: {
    icon: BookA,
    colorHex: '#ff4b4b',
    bgTint: '#ffeaea',
    areaLabel: 'Letras',
  },
  'historia-peru': {
    icon: Globe,
    colorHex: '#ff9600',
    bgTint: '#fff2e0',
    areaLabel: 'Sociales',
  },
  quimica: {
    icon: FlaskConical,
    colorHex: '#58cc02',
    bgTint: '#f1fcdb',
    areaLabel: 'Ciencias',
  },
  fisica: {
    icon: Zap,
    colorHex: '#ffc800',
    bgTint: '#fffbea',
    areaLabel: 'Ciencias',
  },
  biologia: {
    icon: Dna,
    colorHex: '#58cc02',
    bgTint: '#f1fcdb',
    areaLabel: 'Ciencias',
  },
};

export function getCourseMeta(slug: string, name?: string): CourseMeta {
  const key = slug.toLowerCase();
  if (COURSE_META[key]) return COURSE_META[key];

  // Fallback por palabras clave del nombre
  const normalized = (name || slug).toLowerCase();
  if (normalized.includes('matemát') || normalized.includes('algebra') || normalized.includes('geomet')) {
    return COURSE_META['razonamiento-matematico'];
  }
  if (normalized.includes('verbal') || normalized.includes('literatura')) {
    return normalized.includes('literatura') ? COURSE_META['literatura'] : COURSE_META['razonamiento-verbal'];
  }
  if (normalized.includes('historia') || normalized.includes('peru')) {
    return COURSE_META['historia-peru'];
  }
  if (normalized.includes('química') || normalized.includes('quimica')) {
    return COURSE_META['quimica'];
  }
  if (normalized.includes('física') || normalized.includes('fisica')) {
    return COURSE_META['fisica'];
  }
  if (normalized.includes('biología') || normalized.includes('biologia')) {
    return COURSE_META['biologia'];
  }

  return DEFAULT_META;
}
