import { Injectable } from '@nestjs/common';
import { Prisma, ShopItemCategory } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';

export interface ShopItemDto {
  key: string;
  name: string;
  description: string;
  priceGems: number;
  maxQuantity: number | null;
  category: ShopItemCategory;
  effectData: Record<string, unknown> | null;
  owned: number;
}

const ENERGY_REFILL_DAILY_LIMIT = 3;
const GEM_BOOST_KEY = 'GEM_BOOST_30MIN';

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
      category: item.category,
      effectData: (item.effectData as Record<string, unknown> | null) ?? null,
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
          message: 'Item no encontrado',
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

      // Aplicar efecto inmediato de recarga de energía al comprar
      if (item.category === 'CONSUMABLE' && item.key === 'ENERGY_REFILL_25') {
        await this.applyEnergyRefill(tx, userId, quantity);
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

  async useItem(
    userId: string,
    itemKey: string
  ): Promise<{ success: boolean; message: string }> {
    const item = await this.prisma.shopItem.findUnique({
      where: { key: itemKey },
    });
    if (!item || !item.isActive) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Item no encontrado',
      });
    }

    const userItem = await this.prisma.userItem.findUnique({
      where: { userId_itemKey: { userId, itemKey } },
    });
    if (!userItem || userItem.quantity <= 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No tienes este item',
      });
    }

    switch (item.category) {
      case 'CONSUMABLE': {
        if (item.key === 'ENERGY_REFILL_25') {
          await this.applyEnergyRefill(this.prisma, userId, 1);
          return { success: true, message: 'Energía recargada' };
        }
        if (item.key === 'STREAK_FREEZE_1D') {
          return {
            success: true,
            message: 'Se activará automáticamente si no practicas un día',
          };
        }
        break;
      }
      case 'BOOST': {
        if (item.key === GEM_BOOST_KEY) {
          await this.applyGemBoost(userId);
          return {
            success: true,
            message: 'Potenciador de gemas x2 activado por 30 minutos',
          };
        }
        break;
      }
      case 'RATING': {
        return {
          success: true,
          message: 'Se usará automáticamente en tu próximo simulacro oficial',
        };
      }
      case 'COSMETIC': {
        return {
          success: true,
          message: 'Item cosmético listo para equipar en tu perfil',
        };
      }
    }

    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Este item no se puede usar manualmente',
    });
  }

  private async applyEnergyRefill(
    tx: Prisma.TransactionClient,
    userId: string,
    quantity: number
  ) {
    const date = this.toDate(new Date());
    const log = await tx.activityLog.upsert({
      where: { userId_date: { userId, date } },
      update: {},
      create: { userId, date },
    });

    if (log.energyRefillsUsed + quantity > ENERGY_REFILL_DAILY_LIMIT) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Solo puedes recargar energía ${ENERGY_REFILL_DAILY_LIMIT} veces por día`,
      });
    }

    await tx.activityLog.update({
      where: { id: log.id },
      data: { energyRefillsUsed: { increment: quantity } },
    });

    await tx.user.update({
      where: { id: userId },
      data: { energy: { increment: 25 * quantity } },
    });
  }

  private async applyGemBoost(userId: string) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.userItem.findUnique({
        where: { userId_itemKey: { userId, itemKey: GEM_BOOST_KEY } },
      });

      if (!existing || existing.quantity <= 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No tienes potenciadores de gemas',
        });
      }

      // Si ya hay uno activo, extender desde su expiración actual.
      const newExpiresAt =
        existing.expiresAt && existing.expiresAt > now
          ? new Date(existing.expiresAt.getTime() + 30 * 60 * 1000)
          : expiresAt;

      await tx.userItem.update({
        where: { id: existing.id },
        data: {
          quantity: { decrement: 1 },
          expiresAt: newExpiresAt,
        },
      });
    });
  }

  async getInventory(userId: string) {
    return await this.prisma.userItem.findMany({
      where: { userId, quantity: { gt: 0 } },
      orderBy: { itemKey: 'asc' },
    });
  }

  /**
   * Semilla inicial de la tienda. Se puede llamar desde una migración o seed.
   */
  async seedItems(): Promise<void> {
    const items = [
      {
        key: 'STREAK_FREEZE_1D',
        name: 'Protector de racha (1 día)',
        description:
          'Salta un día sin práctica para mantener tu racha de días consecutivos.',
        priceGems: 60,
        maxQuantity: 5,
        category: ShopItemCategory.CONSUMABLE,
        effectData: { days: 1 },
      },
      {
        key: 'ENERGY_REFILL_25',
        name: 'Recarga de energía',
        description: 'Restaura 25 puntos de energía al instante.',
        priceGems: 40,
        maxQuantity: null,
        category: ShopItemCategory.CONSUMABLE,
        effectData: { energy: 25 },
      },
      {
        key: GEM_BOOST_KEY,
        name: 'Potenciador de gemas x2',
        description: 'Duplica las gemas que ganes durante 30 minutos.',
        priceGems: 100,
        maxQuantity: 2,
        category: ShopItemCategory.BOOST,
        effectData: { multiplier: 2, durationMinutes: 30 },
      },
      {
        key: 'RATING_SHIELD_50',
        name: 'Escudo de Rating',
        description:
          'Absorbe el 50% de la bajada de rating en tu próximo simulacro oficial.',
        priceGems: 100,
        maxQuantity: 3,
        category: ShopItemCategory.RATING,
        effectData: { reduceLossPercent: 50 },
      },
      {
        key: 'RATING_FREEZE',
        name: 'Congelador de Rating',
        description:
          'Evita que bajes de rating en tu próximo simulacro oficial.',
        priceGems: 250,
        maxQuantity: 1,
        category: ShopItemCategory.RATING,
        effectData: { freezeLoss: true },
      },
      {
        key: 'RATING_BOOSTER',
        name: 'Potenciador de Rating',
        description: 'Aumenta en 50% la subida de rating si rindes bien.',
        priceGems: 150,
        maxQuantity: 2,
        category: ShopItemCategory.RATING,
        effectData: { boostGainPercent: 50 },
      },
      {
        key: 'FRAME_GOLD',
        name: 'Marco dorado',
        description: 'Marco exclusivo dorado para tu avatar.',
        priceGems: 200,
        maxQuantity: 1,
        category: ShopItemCategory.COSMETIC,
        effectData: { type: 'frame' },
      },
      {
        key: 'FRAME_CACHIMBO',
        name: 'Marco Cachimbo',
        description: 'Marco especial para los más competitivos.',
        priceGems: 500,
        maxQuantity: 1,
        category: ShopItemCategory.COSMETIC,
        effectData: { type: 'frame' },
      },
      {
        key: 'THEME_DARK',
        name: 'Tema oscuro',
        description: 'Desbloquea el tema oscuro de la app.',
        priceGems: 150,
        maxQuantity: 1,
        category: ShopItemCategory.COSMETIC,
        effectData: { type: 'theme' },
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

  private toDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  }
}
