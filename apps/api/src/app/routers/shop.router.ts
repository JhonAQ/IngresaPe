import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { ShopService } from '../services/shop.service';

@Injectable()
export class ShopRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly shopService: ShopService
  ) {}

  public router = this.trpc.router({
    getCatalog: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      return await this.shopService.getCatalog(ctx.user.userId);
    }),

    buyItem: this.trpc.protectedProcedure
      .input(z.object({ itemKey: z.string(), quantity: z.number().int().min(1).default(1) }))
      .mutation(async ({ ctx, input }) => {
        return await this.shopService.buyItem(ctx.user.userId, input.itemKey, input.quantity);
      }),

    getInventory: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      return await this.shopService.getInventory(ctx.user.userId);
    }),
  });
}
