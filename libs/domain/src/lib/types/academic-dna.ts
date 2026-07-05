import { z } from 'zod';

export const academicDnaCourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  total: z.number(),
  correct: z.number(),
  accuracy: z.number(),
});

export const academicDnaAxisSchema = z.object({
  id: z.string(),
  label: z.string(),
  total: z.number(),
  correct: z.number(),
  accuracy: z.number(),
  hasData: z.boolean(),
  courses: z.array(academicDnaCourseSchema),
});

export const academicDnaSchema = z.object({
  axes: z.array(academicDnaAxisSchema),
  strongAxisId: z.string().nullable(),
  weakAxisId: z.string().nullable(),
  totalAnswers: z.number(),
});

export type AcademicDnaCourseDto = z.infer<typeof academicDnaCourseSchema>;
export type AcademicDnaAxisDto = z.infer<typeof academicDnaAxisSchema>;
export type AcademicDnaDto = z.infer<typeof academicDnaSchema>;

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
export type AcademicAxisDefinition = typeof ACADEMIC_AXIS_DEFINITIONS[number];
