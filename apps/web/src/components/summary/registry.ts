import type { ComponentType } from 'react';
import type { SummaryBlock } from '@ingresa-pe/domain';
import { HeadingRenderer } from './blocks/HeadingRenderer';
import { ParagraphRenderer } from './blocks/ParagraphRenderer';
import { FormulaRenderer } from './blocks/FormulaRenderer';
import { KeyPointsRenderer } from './blocks/KeyPointsRenderer';
import { TipRenderer } from './blocks/TipRenderer';
import { ImageRenderer } from './blocks/ImageRenderer';
import { CalloutRenderer } from './blocks/CalloutRenderer';

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
};

export const summaryRendererRegistry: RendererMap = {
  HEADING: HeadingRenderer,
  PARAGRAPH: ParagraphRenderer,
  FORMULA: FormulaRenderer,
  KEY_POINTS: KeyPointsRenderer,
  TIP: TipRenderer,
  IMAGE: ImageRenderer,
  CALLOUT: CalloutRenderer,
};

export function getSummaryRenderer(type: SummaryBlock['type']) {
  const renderer = summaryRendererRegistry[type];
  if (!renderer) {
    throw new Error(`No hay renderer registrado para el bloque de resumen: ${type}`);
  }
  return renderer;
}
