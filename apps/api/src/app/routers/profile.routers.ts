import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';
import {
  ACADEMIC_AXIS_DEFINITIONS,
  getAxisIdByCourseSlug,
  type AcademicAxisId,
} from '../lib/academic-dna';
import { ActivityService } from '../services/activity.service';
import { ratingToScore } from '../services/rating.service';
import { ShopService } from '../services/shop.service';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  image: z.string().optional(),
});

const selectCareerSchema = z.object({
  careerId: z.string().uuid(),
});

export const ENERGY_MAX = 25;
export const NODE_ENERGY_COST = 5;
export const ENERGY_RECHARGE_MS = 15 * 60 * 1000; // 1 energía cada 15 minutos

function calculateEnergy(
  storedEnergy: number,
  lastRefill: Date | null,
  isPremium: boolean
): number {
  if (isPremium) return ENERGY_MAX;

  const last = lastRefill ? new Date(lastRefill).getTime() : Date.now();
  const elapsed = Date.now() - last;
  const recharges = Math.floor(elapsed / ENERGY_RECHARGE_MS);

  return Math.min(ENERGY_MAX, storedEnergy + recharges);
}

@Injectable()
export class ProfileRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly shopService: ShopService
  ) {}

  public router = this.trpc.router({
    getMe: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const user = await this.prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          provider: true,
          createdAt: true,
          careerId: true,
          career: {
            select: {
              id: true,
              name: true,
              area: true,
              minimumScore: true,
            },
          },
          energy: true,
          coins: true,
          gems: true,
          inventory: true,
          lastRefill: true,
          totalXp: true,
          streak: true,
          lastInteraction: true,
          isPremium: true,
          subExpiresAt: true,
          lastExamScore: true,
          freeSimAttemptsUsed: true,
          freeSimAttemptsResetAt: true,
          rating: true,
          highestRating: true,
          division: true,
          highestDivision: true,
          seasonHighestRating: true,
          seasonBestDivision: true,
        },
      });

      if (!user)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        });

      return {
        ...user,
        energy: calculateEnergy(user.energy, user.lastRefill, user.isPremium),
        score: ratingToScore(user.rating),
        highestScore: ratingToScore(user.highestRating),
      };
    }),

    selectCareer: this.trpc.protectedProcedure
      .input(selectCareerSchema)
      .mutation(async ({ ctx, input }) => {
        const career = await this.prisma.career.findUnique({
          where: { id: input.careerId },
          select: { id: true, name: true, area: true, minimumScore: true },
        });

        if (!career) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Carrera no encontrada',
          });
        }

        const updatedUser = await this.prisma.user.update({
          where: { id: ctx.user.userId },
          data: { careerId: career.id },
          select: {
            id: true,
            careerId: true,
            career: {
              select: {
                id: true,
                name: true,
                area: true,
                minimumScore: true,
              },
            },
          },
        });

        return {
          message: 'Carrera seleccionada correctamente',
          career: updatedUser.career,
        };
      }),

    update: this.trpc.protectedProcedure
      .input(updateProfileSchema)
      .mutation(async ({ ctx, input }) => {
        if (input.image) {
          const isShopItem = !input.image.startsWith('http');

          if (isShopItem) {
            const user = await this.prisma.user.findUnique({
              where: { id: ctx.user.userId },
              select: { inventory: true },
            });

            if (!user || !user.inventory.includes(input.image)) {
              throw new TRPCError({
                code: 'FORBIDDEN',
                message:
                  '⛔ No posees este avatar. Debes comprarlo en la tienda primero.',
              });
            }
          }
        }
        // --- FIN LÓGICA ANTI-TRAMPAS ---

        const updatedUser = await this.prisma.user.update({
          where: { id: ctx.user.userId },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.image && { image: input.image }),
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            coins: true, // Retornamos saldo actualizado
            inventory: true, // Retornamos inventario
          },
        });

        return {
          message: 'Perfil actualizado exitosamente',
          user: updatedUser,
        };
      }),

    getAcademicDNA: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const logs = await this.prisma.answerLog.findMany({
        where: { userId: ctx.user.userId },
        select: {
          isCorrect: true,
          question: {
            select: {
              topic: {
                select: {
                  course: {
                    select: { id: true, name: true, slug: true },
                  },
                },
              },
            },
          },
          examQuestion: {
            select: {
              course: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      });

      const courseStats = new Map<
        string,
        {
          id: string;
          name: string;
          slug: string;
          total: number;
          correct: number;
        }
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

      const MIN_ANSWERS_FOR_INSIGHT = 3;
      const axisMap = new Map<
        AcademicAxisId,
        { total: number; correct: number }
      >();

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
        const axisCourses = Array.from(courseStats.values()).filter(
          (c) => getAxisIdByCourseSlug(c.slug) === def.id
        );

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
          courses: axisCourses.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            total: c.total,
            correct: c.correct,
            accuracy:
              c.total > 0
                ? Number(((c.correct / c.total) * 100).toFixed(1))
                : 0,
          })),
        };
      });

      const eligibleAxes = axes.filter(
        (a) => a.total >= MIN_ANSWERS_FOR_INSIGHT
      );

      let strongAxisId: string | null = null;
      let weakAxisId: string | null = null;

      if (eligibleAxes.length > 0) {
        const sorted = [...eligibleAxes].sort(
          (a, b) => a.accuracy - b.accuracy
        );
        weakAxisId = sorted[0].id;
        strongAxisId = sorted[sorted.length - 1].id;
      }

      return {
        axes,
        strongAxisId,
        weakAxisId,
        totalAnswers: logs.length,
      };
    }),

    spendNodeEnergy: this.trpc.protectedProcedure.mutation(async ({ ctx }) => {
      const user = await this.prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: {
          energy: true,
          lastRefill: true,
          isPremium: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        });
      }

      if (user.isPremium) {
        return { success: true, energy: ENERGY_MAX };
      }

      const currentEnergy = calculateEnergy(
        user.energy,
        user.lastRefill,
        false
      );

      if (currentEnergy < NODE_ENERGY_COST) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Necesitas ${NODE_ENERGY_COST} de energía para iniciar un nodo.`,
        });
      }

      const now = new Date();
      const newEnergy = currentEnergy - NODE_ENERGY_COST;

      await this.prisma.user.update({
        where: { id: ctx.user.userId },
        data: {
          energy: newEnergy,
          lastRefill: now,
          lastInteraction: now,
        },
      });

      return { success: true, energy: newEnergy };
    }),

    getStats: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const user = await this.prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: {
          rating: true,
          highestRating: true,
          division: true,
          highestDivision: true,
        },
      });
      if (!user)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        });

      const activityStats = await this.activityService.getStats(
        ctx.user.userId
      );
      return {
        ...activityStats,
        rating: user.rating,
        score: ratingToScore(user.rating),
        highestRating: user.highestRating,
        highestScore: ratingToScore(user.highestRating),
        division: user.division,
        highestDivision: user.highestDivision,
      };
    }),

    getActivityHeatmap: this.trpc.protectedProcedure
      .input(z.object({ days: z.number().int().min(7).max(365).default(84) }))
      .query(async ({ ctx, input }) => {
        return await this.activityService.getHeatmap(
          ctx.user.userId,
          input.days
        );
      }),

    getWeeklyStreak: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      return await this.activityService.getWeeklyStreak(ctx.user.userId);
    }),

    getRatingGraph: this.trpc.protectedProcedure
      .input(z.object({ weeks: z.number().int().min(2).max(52).default(12) }))
      .query(async ({ ctx, input }) => {
        const histories = await this.prisma.ratingHistory.findMany({
          where: { userId: ctx.user.userId, appliedAt: { not: null } },
          orderBy: { appliedAt: 'asc' },
          take: input.weeks,
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
      }),

    getInventory: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      return await this.shopService.getInventory(ctx.user.userId);
    }),
  });
}
