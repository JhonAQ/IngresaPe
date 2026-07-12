import { trpc } from '../utils/trpc';
import { getLevelFromXp, getLevelProgress } from '../lib/level';

interface BackendUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role?: string;
  careerId?: string | null;
  career?: { id: string; name: string; area: string } | null;
  energy?: number;
  coins?: number;
  inventory?: string[];
  totalXp?: number;
  streak?: number;
  lastInteraction?: Date | string | null;
  isPremium?: boolean;
}

interface BackendCourse {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  _count?: { topics?: number };
}

interface RankingPosition {
  rank: number;
  weeklyPtje: number;
  name?: string | null;
}

export function useProfileData() {
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = trpc.profile.getMe.useQuery(undefined, { retry: false });

  const {
    data: rankData,
    isLoading: isRankLoading,
  } = trpc.ranking.getMyLeagueStatus.useQuery(undefined, { retry: false });

  const {
    data: courses,
    isLoading: isCoursesLoading,
  } = trpc.content.getCourses.useQuery(undefined, { retry: false });

  const profile = user as BackendUser | undefined;
  const rank = (rankData as RankingPosition | undefined)?.rank ?? null;
  const totalXp = profile?.totalXp ?? 0;
  const level = getLevelFromXp(totalXp);
  const xpProgress = getLevelProgress(totalXp);

  return {
    user: profile,
    rank,
    level,
    xpProgress,
    courses: (courses as BackendCourse[] | undefined) ?? [],
    isLoading: isUserLoading || isRankLoading || isCoursesLoading,
    error: userError,
  };
}
