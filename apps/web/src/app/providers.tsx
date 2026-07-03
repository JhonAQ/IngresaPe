'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import SuperJSON from 'superjson';
import { trpc } from '../utils/trpc';
import { getAuthToken } from '../lib/auth';
import { AuthProvider } from '../hooks/useAuth';

function getApiUrl() {
  // En el navegador usamos el mismo hostname desde el que se sirvió el frontend.
  // Esto permite probar desde otros dispositivos en la red local (celular, tablet)
  // sin hardcodear la IP de la laptop.
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3000/trpc`;
  }
  return 'http://localhost:3000/trpc';
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getApiUrl(),
          transformer: SuperJSON,
          headers() {
            const token = getAuthToken();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}