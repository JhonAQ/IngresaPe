/**
 * Helpers para calcular nivel y progreso de XP.
 * Deben mantenerse sincronizados con la fórmula del backend:
 *   level = Math.floor(Math.sqrt(totalXp) * 0.5) + 1
 */

export function getLevelFromXp(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp) * 0.5) + 1;
}

export function getXpForLevel(level: number): number {
  return Math.pow((level - 1) * 2, 2);
}

export function getLevelProgress(totalXp: number): {
  current: number;
  next: number;
  percent: number;
} {
  const level = getLevelFromXp(totalXp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const current = totalXp - currentLevelXp;
  const next = nextLevelXp - currentLevelXp;
  const percent = Math.min(100, Math.max(0, Math.round((current / next) * 100)));

  return { current, next, percent };
}
