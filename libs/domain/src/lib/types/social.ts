import { z } from 'zod';
import { leagueSchema, areaSchema } from './ranking';

// DTO de un usuario en resultados de búsqueda
export const userSearchResultSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  division: leagueSchema,
  score: z.number(),
  career: z
    .object({
      id: z.string(),
      name: z.string(),
      area: areaSchema,
    })
    .nullable(),
  isFollowing: z.boolean(),
});
export type UserSearchResult = z.infer<typeof userSearchResultSchema>;

// DTO de un seguidor/seguido en las listas
export const followUserDtoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  division: leagueSchema,
  score: z.number(),
  career: z
    .object({
      id: z.string(),
      name: z.string(),
      area: areaSchema,
    })
    .nullable(),
  isFollowing: z.boolean(),
  followedAt: z.string(), // ISO date string
});
export type FollowUserDto = z.infer<typeof followUserDtoSchema>;

// Mini-perfil para el modal del ranking
export const userPreviewDtoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  division: leagueSchema,
  highestDivision: leagueSchema,
  score: z.number(),
  highestScore: z.number(),
  streak: z.number(),
  career: z
    .object({
      id: z.string(),
      name: z.string(),
      area: areaSchema,
    })
    .nullable(),
  isFollowing: z.boolean(),
  followersCount: z.number(),
  followingCount: z.number(),
  totalQuestionsAnswered: z.number(),
});
export type UserPreviewDto = z.infer<typeof userPreviewDtoSchema>;

// Perfil público completo
export const publicProfileDtoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.string(),
  division: leagueSchema,
  highestDivision: leagueSchema,
  score: z.number(),
  highestScore: z.number(),
  streak: z.number(),
  career: z
    .object({
      id: z.string(),
      name: z.string(),
      area: areaSchema,
    })
    .nullable(),
  isFollowing: z.boolean(),
  followersCount: z.number(),
  followingCount: z.number(),
  stats: z.object({
    totalQuestionsAnswered: z.number(),
    totalCorrect: z.number(),
    totalNodesCompleted: z.number(),
    totalSimulacrosCompleted: z.number(),
  }),
  academicDna: z.any().nullable(),
  heatmap: z.any().nullable(),
  ratingGraph: z.any().nullable(),
});
export type PublicProfileDto = z.infer<typeof publicProfileDtoSchema>;
