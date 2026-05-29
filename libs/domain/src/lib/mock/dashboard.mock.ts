import { BookOpen, Target, Smartphone, Layers } from 'lucide-react';
import type { TemaData, UserStats, Course } from '../types/index';

export const userStats: UserStats = { racha: 12, vidas: 5, gemas: 450, xp: 2850 };

export const mockCourses: Course[] = [
  { id: '1', title: 'Biología Celular', progress: 35 },
  { id: '2', title: 'Álgebra Lineal', progress: 12 },
  { id: '3', title: 'Historia del Perú', progress: 80 },
  { id: '4', title: 'Física Clásica', progress: 50 },
];

export const temarioMock: TemaData[] = [
  {
    id: 1,
    tema: 1,
    titulo: 'La Célula Eucariota',
    descripcion: 'Organelas y funciones básicas',
    variant: 'primary',
    actividades: [
      { id: 101, name: 'Teoría', state: 'completed', icon: BookOpen },
      { id: 102, name: 'Modo Swipe', state: 'completed', icon: Smartphone },
      { id: 103, name: 'Match', state: 'current', icon: Layers, color: 'warning' },
      { id: 104, name: 'Quiz Final', state: 'locked', icon: Target },
    ],
    resumenData: {
      introduccion: 'La célula eucariota es la unidad básica y funcional de organismos complejos. Se caracteriza por tener un núcleo definido protegido por una membrana nuclear que alberga el material genético.',
      imagenExplicativa: true,
      puntosClave: [
        { titulo: 'Núcleo Celular', texto: 'Almacena y protege el material genético (ADN).' },
        { titulo: 'Mitocondrias', texto: "La 'planta de energía'." },
      ],
      formulaDestacada: 'C₆H₁₂O₆ + 6O₂ ➔ 6CO₂ + 6H₂O + ATP',
      tipExamen: 'Diferencia clásica: Las vegetales tienen pared celular de celulosa.',
    },
  },
  {
    id: 2,
    tema: 2,
    titulo: 'Metabolismo Celular',
    descripcion: 'Respiración y Fotosíntesis',
    variant: 'primary',
    actividades: [
      { id: 201, name: 'Teoría', state: 'locked', icon: BookOpen },
      { id: 202, name: 'Modo Swipe', state: 'locked', icon: Smartphone },
      { id: 203, name: 'Match', state: 'locked', icon: Layers },
      { id: 204, name: 'Quiz Final', state: 'locked', icon: Target },
    ],
    resumenData: {
      introduccion: 'El metabolismo es el conjunto de reacciones químicas que ocurren en la célula para mantener la vida.',
      imagenExplicativa: false,
      puntosClave: [
        { titulo: 'Catabolismo', texto: 'Degrada moléculas complejas liberando energía.' },
        { titulo: 'Anabolismo', texto: 'Construye moléculas complejas consumiendo energía.' },
      ],
      formulaDestacada: 'ATP ➔ ADP + Pᵢ + Energía',
      tipExamen: "Recuerda: Anabolismo 'Arma', Catabolismo 'Corta'.",
    },
  },
  {
    id: 3,
    tema: 3,
    titulo: 'División Celular',
    descripcion: 'Mitosis y Meiosis',
    variant: 'primary',
    actividades: [
      { id: 301, name: 'Teoría', state: 'locked', icon: BookOpen },
      { id: 302, name: 'Modo Swipe', state: 'locked', icon: Smartphone },
      { id: 303, name: 'Match', state: 'locked', icon: Layers },
      { id: 304, name: 'Quiz Final', state: 'locked', icon: Target },
    ],
    resumenData: {
      introduccion: 'Proceso por el cual una célula madre se divide para formar nuevas células hijas.',
      imagenExplicativa: true,
      puntosClave: [
        { titulo: 'Mitosis', texto: 'Genera 2 células hijas diploides (idénticas).' },
        { titulo: 'Meiosis', texto: 'Genera 4 células hijas haploides (gametos).' },
      ],
      formulaDestacada: '2n ➔ 2n (Mitosis) / 2n ➔ n (Meiosis)',
      tipExamen: 'El crossing-over ocurre exclusivamente en la Profase I de la Meiosis.',
    },
  },
];
