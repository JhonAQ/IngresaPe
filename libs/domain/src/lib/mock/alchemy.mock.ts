import type { AlchemyFormula } from '../types/index';

/**
 * Mock formulas for the Alchemy minigame.
 * Each formula includes real academic content for UNSA entrance exam prep.
 * Blueprint defines the visual slots and static operators on the scroll.
 * correctIngredients = ONLY the variable fragments the user must drag
 * distractors = plausible but incorrect fragments
 */
export const ALCHEMY_FORMULAS: AlchemyFormula[] = [
  {
    id: 'newton-2',
    name: 'Segunda Ley de Newton',
    hint: 'La fuerza que mueve un objeto depende de...',
    formulaLatex: 'F = m \\cdot a',
    course: 'Física',
    blueprint: [
      { type: 'variable', id: 'n2-f', label: 'F' },
      { type: 'operator', label: '=' },
      { type: 'variable', id: 'n2-m', label: 'm' },
      { type: 'operator', label: '·' },
      { type: 'variable', id: 'n2-a', label: 'a' },
    ],
    correctIngredients: [
      { id: 'n2-f', label: 'F' },
      { id: 'n2-m', label: 'm' },
      { id: 'n2-a', label: 'a' },
    ],
    distractors: [
      { id: 'n2-d1', label: 'v' },
      { id: 'n2-d2', label: 't' },
      { id: 'n2-d3', label: 'g' },
    ],
  },
  {
    id: 'velocidad',
    name: 'Velocidad',
    hint: 'La rapidez con la que un objeto cambia de posición',
    formulaLatex: 'v = \\frac{d}{t}',
    course: 'Física',
    blueprint: [
      { type: 'variable', id: 'v-v', label: 'v' },
      { type: 'operator', label: '=' },
      { type: 'variable', id: 'v-d', label: 'd' },
      { type: 'operator', label: '/' },
      { type: 'variable', id: 'v-t', label: 't' },
    ],
    correctIngredients: [
      { id: 'v-v', label: 'v' },
      { id: 'v-d', label: 'd' },
      { id: 'v-t', label: 't' },
    ],
    distractors: [
      { id: 'v-d1', label: 'a' },
      { id: 'v-d2', label: 'F' },
      { id: 'v-d3', label: 'm' },
    ],
  },
  {
    id: 'ec-cinetica',
    name: 'Energía Cinética',
    hint: 'La energía que posee un cuerpo por estar en movimiento',
    formulaLatex: 'E_c = \\frac{1}{2} m v^2',
    course: 'Física',
    blueprint: [
      { type: 'variable', id: 'ec-e', label: 'Eₖ' },
      { type: 'operator', label: '=' },
      { type: 'variable', id: 'ec-half', label: '½' },
      { type: 'variable', id: 'ec-m', label: 'm' },
      { type: 'variable', id: 'ec-v2', label: 'v²' },
    ],
    correctIngredients: [
      { id: 'ec-e', label: 'Eₖ' },
      { id: 'ec-half', label: '½' },
      { id: 'ec-m', label: 'm' },
      { id: 'ec-v2', label: 'v²' },
    ],
    distractors: [
      { id: 'ec-d1', label: 'g' },
      { id: 'ec-d2', label: 'h' },
      { id: 'ec-d3', label: 'F' },
    ],
  },
  {
    id: 'gas-ideal',
    name: 'Ley de los Gases Ideales',
    hint: 'Relaciona presión, volumen, temperatura y moles de un gas',
    formulaLatex: 'PV = nRT',
    course: 'Química',
    blueprint: [
      { type: 'variable', id: 'gi-p', label: 'P' },
      { type: 'variable', id: 'gi-v', label: 'V' },
      { type: 'operator', label: '=' },
      { type: 'variable', id: 'gi-n', label: 'n' },
      { type: 'variable', id: 'gi-r', label: 'R' },
      { type: 'variable', id: 'gi-t', label: 'T' },
    ],
    correctIngredients: [
      { id: 'gi-p', label: 'P' },
      { id: 'gi-v', label: 'V' },
      { id: 'gi-n', label: 'n' },
      { id: 'gi-r', label: 'R' },
      { id: 'gi-t', label: 'T' },
    ],
    distractors: [
      { id: 'gi-d1', label: 'k' },
      { id: 'gi-d2', label: 'Q' },
    ],
  },
  {
    id: 'discriminante',
    name: 'Discriminante',
    hint: 'Determina la naturaleza de las raíces de una ecuación cuadrática',
    formulaLatex: '\\Delta = b^2 - 4ac',
    course: 'Matemáticas',
    blueprint: [
      { type: 'variable', id: 'disc-d', label: 'Δ' },
      { type: 'operator', label: '=' },
      { type: 'variable', id: 'disc-b2', label: 'b²' },
      { type: 'operator', label: '−' },
      { type: 'variable', id: 'disc-4', label: '4' },
      { type: 'variable', id: 'disc-ac', label: 'ac' },
    ],
    correctIngredients: [
      { id: 'disc-d', label: 'Δ' },
      { id: 'disc-b2', label: 'b²' },
      { id: 'disc-4', label: '4' },
      { id: 'disc-ac', label: 'ac' },
    ],
    distractors: [
      { id: 'disc-d1', label: 'x' },
      { id: 'disc-d2', label: '√' },
    ],
  },
  {
    id: 'pitagoras',
    name: 'Teorema de Pitágoras',
    hint: 'En un triángulo rectángulo, la hipotenusa y los catetos se relacionan así',
    formulaLatex: 'c^2 = a^2 + b^2',
    course: 'Matemáticas',
    blueprint: [
      { type: 'variable', id: 'pit-c2', label: 'c²' },
      { type: 'operator', label: '=' },
      { type: 'variable', id: 'pit-a2', label: 'a²' },
      { type: 'operator', label: '+' },
      { type: 'variable', id: 'pit-b2', label: 'b²' },
    ],
    correctIngredients: [
      { id: 'pit-c2', label: 'c²' },
      { id: 'pit-a2', label: 'a²' },
      { id: 'pit-b2', label: 'b²' },
    ],
    distractors: [
      { id: 'pit-d1', label: '−' },
      { id: 'pit-d2', label: 'π' },
      { id: 'pit-d3', label: 'r' },
    ],
  },
  {
    id: 'distancia-2p',
    name: 'Distancia entre dos puntos',
    hint: 'Calcula la distancia entre dos coordenadas en el plano cartesiano',
    formulaLatex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
    course: 'Matemáticas',
    blueprint: [
      { type: 'variable', id: 'd2p-d', label: 'd' },
      { type: 'operator', label: '=' },
      { type: 'operator', label: '√' },
      { type: 'variable', id: 'd2p-dx', label: '(x₂−x₁)²' },
      { type: 'operator', label: '+' },
      { type: 'variable', id: 'd2p-dy', label: '(y₂−y₁)²' },
    ],
    correctIngredients: [
      { id: 'd2p-d', label: 'd' },
      { id: 'd2p-dx', label: '(x₂−x₁)²' },
      { id: 'd2p-dy', label: '(y₂−y₁)²' },
    ],
    distractors: [
      { id: 'd2p-d1', label: 'π' },
      { id: 'd2p-d2', label: 'r²' },
    ],
  },
  {
    id: 'ph',
    name: 'pH de una solución',
    hint: 'Mide la acidez o alcalinidad de una solución acuosa',
    formulaLatex: 'pH = -\\log[H^+]',
    course: 'Química',
    blueprint: [
      { type: 'variable', id: 'ph-ph', label: 'pH' },
      { type: 'operator', label: '=' },
      { type: 'operator', label: '−' },
      { type: 'variable', id: 'ph-log', label: 'log' },
      { type: 'variable', id: 'ph-h', label: '[H⁺]' },
    ],
    correctIngredients: [
      { id: 'ph-ph', label: 'pH' },
      { id: 'ph-log', label: 'log' },
      { id: 'ph-h', label: '[H⁺]' },
    ],
    distractors: [
      { id: 'ph-d1', label: 'OH⁻' },
      { id: 'ph-d2', label: 'ln' },
      { id: 'ph-d3', label: 'mol' },
    ],
  },
];
