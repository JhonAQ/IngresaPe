'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { isStandalone, isIOSSafari } from '../../lib/pwa';
import {
  getInstallPromptState,
  recordInstallPromptAccepted,
  recordInstallPromptDismissed,
  shouldShowInstallPromptModal,
  shouldShowInstallPromptBanner,
  type InstallPromptState,
} from '../../lib/pwaStorage';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface InstallPromptContextValue {
  isStandalone: boolean;
  isIOS: boolean;
  isInstallable: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  state: InstallPromptState;
  showIOSInstructions: boolean;
  openIOSInstructions: () => void;
  closeIOSInstructions: () => void;
  promptInstall: () => Promise<void>;
  dismiss: (options?: { neverShowAgain?: boolean }) => void;
  accept: () => void;
  canShowModal: boolean;
  canShowBanner: boolean;
}

const InstallPromptContext = createContext<InstallPromptContextValue | null>(null);

const MODAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_MODAL_ATTEMPTS = 3;

export function InstallPromptProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [state, setState] = useState<InstallPromptState>(getInstallPromptState());
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIOSSafari());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setStandalone(true);
      accept();
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (ios) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setState(recordInstallPromptAccepted());
    } else {
      setState(recordInstallPromptDismissed());
    }

    setDeferredPrompt(null);
  }, [deferredPrompt, ios]);

  const dismiss = useCallback(
    (options?: { neverShowAgain?: boolean }) => {
      setState(recordInstallPromptDismissed(options?.neverShowAgain));
    },
    []
  );

  const accept = useCallback(() => {
    setState(recordInstallPromptAccepted());
  }, []);

  const openIOSInstructions = useCallback(() => setShowIOSInstructions(true), []);
  const closeIOSInstructions = useCallback(() => setShowIOSInstructions(false), []);

  const isInstallable = useMemo(() => {
    if (standalone) return false;
    return !!deferredPrompt || ios;
  }, [deferredPrompt, ios, standalone]);

  const canShowModal = useMemo(
    () => isInstallable && shouldShowInstallPromptModal(state, MODAL_COOLDOWN_MS, MAX_MODAL_ATTEMPTS),
    [isInstallable, state]
  );

  const canShowBanner = useMemo(
    () => isInstallable && shouldShowInstallPromptBanner(state, MODAL_COOLDOWN_MS),
    [isInstallable, state]
  );

  const value = useMemo(
    () => ({
      isStandalone: standalone,
      isIOS: ios,
      isInstallable,
      deferredPrompt,
      state,
      showIOSInstructions,
      openIOSInstructions,
      closeIOSInstructions,
      promptInstall,
      dismiss,
      accept,
      canShowModal,
      canShowBanner,
    }),
    [
      standalone,
      ios,
      isInstallable,
      deferredPrompt,
      state,
      showIOSInstructions,
      openIOSInstructions,
      closeIOSInstructions,
      promptInstall,
      dismiss,
      accept,
      canShowModal,
      canShowBanner,
    ]
  );

  return <InstallPromptContext.Provider value={value}>{children}</InstallPromptContext.Provider>;
}

export function useInstallPrompt(): InstallPromptContextValue {
  const context = useContext(InstallPromptContext);
  if (!context) {
    throw new Error('useInstallPrompt must be used within InstallPromptProvider');
  }
  return context;
}
