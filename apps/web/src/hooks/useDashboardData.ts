import { useState, useEffect } from 'react';
import { userStats, temarioMock } from '@ingresa-pe/domain';
import type { UserStats, TemaData } from '@ingresa-pe/domain';

export function useDashboardData() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [temario, setTemario] = useState<TemaData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos una demora de red para asemejar un entorno productivo (tRPC)
    const timeout = setTimeout(() => {
      setStats(userStats);
      setTemario(temarioMock);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, []);

  return { data: { stats, temario }, isLoading };
}
