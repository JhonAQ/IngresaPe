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
}

/**
 * @deprecated El formato fijo de resumen fue reemplazado por bloques
 * (`SummaryBlock[]`). Solo se mantiene para compatibilidad con migraciones.
 */
export interface DetalleResumen {
  titulo: string;
  texto: string;
}

/**
 * @deprecated Usar `SummaryBlock[]` en su lugar. Ver `libs/domain/src/lib/types/summary.ts`.
 */
export interface ResumenData {
  introduccion: string;
  imagenUrl?: string;
  puntosClave: DetalleResumen[];
  formulaDestacada: string;
  tipExamen: string;
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
