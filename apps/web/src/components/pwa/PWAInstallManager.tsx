'use client';

import React from 'react';
import { IOSInstallSheet } from './IOSInstallSheet';

/**
 * Orquestador global de prompts de instalación PWA.
 *
 * - IOSInstallSheet se controla desde el contexto (se abre cuando el usuario
 *   toca "Instalar" en iOS/Safari).
 * - InstallPromptModal se renderiza puntualmente en CompletionScreen de Engine
 *   para que aparezca justo después de la primera lección completada.
 * - InstallBanner e InstallTag se insertan directamente en dashboard y perfil.
 */
export function PWAInstallManager() {
  return <IOSInstallSheet />;
}
