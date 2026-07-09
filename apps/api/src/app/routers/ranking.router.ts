import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { z } from 'zod';

const areaSchema = z.enum(['INGENIERIAS', 'SOCIALES', 'BIOMEDICAS']);

@Injectable()
export class RankingRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    // Top 10 global (usado como proxy semanal mientras no hay weeklyXp)
    getTopStudents: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const topUsers = await this.prisma.user.findMany({
        take: 10,
        orderBy: { totalXp: 'desc' },
        select: {
          id: true,
          name: true,
          image: true,
          totalXp: true,
          career: {
            select: {
              id: true,
              name: true,
              area: true,
            },
          },
        },
      });

      return topUsers.map((user, index) => ({
        ...user,
        rank: index + 1,
        isMe: user.id === ctx.user.userId,
      }));
    }),

    // Mi posición global
    getMyPosition: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: {
          totalXp: true,
          name: true,
          image: true,
          career: {
            select: {
              id: true,
              name: true,
              area: true,
            },
          },
        },
      });

      if (!currentUser) {
        throw new Error('Usuario no encontrado');
      }

      const usersWithMoreXp = await this.prisma.user.count({
        where: { totalXp: { gt: currentUser.totalXp } },
      });

      return {
        rank: usersWithMoreXp + 1,
        xp: currentUser.totalXp,
        name: currentUser.name,
        image: currentUser.image,
        career: currentUser.career,
      };
    }),

    // Ranking por área
    getAreaLeaderboard: this.trpc.protectedProcedure
      .input(z.object({ area: areaSchema }))
      .query(async ({ ctx, input }) => {
        const topUsers = await this.prisma.user.findMany({
          where: {
            career: {
              area: input.area,
            },
          },
          take: 10,
          orderBy: { totalXp: 'desc' },
          select: {
            id: true,
            name: true,
            image: true,
            totalXp: true,
            career: {
              select: {
                id: true,
                name: true,
                area: true,
              },
            },
          },
        });

        return topUsers.map((user, index) => ({
          ...user,
          rank: index + 1,
          isMe: user.id === ctx.user.userId,
        }));
      }),

    // Ranking por carrera
    getCareerLeaderboard: this.trpc.protectedProcedure
      .input(z.object({ careerId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const topUsers = await this.prisma.user.findMany({
          where: { careerId: input.careerId },
          take: 10,
          orderBy: { totalXp: 'desc' },
          select: {
            id: true,
            name: true,
            image: true,
            totalXp: true,
            career: {
              select: {
                id: true,
                name: true,
                area: true,
              },
            },
          },
        });

        return topUsers.map((user, index) => ({
          ...user,
          rank: index + 1,
          isMe: user.id === ctx.user.userId,
        }));
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
