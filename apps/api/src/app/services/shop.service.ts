import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';

export interface ShopItemDto {
  key: string;
  name: string;
  description: string;
  priceGems: number;
  maxQuantity: number | null;
  owned: number;
}

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalog(userId: string): Promise<ShopItemDto[]> {
    const items = await this.prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { priceGems: 'asc' },
    });

    const userItems = await this.prisma.userItem.findMany({
      where: { userId },
    });
    const ownedByKey = new Map(userItems.map((i) => [i.itemKey, i.quantity]));

    return items.map((item) => ({
      key: item.key,
      name: item.name,
      description: item.description,
      priceGems: item.priceGems,
      maxQuantity: item.maxQuantity,
      owned: ownedByKey.get(item.key) ?? 0,
    }));
  }

  async buyItem(
    userId: string,
    itemKey: string,
    quantity = 1
  ): Promise<{ remainingGems: number; owned: number }> {
    return await this.prisma.$transaction(async (tx) => {
      const item = await tx.shopItem.findUnique({ where: { key: itemKey } });
      if (!item || !item.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Protector no encontrado',
        });
      }

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuario no encontrado',
        });
      }

      const totalPrice = item.priceGems * quantity;
      if (user.gems < totalPrice) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No tienes suficientes gemas',
        });
      }

      const existing = await tx.userItem.findUnique({
        where: { userId_itemKey: { userId, itemKey } },
      });
      const currentOwned = existing?.quantity ?? 0;

      if (
        item.maxQuantity != null &&
        currentOwned + quantity > item.maxQuantity
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Límite de ${item.maxQuantity} unidades por usuario`,
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: { gems: { decrement: totalPrice } },
      });

      await tx.userItem.upsert({
        where: { userId_itemKey: { userId, itemKey } },
        update: { quantity: { increment: quantity } },
        create: { userId, itemKey, quantity },
      });

      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: { gems: true },
      });
      const updatedItem = await tx.userItem.findUnique({
        where: { userId_itemKey: { userId, itemKey } },
        select: { quantity: true },
      });

      return {
        remainingGems: updatedUser?.gems ?? 0,
        owned: updatedItem?.quantity ?? 0,
      };
    });
  }

  async getInventory(userId: string) {
    return await this.prisma.userItem.findMany({
      where: { userId, quantity: { gt: 0 } },
      include: { user: false },
      orderBy: { itemKey: 'asc' },
    });
  }

  /**
   * Semilla inicial de protectores. Se puede llamar desde una migración o seed.
   */
  async seedItems(): Promise<void> {
    const items = [
      {
        key: 'RATING_SHIELD_50',
        name: 'Escudo de Rating',
        description:
          'Absorbe el 50% de la bajada de rating en tu próximo simulacro oficial.',
        priceGems: 100,
        maxQuantity: 3,
      },
      {
        key: 'RATING_FREEZE',
        name: 'Congelador de Rating',
        description:
          'Evita que bajes de rating en tu próximo simulacro oficial.',
        priceGems: 250,
        maxQuantity: 1,
      },
      {
        key: 'RATING_BOOSTER',
        name: 'Potenciador de Rating',
        description: 'Aumenta en 50% la subida de rating si rindes bien.',
        priceGems: 150,
        maxQuantity: 2,
      },
    ];

    for (const item of items) {
      await this.prisma.shopItem.upsert({
        where: { key: item.key },
        update: item,
        create: item,
      });
    }
  }
}
