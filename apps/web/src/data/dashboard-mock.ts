import { BookOpen, Target, Smartphone, Layers } from "lucide-react";
import { TemaData, UserStats } from "../types/dashboard";

export const userStats: UserStats = { racha: 12, vidas: 5, gemas: 450, xp: 2850 };

export const temarioMock: TemaData[] = [
  {
    id: 1,
    tema: 1,
    titulo: "La Célula Eucariota",
    descripcion: "Organelas y funciones básicas",
    color: "bg-[#22C55E]", 
    shadow: "border-[#16A34A]",
    actividades: [
      { id: 101, name: "Teoría", state: "completed", icon: BookOpen },
      { id: 102, name: "Modo Swipe", state: "completed", icon: Smartphone },
      { id: 103, name: "Match", state: "current", icon: Layers, color: "bg-[#F97316]" },
      { id: 104, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: {
      introduccion: "La célula eucariota es la unidad básica y funcional de organismos complejos. Se caracteriza por tener un núcleo definido protegido por una membrana nuclear que alberga el material genético.",
      imagenExplicativa: true,
      puntosClave: [
        { titulo: "Núcleo Celular", texto: "Almacena y protege el material genético (ADN). Es el centro de control de la célula." },
        { titulo: "Mitocondrias", texto: "La 'planta de energía'. Realizan la respiración celular para producir ATP (energía)." },
        { titulo: "Ribosomas", texto: "Encargados de la síntesis de proteínas según las instrucciones del ARN." },
        { titulo: "Aparato de Golgi", texto: "Procesa y empaqueta proteínas y lípidos para su exportación." }
      ],
      formulaDestacada: "C₆H₁₂O₆ + 6O₂ ➔ 6CO₂ + 6H₂O + ATP",
      tipExamen: "Diferencia clásica: Las células vegetales tienen pared celular de celulosa y cloroplastos, las animales NO."
    }
  },
  {
    id: 2,
    tema: 2,
    titulo: "Metabolismo Celular",
    descripcion: "Respiración y Fotosíntesis",
    color: "bg-[#3B82F6]", 
    shadow: "border-[#2563EB]",
    actividades: [
      { id: 201, name: "Teoría", state: "locked", icon: BookOpen },
      { id: 202, name: "Modo Swipe", state: "locked", icon: Smartphone },
      { id: 203, name: "Match", state: "locked", icon: Layers },
      { id: 204, name: "Quiz Final", state: "locked", icon: Target },
    ],
    resumenData: {
      introduccion: "El metabolismo es el conjunto de reacciones químicas que ocurren en la célula para mantener la vida, divididas en catabolismo y anabolismo.",
      imagenExplicativa: false,
      puntosClave: [
        { titulo: "Catabolismo", texto: "Degrada moléculas complejas en simples, liberando energía en el proceso (ej. Respiración)." },
        { titulo: "Anabolismo", texto: "Construye moléculas complejas a partir de simples, consumiendo energía (ej. Fotosíntesis)." }
      ],
      formulaDestacada: "ATP ➔ ADP + Pᵢ + Energía",
      tipExamen: "Recuerda: Anabolismo 'Arma' (requiere energía), Catabolismo 'Corta' (libera energía)."
    }
  }
];