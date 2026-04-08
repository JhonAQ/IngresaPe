import { LucideIcon } from 'lucide-react';

export interface Actividad {
  id: number;
  name: string;
  state: "completed" | "current" | "locked";
  icon: LucideIcon;
  color?: string;
  border?: string;
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

export interface UserStats {
  racha: number;
  vidas: number;
  gemas: number;
  xp: number;
}

export interface TemaData {
  id: number;
  tema: number;
  titulo: string;
  descripcion: string;
  color: string;
  shadow: string;
  actividades: Actividad[];
  resumenData: ResumenData;
}