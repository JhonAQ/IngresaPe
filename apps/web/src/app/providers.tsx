'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import { trpc } from '../utils/trpc'; // <-- Ruta corregida (ahora es relativa dentro de src)
import SuperJSON from 'superjson';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          // ANTES: url: 'http://localhost:3000/api/trpc',
          // AHORA (Corregido):
          url: 'http://localhost:3000/trpc', 
          
          transformer: SuperJSON,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}