'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import SuperJSON from 'superjson';
import { trpc } from '../utils/trpc';
import { getAuthToken } from '../lib/auth';
import { AuthProvider } from '../hooks/useAuth';
import { InstallPromptProvider } from '../components/pwa/InstallPromptContext';
import { ServiceWorkerRegister } from '../components/pwa/ServiceWorkerRegister';

function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Fallback para desarrollo local y pruebas en red.
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
        <AuthProvider>
          <InstallPromptProvider>
            {children}
            <ServiceWorkerRegister />
          </InstallPromptProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}