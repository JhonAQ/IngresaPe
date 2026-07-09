import type { MinigameData } from '../types/index';

export const MINIGAMES: MinigameData[] = [
  {
    id: 'survival',
    title: 'Supervivencia',
    subtitle: 'RETO INFINITO',
    description: 'Responde hasta equivocarte. Un solo fallo y mueres.',
    color: '#ff4b4b',
    shadow: '#df2b2b',
    cost: 1,
  },
  {
    id: 'speed',
    title: 'Contrarreloj',
    subtitle: 'MODO FLASH',
    description: 'Vence al reloj. Resuelve lo que más puedas en 60s.',
    color: '#1cb0f6',
    shadow: '#1899d6',
    cost: 1,
  },
  {
    id: 'streak',
    title: 'Racha Perfecta',
    subtitle: 'PRECISIÓN',
    description: 'Acierta 10 preguntas seguidas para ganar.',
    color: '#ff9600',
    shadow: '#cc7800',
    cost: 2,
  },
  {
    id: 'alchemy',
    title: 'El Alquimista',
    subtitle: 'FÓRMULAS',
    description: 'Mezcla ingredientes en tu caldero para descubrir fórmulas.',
    color: '#58cc02',
    shadow: '#458a02',
    cost: 1,
  },
];
