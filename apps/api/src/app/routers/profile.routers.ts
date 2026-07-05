import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';

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
    private readonly prisma: PrismaService
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
        },
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' });

      return {
        ...user,
        energy: calculateEnergy(user.energy, user.lastRefill, user.isPremium),
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
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Carrera no encontrada' });
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
                message: '⛔ No posees este avatar. Debes comprarlo en la tienda primero.'
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
            coins: true,     // Retornamos saldo actualizado
            inventory: true, // Retornamos inventario
          },
        });

        return {
          message: 'Perfil actualizado exitosamente',
          user: updatedUser,
        };
      }),

    spendNodeEnergy: this.trpc.protectedProcedure
      .mutation(async ({ ctx }) => {
        const user = await this.prisma.user.findUnique({
          where: { id: ctx.user.userId },
          select: {
            energy: true,
            lastRefill: true,
            isPremium: true,
          },
        });

        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' });
        }

        if (user.isPremium) {
          return { success: true, energy: ENERGY_MAX };
        }

        const currentEnergy = calculateEnergy(user.energy, user.lastRefill, false);

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
  });
}
