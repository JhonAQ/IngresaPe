'use client';

import React, { Suspense } from 'react';
import { AlchemyGame } from '../../../components/entrenar/alchemy';

export default function AlquimistaPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto h-[100dvh] flex items-center justify-center">
          <div className="font-black text-[#58cc02]">Preparando caldero…</div>
        </div>
      }
    >
      <AlchemyGame />
    </Suspense>
  );
}
