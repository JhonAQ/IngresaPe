import { z } from 'zod';

// =========================================================
// Esquemas Zod para cada bloque de resumen
// =========================================================

const HeadingBlockSchema = z.object({
  type: z.literal('HEADING'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: z.string().min(1),
});

const ParagraphBlockSchema = z.object({
  type: z.literal('PARAGRAPH'),
  text: z.string().min(1),
});

const FormulaBlockSchema = z.object({
  type: z.literal('FORMULA'),
  latex: z.string().min(1),
  label: z.string().optional(),
});

const KeyPointItemSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

const KeyPointsBlockSchema = z.object({
  type: z.literal('KEY_POINTS'),
  items: z.array(KeyPointItemSchema).min(1),
});

const TipBlockSchema = z.object({
  type: z.literal('TIP'),
  title: z.string().optional(),
  text: z.string().min(1),
  variant: z.union([z.literal('exam'), z.literal('memory'), z.literal('warning')]).optional(),
});

const ImageBlockSchema = z.object({
  type: z.literal('IMAGE'),
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

const CalloutBlockSchema = z.object({
  type: z.literal('CALLOUT'),
  title: z.string().optional(),
  text: z.string().min(1),
  tone: z.union([z.literal('info'), z.literal('success'), z.literal('warning'), z.literal('danger')]).optional(),
});

export const SummaryBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  FormulaBlockSchema,
  KeyPointsBlockSchema,
  TipBlockSchema,
  ImageBlockSchema,
  CalloutBlockSchema,
]);

export const SummaryBlocksSchema = z.array(SummaryBlockSchema);

// =========================================================
// Tipos TypeScript inferidos
// =========================================================

export type HeadingBlock = z.infer<typeof HeadingBlockSchema>;
export type ParagraphBlock = z.infer<typeof ParagraphBlockSchema>;
export type FormulaBlock = z.infer<typeof FormulaBlockSchema>;
export type KeyPointItem = z.infer<typeof KeyPointItemSchema>;
export type KeyPointsBlock = z.infer<typeof KeyPointsBlockSchema>;
export type TipBlock = z.infer<typeof TipBlockSchema>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export type CalloutBlock = z.infer<typeof CalloutBlockSchema>;

export type SummaryBlock =
  | HeadingBlock
  | ParagraphBlock
  | FormulaBlock
  | KeyPointsBlock
  | TipBlock
  | ImageBlock
  | CalloutBlock;

// =========================================================
// Helpers de migración y validación
// =========================================================

/**
 * Valida que un valor arbitrario sea un array de bloques de resumen.
 */
export function parseSummaryBlocks(input: unknown): SummaryBlock[] {
  const parsed = SummaryBlocksSchema.safeParse(input);
  return parsed.success ? parsed.data : [];
}

/**
 * Convierte el formato legacy de resumen (estructura fija antigua)
 * al nuevo formato de bloques. Si el input ya es un array de bloques
 * válido, lo devuelve tal cual.
 */
export function migrateLegacySummary(input: unknown): SummaryBlock[] {
  if (input === null || input === undefined) return [];

  // Si ya es el nuevo formato, lo validamos y devolvemos.
  const parsed = SummaryBlocksSchema.safeParse(input);
  if (parsed.success) return parsed.data;

  // Si es un array pero no valida, no intentamos migrar posibles bloques rotos.
  if (Array.isArray(input)) return [];

  // Formato legacy: objeto plano con campos fijos.
  if (typeof input !== 'object' || input === null) return [];

  const legacy = input as Record<string, unknown>;
  const blocks: SummaryBlock[] = [];

  if (typeof legacy.introduccion === 'string' && legacy.introduccion.trim()) {
    blocks.push({ type: 'PARAGRAPH', text: legacy.introduccion });
  }

  if (typeof legacy.imagenUrl === 'string' && legacy.imagenUrl.trim()) {
    blocks.push({
      type: 'IMAGE',
      src: legacy.imagenUrl,
      alt: 'Ilustración del tema',
    });
  }

  if (Array.isArray(legacy.puntosClave) && legacy.puntosClave.length > 0) {
    const items = legacy.puntosClave
      .filter((p): p is { title?: string; texto?: string } => typeof p === 'object' && p !== null)
      .map((p) => ({
        title: typeof p.title === 'string' && p.title.trim() ? p.title : 'Concepto clave',
        text: typeof p.texto === 'string' && p.texto.trim() ? p.texto : '',
      }))
      .filter((p) => p.text);

    if (items.length > 0) {
      blocks.push({ type: 'KEY_POINTS', items });
    }
  }

  if (typeof legacy.formulaDestacada === 'string' && legacy.formulaDestacada.trim()) {
    blocks.push({
      type: 'FORMULA',
      latex: legacy.formulaDestacada,
      label: 'Fórmula clave',
    });
  }

  if (typeof legacy.tipExamen === 'string' && legacy.tipExamen.trim()) {
    blocks.push({
      type: 'TIP',
      title: 'Tip de examen',
      text: legacy.tipExamen,
      variant: 'exam',
    });
  }

  return blocks;
}
