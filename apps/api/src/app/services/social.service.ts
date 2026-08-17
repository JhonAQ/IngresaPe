import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';
import { ratingToScore } from './rating.service';
import { ActivityService } from './activity.service';
import {
  ACADEMIC_AXIS_DEFINITIONS,
  getAxisIdByCourseSlug,
  type AcademicAxisId,
} from '../lib/academic-dna';

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService
  ) {}

  /**
   * Search users by name or email (ILIKE). Excludes the current user.
   * Returns isFollowing status for each result.
   */
  async searchUsers(
    query: string,
    currentUserId: string,
    page = 1,
    pageSize = 20
  ) {
    if (query.trim().length < 2) return { users: [], total: 0 };

    const where = {
      id: { not: currentUserId },
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          image: true,
          division: true,
          rating: true,
          career: { select: { id: true, name: true, area: true } },
        },
        orderBy: { rating: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    // Check follow status for all results in one query
    const follows = await this.prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: users.map((u) => u.id) },
      },
      select: { followingId: true },
    });
    const followingSet = new Set(follows.map((f) => f.followingId));

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        image: u.image,
        division: u.division,
        score: ratingToScore(u.rating),
        career: u.career,
        isFollowing: followingSet.has(u.id),
      })),
      total,
    };
  }

  /**
   * Follow a user. Validates no self-follow and no duplicates.
   */
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No puedes seguirte a ti mismo',
      });
    }

    // Check target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });
    if (!targetUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    // Check if already following
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Ya sigues a este usuario',
      });
    }

    await this.prisma.follow.create({
      data: { followerId, followingId },
    });

    return { success: true };
  }

  /**
   * Unfollow a user.
   */
  async unfollowUser(followerId: string, followingId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No sigues a este usuario',
      });
    }

    await this.prisma.follow.delete({
      where: { id: existing.id },
    });

    return { success: true };
  }

  /**
   * Get followers of a user, with isFollowing from viewer's perspective.
   */
  async getFollowers(
    userId: string,
    viewerId: string,
    page = 1,
    pageSize = 20
  ) {
    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              division: true,
              rating: true,
              career: { select: { id: true, name: true, area: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
    ]);

    // Check which of these followers the viewer is also following
    const followerIds = follows.map((f) => f.follower.id);
    const viewerFollows = await this.prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followingId: { in: followerIds },
      },
      select: { followingId: true },
    });
    const viewerFollowingSet = new Set(viewerFollows.map((f) => f.followingId));

    return {
      users: follows.map((f) => ({
        id: f.follower.id,
        name: f.follower.name,
        image: f.follower.image,
        division: f.follower.division,
        score: ratingToScore(f.follower.rating),
        career: f.follower.career,
        isFollowing: viewerFollowingSet.has(f.follower.id),
        followedAt: f.createdAt.toISOString(),
      })),
      total,
    };
  }

  /**
   * Get users that a user is following, with isFollowing from viewer's perspective.
   */
  async getFollowing(
    userId: string,
    viewerId: string,
    page = 1,
    pageSize = 20
  ) {
    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
              division: true,
              rating: true,
              career: { select: { id: true, name: true, area: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    // For the viewer, check which of these they follow
    const followingIds = follows.map((f) => f.following.id);
    const viewerFollows = userId === viewerId
      ? follows.map((f) => ({ followingId: f.following.id })) // If viewing own list, all are followed
      : await this.prisma.follow.findMany({
          where: {
            followerId: viewerId,
            followingId: { in: followingIds },
          },
          select: { followingId: true },
        });
    const viewerFollowingSet = new Set(viewerFollows.map((f) => f.followingId));

    return {
      users: follows.map((f) => ({
        id: f.following.id,
        name: f.following.name,
        image: f.following.image,
        division: f.following.division,
        score: ratingToScore(f.following.rating),
        career: f.following.career,
        isFollowing: viewerFollowingSet.has(f.following.id),
        followedAt: f.createdAt.toISOString(),
      })),
      total,
    };
  }

  /**
   * Get follower and following counts for a user.
   */
  async getFollowCounts(userId: string) {
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followersCount, followingCount };
  }

  /**
   * Check if follower is following target.
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    return !!follow;
  }

  /**
   * Get a mini-preview of a user (for ranking modal).
   */
  async getUserPreview(targetUserId: string, viewerUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        image: true,
        division: true,
        highestDivision: true,
        rating: true,
        highestRating: true,
        streak: true,
        career: { select: { id: true, name: true, area: true } },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    const [isFollowing, counts, totalQuestionsAnswered] = await Promise.all([
      this.isFollowing(viewerUserId, targetUserId),
      this.getFollowCounts(targetUserId),
      this.prisma.answerLog.count({ where: { userId: targetUserId } }),
    ]);

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      division: user.division,
      highestDivision: user.highestDivision,
      score: ratingToScore(user.rating),
      highestScore: ratingToScore(user.highestRating),
      streak: user.streak,
      career: user.career,
      isFollowing,
      followersCount: counts.followersCount,
      followingCount: counts.followingCount,
      totalQuestionsAnswered,
    };
  }

  /**
   * Get a complete public profile of a user.
   */
  async getPublicProfile(targetUserId: string, viewerUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        division: true,
        highestDivision: true,
        rating: true,
        highestRating: true,
        streak: true,
        career: { select: { id: true, name: true, area: true } },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    const [isFollowing, counts, stats, academicDna, heatmap, ratingGraph] =
      await Promise.all([
        this.isFollowing(viewerUserId, targetUserId),
        this.getFollowCounts(targetUserId),
        this.getPublicStats(targetUserId),
        this.getPublicAcademicDna(targetUserId),
        this.activityService.getHeatmap(targetUserId, 84),
        this.getPublicRatingGraph(targetUserId),
      ]);

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      division: user.division,
      highestDivision: user.highestDivision,
      score: ratingToScore(user.rating),
      highestScore: ratingToScore(user.highestRating),
      streak: user.streak,
      career: user.career,
      isFollowing,
      followersCount: counts.followersCount,
      followingCount: counts.followingCount,
      stats,
      academicDna,
      heatmap,
      ratingGraph,
    };
  }

  // --- Private helpers ---

  private async getPublicStats(userId: string) {
    const activityStats = await this.activityService.getStats(userId);
    return {
      totalQuestionsAnswered: activityStats.totalQuestionsAnswered,
      totalCorrect: activityStats.totalQuestionsCorrect,
      totalNodesCompleted: activityStats.totalNodesCompleted,
      totalSimulacrosCompleted: activityStats.totalSimulacrosCompleted,
    };
  }

  private async getPublicAcademicDna(userId: string) {
    const logs = await this.prisma.answerLog.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        question: {
          select: {
            topic: {
              select: {
                course: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
        examQuestion: {
          select: {
            course: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    const courseStats = new Map<
      string,
      { id: string; name: string; slug: string; total: number; correct: number }
    >();

    for (const log of logs) {
      const course = log.question?.topic?.course ?? log.examQuestion?.course;
      if (!course) continue;
      const axisId = getAxisIdByCourseSlug(course.slug);
      if (!axisId) continue;
      const current = courseStats.get(course.id) ?? {
        id: course.id,
        name: course.name,
        slug: course.slug,
        total: 0,
        correct: 0,
      };
      current.total += 1;
      if (log.isCorrect) current.correct += 1;
      courseStats.set(course.id, current);
    }

    const axisMap = new Map<AcademicAxisId, { total: number; correct: number }>();
    for (const def of ACADEMIC_AXIS_DEFINITIONS) {
      axisMap.set(def.id, { total: 0, correct: 0 });
    }
    for (const course of courseStats.values()) {
      const axisId = getAxisIdByCourseSlug(course.slug);
      if (!axisId) continue;
      const agg = axisMap.get(axisId) ?? { total: 0, correct: 0 };
      agg.total += course.total;
      agg.correct += course.correct;
      axisMap.set(axisId, agg);
    }

    const axes = ACADEMIC_AXIS_DEFINITIONS.map((def) => {
      const agg = axisMap.get(def.id) ?? { total: 0, correct: 0 };
      return {
        id: def.id,
        label: def.label,
        total: agg.total,
        correct: agg.correct,
        accuracy:
          agg.total > 0
            ? Number(((agg.correct / agg.total) * 100).toFixed(1))
            : 0,
        hasData: agg.total > 0,
      };
    });

    return { axes, totalAnswers: logs.length };
  }

  private async getPublicRatingGraph(userId: string) {
    const histories = await this.prisma.ratingHistory.findMany({
      where: { userId, appliedAt: { not: null } },
      orderBy: { appliedAt: 'asc' },
      take: 12,
      include: { season: { select: { weekIndex: true } } },
    });

    return histories.map((h) => ({
      weekIndex: h.season.weekIndex,
      score: ratingToScore(h.newRating),
      rating: h.newRating,
      delta: h.delta,
      division: h.divisionAtTime,
      appliedAt: h.appliedAt?.toISOString() ?? null,
    }));
  }
}
