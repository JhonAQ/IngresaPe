import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Division, Prisma } from '@prisma/client';
import { ratingToScore } from './rating.service';
import { Area } from '@ingresa-pe/domain';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  rating: number;
  score: number;
  division: Division;
  delta: number | null;
  isMe: boolean;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  total: number;
}

export interface CareerLeaderboardGroup {
  careerId: string;
  careerName: string;
  area: Area;
  minimumScore: number | null;
  totalInLeague: number;
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

export interface AreaLeaderboardGroup {
  area: Area;
  totalInLeague: number;
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDivisionLeaderboard(
    division: Division,
    page = 1,
    pageSize = 50,
    currentUserId?: string
  ): Promise<LeaderboardResult> {
    const where: Prisma.UserWhereInput = { division };
    const total = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { rating: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const entries = await this.enrichUsers(users, currentUserId);
    const me = await this.buildMeEntry(
      { ...where, id: currentUserId },
      currentUserId,
      (rating) =>
        this.prisma.user.count({ where: { division, rating: { gt: rating } } })
    );

    return { entries, me, total };
  }

  async getGlobalLeaderboard(
    page = 1,
    pageSize = 50,
    currentUserId?: string
  ): Promise<LeaderboardResult> {
    const total = await this.prisma.user.count();
    const users = await this.prisma.user.findMany({
      orderBy: { rating: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const entries = await this.enrichUsers(users, currentUserId);
    const me = await this.buildMeEntry(
      { id: currentUserId },
      currentUserId,
      (rating) => this.prisma.user.count({ where: { rating: { gt: rating } } })
    );

    return { entries, me, total };
  }

  async getCareerLeaderboard(
    careerId: string,
    page = 1,
    pageSize = 50,
    currentUserId?: string
  ): Promise<LeaderboardResult> {
    const where: Prisma.UserWhereInput = { careerId };
    const total = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { rating: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const entries = await this.enrichUsers(users, currentUserId);
    const me = await this.buildMeEntry(
      { ...where, id: currentUserId },
      currentUserId,
      (rating) =>
        this.prisma.user.count({ where: { careerId, rating: { gt: rating } } })
    );

    return { entries, me, total };
  }

  async getAreaLeaderboard(
    area: string,
    page = 1,
    pageSize = 50,
    currentUserId?: string
  ): Promise<LeaderboardResult> {
    const careers = await this.prisma.career.findMany({
      where: { area: area as any },
      select: { id: true },
    });
    const careerIds = careers.map((c) => c.id);

    const where: Prisma.UserWhereInput = { careerId: { in: careerIds } };
    const total = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { rating: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const entries = await this.enrichUsers(users, currentUserId);
    const me = await this.buildMeEntry(
      { ...where, id: currentUserId },
      currentUserId,
      (rating) =>
        this.prisma.user.count({
          where: { careerId: { in: careerIds }, rating: { gt: rating } },
        })
    );

    return { entries, me, total };
  }

  private async enrichUsers(
    users: {
      id: string;
      name: string | null;
      image: string | null;
      rating: number;
      division: Division;
    }[],
    currentUserId?: string
  ): Promise<LeaderboardEntry[]> {
    const userIds = users.map((u) => u.id);
    const deltas = await this.getLatestDeltas(userIds);

    return users.map((u, idx) => ({
      rank: idx + 1,
      userId: u.id,
      name: u.name,
      image: u.image,
      rating: u.rating,
      score: ratingToScore(u.rating),
      division: u.division,
      delta: deltas.get(u.id) ?? null,
      isMe: u.id === currentUserId,
    }));
  }

  private async getLatestDeltas(
    userIds: string[]
  ): Promise<Map<string, number>> {
    if (userIds.length === 0) return new Map();
    const histories = await this.prisma.ratingHistory.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, appliedAt: { not: null } },
      _max: { appliedAt: true },
    });
    const latestHistory = await this.prisma.ratingHistory.findMany({
      where: {
        userId: { in: userIds },
        appliedAt: {
          in: histories.map((h) => h._max.appliedAt!).filter(Boolean),
        },
      },
    });
    return new Map(latestHistory.map((h) => [h.userId, h.delta]));
  }

  private async buildMeEntry(
    userWhere: Prisma.UserWhereInput,
    currentUserId: string | undefined,
    countAbove: (rating: number) => Promise<number>
  ): Promise<LeaderboardEntry | null> {
    if (!currentUserId) return null;

    const meUser = await this.prisma.user.findFirst({
      where: userWhere,
      select: {
        id: true,
        name: true,
        image: true,
        rating: true,
        division: true,
      },
    });

    if (!meUser) return null;

    // Si ya está en el top, no es necesario reconstruirlo.
    const delta =
      (await this.getLatestDeltas([meUser.id])).get(meUser.id) ?? null;
    const rank = (await countAbove(meUser.rating)) + 1;

    return {
      rank,
      userId: meUser.id,
      name: meUser.name,
      image: meUser.image,
      rating: meUser.rating,
      score: ratingToScore(meUser.rating),
      division: meUser.division,
      delta,
      isMe: true,
    };
  }

  /**
   * Ranking por cada carrera. Una sola query agrupa en memoria.
   */
  async getAllCareersLeaderboard(
    currentUserId?: string,
    topN = 10
  ): Promise<{ groups: CareerLeaderboardGroup[] }> {
    const [careers, users] = await Promise.all([
      this.prisma.career.findMany({
        select: { id: true, name: true, area: true, minimumScore: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.findMany({
        where: { careerId: { not: null } },
        select: {
          id: true,
          name: true,
          image: true,
          rating: true,
          division: true,
          careerId: true,
        },
        orderBy: { rating: 'desc' },
      }),
    ]);

    const careerMap = new Map(careers.map((c) => [c.id, c]));
    const grouped = new Map<string, LeaderboardEntry[]>();

    for (const u of users) {
      if (!u.careerId) continue;
      const career = careerMap.get(u.careerId);
      if (!career) continue;
      const list = grouped.get(career.id) ?? [];
      list.push({
        rank: list.length + 1,
        userId: u.id,
        name: u.name,
        image: u.image,
        rating: u.rating,
        score: ratingToScore(u.rating),
        division: u.division,
        delta: null,
        isMe: u.id === currentUserId,
      });
      grouped.set(career.id, list);
    }

    const groups: CareerLeaderboardGroup[] = [];
    for (const career of careers) {
      const list = grouped.get(career.id) ?? [];
      groups.push({
        careerId: career.id,
        careerName: career.name,
        area: career.area as Area,
        minimumScore: career.minimumScore,
        totalInLeague: list.length,
        top: list.slice(0, topN),
        me: currentUserId
          ? list.find((e) => e.userId === currentUserId) ?? null
          : null,
      });
    }

    return { groups };
  }

  /**
   * Ranking por cada área (3 listas).
   */
  async getAllAreasLeaderboard(
    currentUserId?: string,
    topN = 10
  ): Promise<{ groups: AreaLeaderboardGroup[] }> {
    const users = await this.prisma.user.findMany({
      where: { careerId: { not: null } },
      select: {
        id: true,
        name: true,
        image: true,
        rating: true,
        division: true,
        careerId: true,
        career: { select: { area: true } },
      },
      orderBy: { rating: 'desc' },
    });

    const grouped = new Map<Area, LeaderboardEntry[]>();

    for (const u of users) {
      const area = u.career?.area as Area | undefined;
      if (!area) continue;
      const list = grouped.get(area) ?? [];
      list.push({
        rank: list.length + 1,
        userId: u.id,
        name: u.name,
        image: u.image,
        rating: u.rating,
        score: ratingToScore(u.rating),
        division: u.division,
        delta: null,
        isMe: u.id === currentUserId,
      });
      grouped.set(area, list);
    }

    const areas: Area[] = ['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS'];
    const groups: AreaLeaderboardGroup[] = areas.map((area) => {
      const list = grouped.get(area) ?? [];
      return {
        area,
        totalInLeague: list.length,
        top: list.slice(0, topN),
        me: currentUserId
          ? list.find((e) => e.userId === currentUserId) ?? null
          : null,
      };
    });

    return { groups };
  }
}
