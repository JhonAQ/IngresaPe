export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const displayMode = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone =
    'standalone' in window.navigator &&
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  return displayMode || iosStandalone;
}

export function isIOSSafari(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|opios|mercury|edge/.test(ua);

  return isIOS && isSafari;
}

export function isInstallPromptSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'BeforeInstallPromptEvent' in window;
}
