'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BasicQuizEngine } from '../../components/engine';

export default function EnginePreviewPage() {
  const router = useRouter();

  return (
    <BasicQuizEngine onClose={() => router.back()} />
  );
}