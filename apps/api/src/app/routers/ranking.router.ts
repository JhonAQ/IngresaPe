import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';
import { type League, getLeagueByPtje } from '@ingresa-pe/domain';

const areaSchema = z.enum(['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS']);

interface WeeklyStats {
  ptje: number;
  bestScore: number;
  attemptsCount: number;
  lastSubmittedAt: Date | null;
}

interface Player {
  id: string;
  name: string | null;
  image: string | null;
  career: { id: string; name: string; area: 'INGENIERIAS' | 'SOCIALES' | 'BIOMEDICAS' } | null;
  weeklyStats: WeeklyStats;
  league: League;
}

function getWeekBounds(now = new Date()): { start: Date; end: Date } {
  const day = now.getDay(); // 0 = domingo
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function computeWeeklyStats(
  attempts: { score: number | null; submittedAt: Date | null }[]
): WeeklyStats {
  const valid = attempts.filter(
    (a): a is { score: number; submittedAt: Date } =>
      a.score !== null && a.submittedAt !== null
  );

  if (valid.length === 0) {
    return { ptje: 0, bestScore: 0, attemptsCount: 0, lastSubmittedAt: null };
  }

  const total = valid.reduce((sum, a) => sum + a.score, 0);
  const bestScore = Math.max(...valid.map((a) => a.score));
  const lastSubmittedAt = valid.reduce((latest, a) =>
    a.submittedAt > latest ? a.submittedAt : latest, valid[0].submittedAt
  );

  return {
    ptje: Number((total / valid.length).toFixed(1)),
    bestScore,
    attemptsCount: valid.length,
    lastSubmittedAt,
  };
}

function comparePlayers(a: Player, b: Player): number {
  if (b.weeklyStats.ptje !== a.weeklyStats.ptje) {
    return b.weeklyStats.ptje - a.weeklyStats.ptje;
  }
  if (b.weeklyStats.bestScore !== a.weeklyStats.bestScore) {
    return b.weeklyStats.bestScore - a.weeklyStats.bestScore;
  }
  if (b.weeklyStats.attemptsCount !== a.weeklyStats.attemptsCount) {
    return b.weeklyStats.attemptsCount - a.weeklyStats.attemptsCount;
  }
  const aDate = a.weeklyStats.lastSubmittedAt?.getTime() ?? 0;
  const bDate = b.weeklyStats.lastSubmittedAt?.getTime() ?? 0;
  return bDate - aDate;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

@Injectable()
export class RankingRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  private async loadPlayers(
    where: Record<string, unknown> = {}
  ): Promise<Player[]> {
    const { start, end } = getWeekBounds();

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        image: true,
        career: {
          select: { id: true, name: true, area: true },
        },
        attempts: {
          where: {
            status: 'COMPLETED',
            score: { not: null },
            submittedAt: { gte: start, lt: end },
          },
          select: { score: true, submittedAt: true },
        },
      },
    });

    return users.map((user) => {
      const weeklyStats = computeWeeklyStats(user.attempts);
      return {
        id: user.id,
        name: user.name,
        image: user.image,
        career: user.career,
        weeklyStats,
        league: getLeagueByPtje(weeklyStats.ptje),
      };
    });
  }

  private toRankingUserDto(
    player: Player,
    rank: number,
    currentUserId: string
  ) {
    return {
      id: player.id,
      name: player.name,
      image: player.image,
      weeklyPtje: player.weeklyStats.ptje,
      rank,
      isMe: player.id === currentUserId,
      league: player.league,
      career: player.career,
    };
  }

  private buildLeaderboardResult(
    players: Player[],
    currentUserId: string
  ) {
    const ranked = players
      .sort(comparePlayers)
      .map((p, index) => this.toRankingUserDto(p, index + 1, currentUserId));

    const top = ranked.slice(0, 10);
    const currentIndex = ranked.findIndex((p) => p.isMe);
    const me = currentIndex >= 0 ? ranked[currentIndex] : null;

    return {
      top,
      me,
      totalInLeague: ranked.length,
    };
  }

  private getUserLeagueGroup(
    allPlayers: Player[],
    currentUserId: string
  ): { group: Player[]; currentLeague: League } {
    const currentPlayer = allPlayers.find((p) => p.id === currentUserId);
    const currentLeague = currentPlayer?.league ?? 'HUEVITO';

    const leaguePlayers = allPlayers
      .filter((p) => p.league === currentLeague)
      .sort(comparePlayers);

    const chunks = chunkArray(leaguePlayers, 10);
    const userChunk =
      chunks.find((chunk) => chunk.some((p) => p.id === currentUserId)) ??
      chunks[chunks.length - 1] ??
      [];

    return { group: userChunk, currentLeague };
  }

  public router = this.trpc.router({
    // Liga semanal: grupo de hasta 10 usuarios de la misma liga
    getWeeklyLeague: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const currentUserId = ctx.user.userId;
      const allPlayers = await this.loadPlayers();
      const { group } = this.getUserLeagueGroup(allPlayers, currentUserId);

      const ranked = group
        .sort(comparePlayers)
        .map((p, index) => this.toRankingUserDto(p, index + 1, currentUserId));

      return {
        top: ranked,
        me: ranked.find((p) => p.isMe) ?? null,
        totalInLeague: ranked.length,
      };
    }),

    // Estado del usuario en su liga semanal
    getMyLeagueStatus: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const currentUserId = ctx.user.userId;
      const allPlayers = await this.loadPlayers();
      const currentPlayer = allPlayers.find((p) => p.id === currentUserId);

      if (!currentPlayer) {
        return {
          rank: 0,
          weeklyPtje: 0,
          name: null as string | null,
          image: null as string | null,
          league: 'HUEVITO' as League,
          career: null,
          attemptsThisWeek: 0,
          promotionZone: false,
          relegationZone: false,
          totalInLeague: 0,
        };
      }

      const { group } = this.getUserLeagueGroup(allPlayers, currentUserId);
      const ranked = group.sort(comparePlayers);
      const rank = ranked.findIndex((p) => p.id === currentUserId) + 1;
      const total = ranked.length;

      return {
        rank,
        weeklyPtje: currentPlayer.weeklyStats.ptje,
        name: currentPlayer.name,
        image: currentPlayer.image,
        league: currentPlayer.league,
        career: currentPlayer.career,
        attemptsThisWeek: currentPlayer.weeklyStats.attemptsCount,
        promotionZone: rank <= 3,
        relegationZone: rank > total - 2,
        totalInLeague: total,
      };
    }),

    // Ranking por área (por puntaje semanal)
    getAreaLeaderboard: this.trpc.protectedProcedure
      .input(z.object({ area: areaSchema }))
      .query(async ({ ctx, input }) => {
        const currentUserId = ctx.user.userId;
        const players = (await this.loadPlayers()).filter(
          (p) => p.career?.area === input.area
        );
        return this.buildLeaderboardResult(players, currentUserId);
      }),

    // Ranking por carrera (por puntaje semanal)
    getCareerLeaderboard: this.trpc.protectedProcedure
      .input(z.object({ careerId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const currentUserId = ctx.user.userId;
        const players = (await this.loadPlayers()).filter(
          (p) => p.career?.id === input.careerId
        );
        return this.buildLeaderboardResult(players, currentUserId);
      }),

    // Listado de carreras para el filtro
    getCareerOptions: this.trpc.protectedProcedure.query(async () => {
      const careers = await this.prisma.career.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          area: true,
        },
      });
      return careers;
    }),
  });
}
