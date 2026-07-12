'use client';

import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useInstallPrompt } from './InstallPromptContext';
import { recordVisit, shouldShowWelcomeBack } from '../../lib/activityStorage';

const INACTIVITY_MINUTES = 10;
const WELCOME_BACK_COOLDOWN_HOURS = 24;

export function ActivityTracker() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isStandalone, openWelcomeBack } = useInstallPrompt();

  useEffect(() => {
    if (isLoading) return;

    const shouldShow =
      isAuthenticated &&
      !isStandalone &&
      shouldShowWelcomeBack(INACTIVITY_MINUTES, WELCOME_BACK_COOLDOWN_HOURS);

    if (shouldShow) {
      openWelcomeBack();
    }

    recordVisit();
  }, [isAuthenticated, isLoading, isStandalone, openWelcomeBack]);

  return null;
}
