export type MinigameId = 'survival' | 'speed' | 'streak' | 'alchemy';

export interface MinigameData {
  id: MinigameId;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  shadow: string;
  cost: number;
}

// ============================================================================
// Alchemy Minigame Types
// ============================================================================

export interface AlchemyIngredient {
  id: string;
  label: string; // Display text (may contain LaTeX like "m", "a", "F")
}

export type AlchemyBlueprintElement =
  | { type: 'operator'; label: string }
  | { type: 'variable'; id: string; label: string };

export interface AlchemyFormula {
  id: string;
  name: string; // e.g. "Segunda Ley de Newton"
  hint: string; // e.g. "¿Qué fuerza mueve un objeto?"
  formulaLatex: string; // e.g. "F = m \\cdot a" (for the final reveal)
  course: string; // e.g. "Física", "Química"
  blueprint: AlchemyBlueprintElement[]; // defines the visual slots and static operators
  correctIngredients: AlchemyIngredient[];
  distractors: AlchemyIngredient[];
}

export interface AlchemyRound {
  formula: AlchemyFormula;
  allIngredients: AlchemyIngredient[]; // shuffled mix of correct + distractors
  selectedIds: string[];
  status: 'pending' | 'success' | 'failed';
}
