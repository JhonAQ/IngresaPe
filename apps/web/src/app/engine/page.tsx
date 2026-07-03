'use client';

import React, { Suspense } from 'react';
import { Engine } from '../../components/engine';

export default function EnginePreviewPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center">
        <div className="font-black text-[#58cc02]">Cargando engine…</div>
      </div>
    }>
      <Engine />
    </Suspense>
  );
}
