const LAST_VISIT_KEY = 'ingresa_last_visit_at';
const WELCOME_BACK_SHOWN_AT_KEY = 'ingresa_welcome_back_shown_at';

export function getLastVisitAt(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(LAST_VISIT_KEY);
  return raw ? Number(raw) : null;
}

export function recordVisit(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
}

export function hasBeenInactiveFor(minutes: number): boolean {
  const last = getLastVisitAt();
  if (!last) return true;
  return Date.now() - last > minutes * 60 * 1000;
}

export function getWelcomeBackShownAt(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(WELCOME_BACK_SHOWN_AT_KEY);
  return raw ? Number(raw) : null;
}

export function recordWelcomeBackShown(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WELCOME_BACK_SHOWN_AT_KEY, String(Date.now()));
}

export function shouldShowWelcomeBack(
  inactiveMinutes: number,
  cooldownHours: number
): boolean {
  if (!hasBeenInactiveFor(inactiveMinutes)) return false;
  const shownAt = getWelcomeBackShownAt();
  if (!shownAt) return true;
  return Date.now() - shownAt > cooldownHours * 60 * 60 * 1000;
}

export function clearActivityTracking(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LAST_VISIT_KEY);
  window.localStorage.removeItem(WELCOME_BACK_SHOWN_AT_KEY);
}
