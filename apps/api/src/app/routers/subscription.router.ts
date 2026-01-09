import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';
import { Role, PlanType } from '@prisma/client';

@Injectable()
export class SubscriptionRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    requestSubscription: this.trpc.protectedProcedure
      .input(z.object({
        plan: z.enum(['MONTHLY', 'ANNUAL']),
        proofUrl: z.string().url(),
        amount: z.number().positive(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await this.prisma.subscription.create({
          data: {
            userId: ctx.user.userId,
            plan: input.plan as PlanType,
            amount: input.amount,
            proofUrl: input.proofUrl,
            status: 'PENDING',
          },
        });
      }),

    getPendingRequests: this.trpc.protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== Role.ADMIN) throw new TRPCError({ code: 'FORBIDDEN' });
        
        return await this.prisma.subscription.findMany({
          where: { status: 'PENDING' },
          include: { user: { select: { name: true, email: true } } },
        });
      }),

    processRequest: this.trpc.protectedProcedure
      .input(z.object({
        subscriptionId: z.string(),
        action: z.enum(['APPROVE', 'REJECT']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== Role.ADMIN) throw new TRPCError({ code: 'FORBIDDEN' });

        const sub = await this.prisma.subscription.findUnique({ where: { id: input.subscriptionId } });
        if (!sub) throw new TRPCError({ code: 'NOT_FOUND' });

        if (input.action === 'REJECT') {
          return await this.prisma.subscription.update({
            where: { id: input.subscriptionId },
            data: { status: 'REJECTED' },
          });
        }

        const daysToAdd = sub.plan === 'MONTHLY' ? 30 : 365;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysToAdd);

        return await this.prisma.$transaction([
          this.prisma.subscription.update({
            where: { id: input.subscriptionId },
            data: { status: 'APPROVED' },
          }),
          this.prisma.user.update({
            where: { id: sub.userId },
            data: {
              isPremium: true,
              subExpiresAt: expiryDate,
            },
          }),
        ]);
      }),
  });
}