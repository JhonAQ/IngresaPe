'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAuthToken, removeAuthToken, setAuthToken } from '../lib/auth';
import { trpc } from '../utils/trpc';

// Tipado local basado en la respuesta de profile.getMe.
// Evitamos importar AppRouterType directamente para respetar las reglas de
// boundaries de Nx (el tipo del router ya se usa a través de trpc.ts).
interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role?: string;
  energy?: number;
  coins?: number;
  gems?: number;
  streak?: number;
  isPremium?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setToken(getAuthToken());
    setIsReady(true);
  }, []);

  const {
    data: user,
    isLoading: isProfileLoading,
    error,
  } = trpc.profile.getMe.useQuery(undefined, {
    enabled: isReady && !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Si el token es inválido/expirado, limpiamos el storage.
  useEffect(() => {
    if (error && error.data?.code === 'UNAUTHORIZED') {
      removeAuthToken();
      setToken(null);
    }
  }, [error]);

  const login = useCallback(
    (newToken: string) => {
      setAuthToken(newToken);
      setToken(newToken);
      void queryClient.invalidateQueries({ queryKey: [['profile', 'getMe']] });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    removeAuthToken();
    setToken(null);
    queryClient.clear();
    router.replace('/login');
  }, [queryClient, router]);

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading: !isReady || isProfileLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
