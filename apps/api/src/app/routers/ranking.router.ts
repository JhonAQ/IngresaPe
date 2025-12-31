import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RankingRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    // 1. Obtener Top 10
    getTopStudents: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const topUsers = await this.prisma.user.findMany({
        take: 10,
        orderBy: { totalXp: 'desc' },
        select: {
          id: true,
          name: true,
          totalXp: true,
        },
      });

      return topUsers.map((user, index) => ({
        ...user,
        rank: index + 1,
        isMe: user.id === ctx.user.userId,
      }));
    }),

    // 2. Mi Posición
    getMyPosition: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: { totalXp: true, name: true },
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
      };
    }),
  });
}