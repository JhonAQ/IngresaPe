import { SummaryBlock } from "@ingresa-pe/domain";
import { LucideIcon } from "lucide-react";
import type { Card3DVariant, MapNodeColor } from "@ingresa-pe/ui";

export interface Actividad {
  id: number;
  name: string;
  state: "completed" | "current" | "locked";
  icon: LucideIcon;
  color?: MapNodeColor;
}

export interface UserStats {
  racha: number;
  vidas: number;
  gemas: number;
}

export interface TemaData {
  id: number;
  tema: number;
  titulo: string;
  descripcion: string;
  variant: Card3DVariant;
  actividades: Actividad[];
  resumenData: SummaryBlock[];
}
