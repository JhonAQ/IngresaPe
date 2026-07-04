import type { LucideIcon } from 'lucide-react';
import type { SummaryBlock } from './summary';

export type Card3DVariant = 'primary' | 'success' | 'surface';
export type MapNodeColor = 'primary' | 'success' | 'warning' | 'error';

export interface Actividad {
  id: number;
  name: string;
  state: 'completed' | 'current' | 'locked';
  icon: LucideIcon;
  color?: MapNodeColor;
  /** Tamaño del nodo en número de preguntas (usado por el engine). */
  nodeSize?: number;
}

export interface TemaData {
  id: number;
  tema: number;
  titulo: string;
  descripcion: string;
  variant: Card3DVariant;
  actividades: Actividad[];
  resumenData: SummaryBlock[];
  color?: string;
}
