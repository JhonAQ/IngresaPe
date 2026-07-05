export const ACADEMIC_AXIS_DEFINITIONS = [
  { id: 'raz-mat', label: 'Raz. Matemático' },
  { id: 'raz-ver', label: 'Raz. Verbal' },
  { id: 'matematica', label: 'Matemática' },
  { id: 'sociales', label: 'Ciencias Sociales' },
  { id: 'ciencia-tech', label: 'Ciencia y Tecnología' },
  { id: 'dpcc', label: 'DPCC' },
  { id: 'comunicacion', label: 'Comunicación' },
  { id: 'ingles', label: 'Inglés' },
] as const;

export type AcademicAxisId = typeof ACADEMIC_AXIS_DEFINITIONS[number]['id'];

export const COURSE_SLUG_TO_AXIS: Record<string, AcademicAxisId> = {
  // Razonamiento Matemático
  'razonamiento-matematico': 'raz-mat',
  'razonamiento-logico': 'raz-mat',

  // Razonamiento Verbal
  'razonamiento-verbal': 'raz-ver',
  'comprension-lectora': 'raz-ver',

  // Matemática
  aritmetica: 'matematica',
  algebra: 'matematica',
  geometria: 'matematica',
  trigonometria: 'matematica',

  // Ciencias Sociales
  historia: 'sociales',
  geografia: 'sociales',
  'historia-peru': 'sociales',
  'historia-universal': 'sociales',

  // Ciencia y Tecnología
  quimica: 'ciencia-tech',
  biologia: 'ciencia-tech',
  fisica: 'ciencia-tech',

  // DPCC
  psicologia: 'dpcc',
  filosofia: 'dpcc',
  'educacion-civica': 'dpcc',

  // Comunicación
  lenguaje: 'comunicacion',
  literatura: 'comunicacion',

  // Inglés
  ingles: 'ingles',
};

export function getAxisIdByCourseSlug(slug: string): AcademicAxisId | null {
  return COURSE_SLUG_TO_AXIS[slug] ?? null;
}
