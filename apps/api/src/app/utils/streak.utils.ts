/**
 * Calcula la nueva racha de un usuario basándose en su racha actual y la
 * fecha de su última interacción.
 *
 * Reglas:
 * - Si la racha actual es 0, se inicia en 1 (primera actividad).
 * - Si la última interacción fue hoy, se mantiene la racha.
 * - Si fue ayer, se incrementa en 1.
 * - Si fue antes de ayer (o no hay fecha), se reinicia a 1.
 */
export function calculateNewStreak(
  currentStreak: number,
  lastDate: Date | null
): { newStreak: number; shouldUpdateDate: boolean } {
  const now = new Date();

  if (currentStreak === 0) {
    return { newStreak: 1, shouldUpdateDate: true };
  }

  if (!lastDate) {
    return { newStreak: 1, shouldUpdateDate: true };
  }

  const last = new Date(lastDate);
  const isToday = now.toDateString() === last.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === last.toDateString();

  if (isToday) {
    return { newStreak: currentStreak, shouldUpdateDate: true };
  }

  if (isYesterday) {
    return { newStreak: currentStreak + 1, shouldUpdateDate: true };
  }

  return { newStreak: 1, shouldUpdateDate: true };
}
