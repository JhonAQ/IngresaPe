import type { LucideIcon } from 'lucide-react';

export type Card3DVariant = 'primary' | 'success' | 'surface' | 'error' | 'warning';
export type MapNodeColor = 'primary' | 'success' | 'warning' | 'error' | 'surface';

export interface Actividad {
  id: number;
  name: string;
  state: 'completed' | 'current' | 'locked';
  icon: LucideIcon;
  color?: MapNodeColor;
}

export interface DetalleResumen {
  titulo: string;
  texto: string;
}

export interface ResumenData {
  introduccion: string;
  imagenExplicativa: boolean;
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
  resumenData: ResumenData;
  color?: string;
}
