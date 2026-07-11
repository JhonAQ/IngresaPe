export type InstallPromptStatus = 'idle' | 'dismissed' | 'accepted';

export interface InstallPromptState {
  status: InstallPromptStatus;
  attempts: number;
  dismissedAt?: number;
  neverShowAgain: boolean;
}

const INSTALL_PROMPT_KEY = 'ingresa_pwa_install_state';
const DEFAULT_STATE: InstallPromptState = {
  status: 'idle',
  attempts: 0,
  neverShowAgain: false,
};

function safeParse(value: string | null): InstallPromptState {
  if (!value) return { ...DEFAULT_STATE };
  try {
    const parsed = JSON.parse(value) as Partial<InstallPromptState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function getInstallPromptState(): InstallPromptState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  return safeParse(window.localStorage.getItem(INSTALL_PROMPT_KEY));
}

function setInstallPromptState(state: InstallPromptState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INSTALL_PROMPT_KEY, JSON.stringify(state));
}

export function recordInstallPromptDismissed(neverShowAgain = false): InstallPromptState {
  const current = getInstallPromptState();
  const next: InstallPromptState = {
    status: 'dismissed',
    attempts: current.attempts + 1,
    dismissedAt: Date.now(),
    neverShowAgain: neverShowAgain || current.neverShowAgain,
  };
  setInstallPromptState(next);
  return next;
}

export function recordInstallPromptAccepted(): InstallPromptState {
  const next: InstallPromptState = {
    status: 'accepted',
    attempts: getInstallPromptState().attempts,
    neverShowAgain: true,
  };
  setInstallPromptState(next);
  return next;
}

export function shouldShowInstallPromptModal(
  state: InstallPromptState,
  cooldownMs = 7 * 24 * 60 * 60 * 1000,
  maxAttempts = 3
): boolean {
  if (state.status === 'accepted' || state.neverShowAgain) return false;
  if (state.attempts >= maxAttempts) return false;
  if (state.status === 'dismissed' && state.dismissedAt) {
    return Date.now() - state.dismissedAt > cooldownMs;
  }
  return true;
}

export function shouldShowInstallPromptBanner(
  state: InstallPromptState,
  cooldownMs = 7 * 24 * 60 * 60 * 1000
): boolean {
  if (state.status === 'accepted' || state.neverShowAgain) return false;
  if (state.status === 'dismissed' && state.dismissedAt) {
    return Date.now() - state.dismissedAt <= cooldownMs;
  }
  return true;
}
