import { z } from 'zod';

export const areaSchema = z.enum(['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS']);
export type Area = z.infer<typeof areaSchema>;

export const careerSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  area: areaSchema,
});
export type CareerSummaryDto = z.infer<typeof careerSummarySchema>;

export const leagueSchema = z.enum([
  'HUEVITO',
  'POLLITO',
  'DINOSAURIO',
  'FOSIL',
  'CACHIMBO',
]);
export type League = z.infer<typeof leagueSchema>;

export const rankingUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  weeklyPtje: z.number(),
  rank: z.number(),
  isMe: z.boolean(),
  league: leagueSchema,
  career: careerSummarySchema.nullable(),
});
export type RankingUserDto = z.infer<typeof rankingUserSchema>;

export const leaderboardGroupSchema = z.object({
  top: z.array(rankingUserSchema),
  me: rankingUserSchema.nullable(),
  totalInLeague: z.number(),
});
export type LeaderboardGroupDto = z.infer<typeof leaderboardGroupSchema>;

export const allCareersLeaderboardSchema = z.object({
  groups: z.array(
    z.object({
      careerId: z.string(),
      careerName: z.string(),
      area: areaSchema,
      minimumScore: z.number().nullable(),
      ...leaderboardGroupSchema.shape,
    })
  ),
});
export type AllCareersLeaderboardDto = z.infer<typeof allCareersLeaderboardSchema>;

export const allAreasLeaderboardSchema = z.object({
  groups: z.array(
    z.object({
      area: areaSchema,
      ...leaderboardGroupSchema.shape,
    })
  ),
});
export type AllAreasLeaderboardDto = z.infer<typeof allAreasLeaderboardSchema>;

export const weeklyLeagueSchema = z.object({
  top: z.array(rankingUserSchema),
  me: rankingUserSchema.nullable(),
  totalInLeague: z.number(),
  currentLeague: leagueSchema,
});
export type WeeklyLeagueDto = z.infer<typeof weeklyLeagueSchema>;

export const rankingPositionSchema = z.object({
  rank: z.number(),
  weeklyPtje: z.number(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  league: leagueSchema,
  career: careerSummarySchema.nullable(),
});
export type RankingPositionDto = z.infer<typeof rankingPositionSchema>;

export const leagueConfig: Record<
  League,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    shadow: string;
    text: string;
    emoji: string;
  }
> = {
  HUEVITO: {
    label: 'Huevito',
    color: '#f5e6d3',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    shadow: 'border-b-amber-300',
    text: 'text-amber-700',
    emoji: '🥚',
  },
  POLLITO: {
    label: 'Pollito',
    color: '#fff5c2',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    shadow: 'border-b-yellow-300',
    text: 'text-yellow-700',
    emoji: '🐤',
  },
  DINOSAURIO: {
    label: 'Dinosaurio',
    color: '#d4edbc',
    bg: 'bg-green-50',
    border: 'border-green-200',
    shadow: 'border-b-green-300',
    text: 'text-green-700',
    emoji: '🦖',
  },
  FOSIL: {
    label: 'Fósil',
    color: '#e2e2e2',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    shadow: 'border-b-slate-400',
    text: 'text-slate-700',
    emoji: '🦴',
  },
  CACHIMBO: {
    label: 'Cachimbo',
    color: '#bd1720',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    shadow: 'border-b-primary-300',
    text: 'text-primary-700',
    emoji: '🏆',
  },
};

export const leagueOrder: League[] = [
  'HUEVITO',
  'POLLITO',
  'DINOSAURIO',
  'FOSIL',
  'CACHIMBO',
];

export const areaLabels: Record<Area, string> = {
  INGENIERIAS: 'Ingenierías',
  SOCIALES: 'Sociales',
  BIOMEDICAS: 'Biomédicas',
};

export const areaOrder: Area[] = ['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS'];

export function getLeagueByPtje(ptje: number): League {
  if (ptje < 40) return 'HUEVITO';
  if (ptje < 55) return 'POLLITO';
  if (ptje < 70) return 'DINOSAURIO';
  if (ptje < 85) return 'FOSIL';
  return 'CACHIMBO';
}
