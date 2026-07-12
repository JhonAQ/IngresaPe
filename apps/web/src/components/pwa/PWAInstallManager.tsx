'use client';

import React from 'react';
import { ActivityTracker } from './ActivityTracker';
import { WelcomeBackModal } from './WelcomeBackModal';
import { IOSInstallSheet } from './IOSInstallSheet';

/**
 * Orquestador global de prompts de instalación PWA.
 *
 * - ActivityTracker registra visitas y dispara WelcomeBackModal si el usuario
 *   vuelve después de más de 10 minutos de inactividad.
 * - WelcomeBackModal se muestra una vez por día como máximo.
 * - IOSInstallSheet se abre desde el contexto cuando el usuario toca instalar
 *   en Safari/iOS.
 * - InstallPromptModal se renderiza puntualmente en CompletionScreen de Engine.
 */
export function PWAInstallManager() {
  return (
    <>
      <ActivityTracker />
      <WelcomeBackModal />
      <IOSInstallSheet />
    </>
  );
}
