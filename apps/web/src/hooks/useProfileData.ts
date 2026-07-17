import { trpc } from '../utils/trpc';

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
  gems?: number;
  inventory?: string[];
  streak?: number;
  lastInteraction?: Date | string | null;
  isPremium?: boolean;
  rating?: number;
  score?: number;
  division?: string;
  highestScore?: number;
  highestDivision?: string;
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

  const { data: rankData, isLoading: isRankLoading } =
    trpc.ranking.getMyStats.useQuery(undefined, { retry: false });

  const { data: courses, isLoading: isCoursesLoading } =
    trpc.content.getCourses.useQuery(undefined, { retry: false });

  const profile = user as BackendUser | undefined;
  const rank = (rankData as RankingPosition | undefined)?.rank ?? null;

  return {
    user: profile,
    rank,
    score: profile?.score ?? 0,
    division: profile?.division ?? 'HUEVITO',
    highestScore: profile?.highestScore ?? 0,
    gems: profile?.gems ?? 0,
    courses: (courses as BackendCourse[] | undefined) ?? [],
    isLoading: isUserLoading || isRankLoading || isCoursesLoading,
    error: userError,
  };
}
