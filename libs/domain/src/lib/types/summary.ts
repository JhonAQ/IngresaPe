import { z } from 'zod/v3';

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

const ResourceItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  description: z.string().optional(),
});

const ResourcesBlockSchema = z.object({
  type: z.literal('RESOURCES'),
  title: z.string().optional(),
  items: z.array(ResourceItemSchema).min(1),
});

const TableBlockSchema = z.object({
  type: z.literal('TABLE'),
  title: z.string().optional(),
  headers: z.array(z.string().min(1)).min(1),
  rows: z.array(z.array(z.string())).min(1),
});

const StepItemSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

const StepsBlockSchema = z.object({
  type: z.literal('STEPS'),
  items: z.array(StepItemSchema).min(1),
});

const DefinitionBlockSchema = z.object({
  type: z.literal('DEFINITION'),
  term: z.string().min(1),
  definition: z.string().min(1),
});

const ExampleBlockSchema = z.object({
  type: z.literal('EXAMPLE'),
  title: z.string().optional(),
  problem: z.string().min(1),
  solution: z.string().min(1),
});

const QuoteBlockSchema = z.object({
  type: z.literal('QUOTE'),
  text: z.string().min(1),
  author: z.string().optional(),
});

export const SummaryBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  FormulaBlockSchema,
  KeyPointsBlockSchema,
  TipBlockSchema,
  ImageBlockSchema,
  CalloutBlockSchema,
  ResourcesBlockSchema,
  TableBlockSchema,
  StepsBlockSchema,
  DefinitionBlockSchema,
  ExampleBlockSchema,
  QuoteBlockSchema,
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
export type ResourceItem = z.infer<typeof ResourceItemSchema>;
export type ResourcesBlock = z.infer<typeof ResourcesBlockSchema>;
export type TableBlock = z.infer<typeof TableBlockSchema>;
export type StepItem = z.infer<typeof StepItemSchema>;
export type StepsBlock = z.infer<typeof StepsBlockSchema>;
export type DefinitionBlock = z.infer<typeof DefinitionBlockSchema>;
export type ExampleBlock = z.infer<typeof ExampleBlockSchema>;
export type QuoteBlock = z.infer<typeof QuoteBlockSchema>;

export type SummaryBlock =
  | HeadingBlock
  | ParagraphBlock
  | FormulaBlock
  | KeyPointsBlock
  | TipBlock
  | ImageBlock
  | CalloutBlock
  | ResourcesBlock
  | TableBlock
  | StepsBlock
  | DefinitionBlock
  | ExampleBlock
  | QuoteBlock;

// =========================================================
// Helpers de validación
// =========================================================

/**
 * Valida que un valor arbitrario sea un array de bloques de resumen.
 */
export function parseSummaryBlocks(input: unknown): SummaryBlock[] {
  const parsed = SummaryBlocksSchema.safeParse(input);
  return parsed.success ? parsed.data : [];
}
