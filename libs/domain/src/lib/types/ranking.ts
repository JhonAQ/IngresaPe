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
  score: z.number(),
  rank: z.number(),
  isMe: z.boolean(),
  division: leagueSchema,
  career: careerSummarySchema.nullable(),
  delta: z.number().nullable().optional(),
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
  score: z.number(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  division: leagueSchema,
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
    hex: string;
  }
> = {
  HUEVITO: {
    label: 'Huevito',
    color: '#9CA3AF',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    shadow: 'border-b-slate-300',
    text: 'text-slate-700',
    emoji: '🥚',
    hex: '#9CA3AF',
  },
  POLLITO: {
    label: 'Pollito',
    color: '#84CC16',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    shadow: 'border-b-lime-300',
    text: 'text-lime-700',
    emoji: '🐤',
    hex: '#84CC16',
  },
  DINOSAURIO: {
    label: 'Dinosaurio',
    color: '#3B82F6',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    shadow: 'border-b-blue-300',
    text: 'text-blue-700',
    emoji: '🦖',
    hex: '#3B82F6',
  },
  FOSIL: {
    label: 'Fósil',
    color: '#F97316',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    shadow: 'border-b-orange-300',
    text: 'text-orange-700',
    emoji: '🦴',
    hex: '#F97316',
  },
  CACHIMBO: {
    label: 'Cachimbo',
    color: '#DC2626',
    bg: 'bg-red-50',
    border: 'border-red-200',
    shadow: 'border-b-red-300',
    text: 'text-red-700',
    emoji: '🏆',
    hex: '#DC2626',
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
  if (ptje < 20) return 'HUEVITO';
  if (ptje < 40) return 'POLLITO';
  if (ptje < 60) return 'DINOSAURIO';
  if (ptje < 80) return 'FOSIL';
  return 'CACHIMBO';
}
