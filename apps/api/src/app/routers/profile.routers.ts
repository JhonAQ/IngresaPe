import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  image: z.string().optional(), // 👈 Adaptado: Tu esquema usa "image"
});

@Injectable()
export class ProfileRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    // 1. OBTENER MI PERFIL
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
            },
          },
          energy: true,
          lastRefill: true,
          totalXp: true,
          streak: true,
          lastInteraction: true,
          isPremium: true,
          subExpiresAt: true,
        },
      });
      
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' });
      return user;
    }),

    // 2. ACTUALIZAR DATOS
    update: this.trpc.protectedProcedure
      .input(updateProfileSchema)
      .mutation(async ({ ctx, input }) => {
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
          },
        });
        
        return {
          message: 'Perfil actualizado exitosamente',
          user: updatedUser,
        };
      }),
  });
}