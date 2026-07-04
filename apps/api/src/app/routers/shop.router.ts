import { Injectable } from '@nestjs/common';
import { z } from 'zod/v3';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';

const SHOP_ITEMS = [
  { id: 'avatar_male_1', name: 'Estudiante Cool', price: 200, type: 'AVATAR', category: 'MALE' },
  { id: 'avatar_male_2', name: 'Hacker', price: 500, type: 'AVATAR', category: 'MALE' },
  { id: 'avatar_male_3', name: 'Cachimbo Legendario', price: 1000, type: 'AVATAR', category: 'MALE' },
  { id: 'avatar_female_1', name: 'Estudiante Aplicada', price: 200, type: 'AVATAR', category: 'FEMALE' },
  { id: 'avatar_female_2', name: 'Ingeniera', price: 500, type: 'AVATAR', category: 'FEMALE' },
  { id: 'avatar_female_3', name: 'Genio', price: 1000, type: 'AVATAR', category: 'FEMALE' },
  { id: 'energy_pack_5', name: 'Pack de Energía (+5)', price: 100, type: 'CONSUMABLE', category: 'ENERGY' },
];

@Injectable()
export class ShopRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    getCatalog: this.trpc.protectedProcedure.query(() => {
      return SHOP_ITEMS;
    }),

    buyItem: this.trpc.protectedProcedure
      .input(z.object({ itemId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const item = SHOP_ITEMS.find((i) => i.id === input.itemId);
        if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: 'El item no existe' });

        const user = await this.prisma.user.findUnique({
          where: { id: ctx.user.userId },
          select: { coins: true, inventory: true, energy: true },
        });

        if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

        if (item.type === 'AVATAR' && user.inventory.includes(item.id)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: '¡Ya tienes este avatar!' });
        }

        if (user.coins < item.price) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Te faltan ${item.price - user.coins} monedas` });
        }

        const updateData: {
          coins: { decrement: number };
          inventory?: { push: string };
          energy?: { increment: number };
        } = {
          coins: { decrement: item.price },
        };

        if (item.type === 'AVATAR') {
          updateData.inventory = { push: item.id };
        } else if (item.type === 'CONSUMABLE') {
          if (item.id === 'energy_pack_5') {
            updateData.energy = { increment: 5 };
          }
        }

        const updatedUser = await this.prisma.user.update({
          where: { id: ctx.user.userId },
          data: updateData,
          select: { coins: true, inventory: true, energy: true }, // Devolvemos el nuevo estado
        });

        return {
          success: true,
          message: `¡Compraste ${item.name}!`,
          user: updatedUser, // El frontend usará esto para actualizar la UI al instante
        };
      }),
  });
}