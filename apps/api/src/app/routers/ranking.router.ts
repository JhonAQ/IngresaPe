import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';
import { LeaderboardService } from '../services/leaderboard.service';
import { SeasonService } from '../services/season.service';
import { ratingToScore } from '../services/rating.service';
import { Division } from '@prisma/client';
import { RankingUserDto } from '@ingresa-pe/domain';

const divisionSchema = z.enum([
  'HUEVITO',
  'POLLITO',
  'DINOSAURIO',
  'FOSIL',
  'CACHIMBO',
]);
const areaSchema = z.enum(['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS']);

@Injectable()
export class RankingRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService,
    private readonly leaderboard: LeaderboardService,
    private readonly seasonService: SeasonService
  ) {}

  public router = this.trpc.router({
    getCurrentSeasonStatus: this.trpc.protectedProcedure.query(
      async ({ ctx }) => {
        const season = await this.seasonService.getOrCreateCurrentSeason();
        const hasOfficialAttempt = await this.seasonService.hasOfficialAttempt(
          ctx.user.userId,
          season.id
        );
        return {
          id: season.id,
          isEventOpen: this.seasonService.isEventOpen(season),
          eventStartsAt: season.eventStartsAt,
          eventEndsAt: season.eventEndsAt,
          isRevealed: season.isRevealed,
          revealedAt: season.revealedAt,
          hasOfficialAttempt,
        };
      }
    ),

    getMyStats: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      return this.buildMyStats(ctx.user.userId);
    }),

    getDivisionLeaderboard: this.trpc.protectedProcedure
      .input(
        z.object({
          division: divisionSchema,
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(100).default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        return await this.leaderboard.getDivisionLeaderboard(
          input.division,
          input.page,
          input.pageSize,
          ctx.user.userId
        );
      }),

    getGlobalLeaderboard: this.trpc.protectedProcedure
      .input(
        z.object({
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(100).default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        return await this.leaderboard.getGlobalLeaderboard(
          input.page,
          input.pageSize,
          ctx.user.userId
        );
      }),

    getAreaLeaderboard: this.trpc.protectedProcedure
      .input(
        z.object({
          area: areaSchema,
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(100).default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        return await this.leaderboard.getAreaLeaderboard(
          input.area,
          input.page,
          input.pageSize,
          ctx.user.userId
        );
      }),

    getCareerLeaderboard: this.trpc.protectedProcedure
      .input(
        z.object({
          careerId: z.string().uuid(),
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(100).default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        return await this.leaderboard.getCareerLeaderboard(
          input.careerId,
          input.page,
          input.pageSize,
          ctx.user.userId
        );
      }),

    getRatingHistory: this.trpc.protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(20) }))
      .query(async ({ ctx, input }) => {
        const histories = await this.prisma.ratingHistory.findMany({
          where: { userId: ctx.user.userId },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          include: { season: { select: { weekIndex: true } } },
        });

        return histories.map((h) => ({
          id: h.id,
          weekIndex: h.season.weekIndex,
          score: h.score,
          oldRating: h.oldRating,
          newRating: h.newRating,
          delta: h.delta,
          divisionAtTime: h.divisionAtTime,
          mode: h.mode,
          appliedAt: h.appliedAt,
        }));
      }),

    // Legacy endpoints mantenidos para compatibilidad mientras se migra el frontend
    getWeeklyLeague: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const user = await this.prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: { division: true },
      });
      const result = await this.leaderboard.getDivisionLeaderboard(
        user?.division ?? 'HUEVITO',
        1,
        20,
        ctx.user.userId
      );
      return {
        top: result.entries.map((e) => this.toRankingUser(e)),
        me: result.me ? this.toRankingUser(result.me) : null,
        totalInLeague: result.total,
        currentLeague: user?.division ?? 'HUEVITO',
      };
    }),

    getAllCareersLeaderboard: this.trpc.protectedProcedure.query(
      async ({ ctx }) => {
        const { groups } = await this.leaderboard.getAllCareersLeaderboard(
          ctx.user.userId,
          20
        );
        return {
          groups: groups.map((g) => ({
            ...g,
            top: g.top.map((e) => this.toRankingUser(e)),
            me: g.me ? this.toRankingUser(g.me) : null,
          })),
        };
      }
    ),

    getAllAreasLeaderboard: this.trpc.protectedProcedure.query(
      async ({ ctx }) => {
        const { groups } = await this.leaderboard.getAllAreasLeaderboard(
          ctx.user.userId,
          20
        );
        return {
          groups: groups.map((g) => ({
            ...g,
            top: g.top.map((e) => this.toRankingUser(e)),
            me: g.me ? this.toRankingUser(g.me) : null,
          })),
        };
      }
    ),

    getGlobalLeaderboardGroup: this.trpc.protectedProcedure.query(
      async ({ ctx }) => {
        const result = await this.leaderboard.getGlobalLeaderboard(
          1,
          20,
          ctx.user.userId
        );
        return {
          top: result.entries.map((e) => this.toRankingUser(e)),
          me: result.me ? this.toRankingUser(result.me) : null,
          totalInLeague: result.total,
        };
      }
    ),

    getMyLeagueStatus: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      return this.buildMyStats(ctx.user.userId);
    }),

    getCareerOptions: this.trpc.protectedProcedure.query(async () => {
      return await this.prisma.career.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, area: true },
      });
    }),
  });

  private toRankingUser(entry: {
    userId: string;
    name: string | null;
    image: string | null;
    score: number;
    rank: number;
    division: Division;
    delta: number | null;
    isMe: boolean;
  }): RankingUserDto {
    return {
      id: entry.userId,
      name: entry.name,
      image: entry.image,
      score: entry.score,
      rank: entry.rank,
      division: entry.division,
      delta: entry.delta,
      isMe: entry.isMe,
      career: null,
    };
  }

  private async buildMyStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        rating: true,
        highestRating: true,
        division: true,
        highestDivision: true,
        career: {
          select: { id: true, name: true, area: true, minimumScore: true },
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const latestHistory = await this.prisma.ratingHistory.findFirst({
      where: { userId: user.id, appliedAt: { not: null } },
      orderBy: { appliedAt: 'desc' },
    });

    return {
      userId: user.id,
      name: user.name,
      image: user.image,
      rating: user.rating,
      score: ratingToScore(user.rating),
      highestRating: user.highestRating,
      highestScore: ratingToScore(user.highestRating),
      division: user.division,
      highestDivision: user.highestDivision,
      career: user.career,
      lastDelta: latestHistory?.delta ?? null,
    };
  }
}
