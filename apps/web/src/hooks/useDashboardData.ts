import { useState, useEffect } from 'react';
import { userStats, temarioMock } from '@ingresa-pe/domain';
import type { UserStats, TemaData } from '@ingresa-pe/domain';
import { trpc } from '../utils/trpc';

interface BackendUser {
  streak?: number;
  energy?: number;
  coins?: number;
}

function mapUserToStats(user: BackendUser): UserStats {
  return {
    racha: user.streak ?? 0,
    vidas: user.energy ?? 0,
    gemas: user.coins ?? 0,
  };
}

export function useDashboardData() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [temario, setTemario] = useState<TemaData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: user, isLoading: isUserLoading } = trpc.profile.getMe.useQuery(
    undefined,
    { retry: false }
  );

  useEffect(() => {
    // Simulamos una pequeña demora para evitar el flash de carga.
    const timeout = setTimeout(() => {
      setStats(user ? mapUserToStats(user as BackendUser) : userStats);
      setTemario(temarioMock);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [user]);

  return { data: { stats, temario }, isLoading: isUserLoading || isLoading };
}
