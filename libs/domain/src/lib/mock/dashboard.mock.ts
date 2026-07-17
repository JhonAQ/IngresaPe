import { BookOpen, Target, Smartphone, Layers } from 'lucide-react';
import type { TemaData, UserStats, Course } from '../types/index';

export const userStats: UserStats = { racha: 12, vidas: 5, gemas: 450 };

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
    resumenData: [
      { type: 'HEADING', level: 1, text: 'La Célula Eucariota' },
      {
        type: 'PARAGRAPH',
        text: 'La célula eucariota es la unidad básica y funcional de organismos complejos. Se caracteriza por tener un núcleo definido protegido por una membrana nuclear que alberga el material genético.',
      },
      { type: 'IMAGE', src: 'https://placehold.co/600x300?text=Célula+Eucariota', alt: 'Célula eucariota', caption: 'Estructura general de una célula animal.' },
      {
        type: 'KEY_POINTS',
        items: [
          { title: 'Núcleo Celular', text: 'Almacena y protege el material genético (ADN).' },
          { title: 'Mitocondrias', text: "La 'planta de energía'." },
        ],
      },
      { type: 'FORMULA', latex: 'C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + ATP', label: 'Respiración celular' },
      { type: 'TIP', title: 'Tip de examen', text: 'Diferencia clásica: Las vegetales tienen pared celular de celulosa.', variant: 'exam' },
    ],
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
    resumenData: [
      { type: 'HEADING', level: 1, text: 'Metabolismo Celular' },
      {
        type: 'PARAGRAPH',
        text: 'El metabolismo es el conjunto de reacciones químicas que ocurren en la célula para mantener la vida.',
      },
      {
        type: 'KEY_POINTS',
        items: [
          { title: 'Catabolismo', text: 'Degrada moléculas complejas liberando energía.' },
          { title: 'Anabolismo', text: 'Construye moléculas complejas consumiendo energía.' },
        ],
      },
      { type: 'FORMULA', latex: 'ATP \\rightarrow ADP + P_i + \\text{Energía}', label: 'Hidrólisis del ATP' },
      { type: 'TIP', title: 'Memotécnica', text: "Recuerda: Anabolismo 'Arma', Catabolismo 'Corta'.", variant: 'memory' },
    ],
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
    resumenData: [
      { type: 'HEADING', level: 1, text: 'División Celular' },
      {
        type: 'PARAGRAPH',
        text: 'Proceso por el cual una célula madre se divide para formar nuevas células hijas.',
      },
      { type: 'IMAGE', src: 'https://placehold.co/600x300?text=División+Celular', alt: 'División celular', caption: 'Mitosis y meiosis en comparación.' },
      {
        type: 'KEY_POINTS',
        items: [
          { title: 'Mitosis', text: 'Genera 2 células hijas diploides (idénticas).' },
          { title: 'Meiosis', text: 'Genera 4 células hijas haploides (gametos).' },
        ],
      },
      { type: 'FORMULA', latex: '2n \\rightarrow 2n \\text{ (Mitosis)} \\quad ; \\quad 2n \\rightarrow n \\text{ (Meiosis)}', label: 'Cambio de número cromosómico' },
      { type: 'TIP', title: 'Tip de examen', text: 'El crossing-over ocurre exclusivamente en la Profase I de la Meiosis.', variant: 'exam' },
    ],
  },
];
