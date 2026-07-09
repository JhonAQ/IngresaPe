'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ArchivoExamenesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/simulacros');
  }, [router]);

  return null;
}
