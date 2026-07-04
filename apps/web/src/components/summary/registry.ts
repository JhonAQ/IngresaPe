import type { ComponentType } from 'react';
import type { SummaryBlock } from '@ingresa-pe/domain';
import { HeadingRenderer } from './blocks/HeadingRenderer';
import { ParagraphRenderer } from './blocks/ParagraphRenderer';
import { FormulaRenderer } from './blocks/FormulaRenderer';
import { KeyPointsRenderer } from './blocks/KeyPointsRenderer';
import { TipRenderer } from './blocks/TipRenderer';
import { ImageRenderer } from './blocks/ImageRenderer';
import { CalloutRenderer } from './blocks/CalloutRenderer';
import { ResourcesRenderer } from './blocks/ResourcesRenderer';
import { TableRenderer } from './blocks/TableRenderer';
import { StepsRenderer } from './blocks/StepsRenderer';
import { DefinitionRenderer } from './blocks/DefinitionRenderer';
import { ExampleRenderer } from './blocks/ExampleRenderer';
import { QuoteRenderer } from './blocks/QuoteRenderer';

export interface SummaryRendererProps<TBlock extends SummaryBlock = SummaryBlock> {
  block: TBlock;
  accentColor?: string;
}

type RendererMap = {
  HEADING: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'HEADING' }>>>;
  PARAGRAPH: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'PARAGRAPH' }>>>;
  FORMULA: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'FORMULA' }>>>;
  KEY_POINTS: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'KEY_POINTS' }>>>;
  TIP: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'TIP' }>>>;
  IMAGE: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'IMAGE' }>>>;
  CALLOUT: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'CALLOUT' }>>>;
  RESOURCES: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'RESOURCES' }>>>;
  TABLE: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'TABLE' }>>>;
  STEPS: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'STEPS' }>>>;
  DEFINITION: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'DEFINITION' }>>>;
  EXAMPLE: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'EXAMPLE' }>>>;
  QUOTE: ComponentType<SummaryRendererProps<Extract<SummaryBlock, { type: 'QUOTE' }>>>;
};

export const summaryRendererRegistry: RendererMap = {
  HEADING: HeadingRenderer,
  PARAGRAPH: ParagraphRenderer,
  FORMULA: FormulaRenderer,
  KEY_POINTS: KeyPointsRenderer,
  TIP: TipRenderer,
  IMAGE: ImageRenderer,
  CALLOUT: CalloutRenderer,
  RESOURCES: ResourcesRenderer,
  TABLE: TableRenderer,
  STEPS: StepsRenderer,
  DEFINITION: DefinitionRenderer,
  EXAMPLE: ExampleRenderer,
  QUOTE: QuoteRenderer,
};

export function getSummaryRenderer(type: SummaryBlock['type']) {
  const renderer = summaryRendererRegistry[type];
  if (!renderer) {
    throw new Error(`No hay renderer registrado para el bloque de resumen: ${type}`);
  }
  return renderer;
}
