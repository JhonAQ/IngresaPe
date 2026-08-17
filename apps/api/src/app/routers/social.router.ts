import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { SocialService } from '../services/social.service';

@Injectable()
export class SocialRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly socialService: SocialService
  ) {}

  public router = this.trpc.router({
    searchUsers: this.trpc.protectedProcedure
      .input(
        z.object({
          query: z.string().min(2).max(100),
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(50).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        return await this.socialService.searchUsers(
          input.query,
          ctx.user.userId,
          input.page,
          input.pageSize
        );
      }),

    follow: this.trpc.protectedProcedure
      .input(z.object({ userId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        return await this.socialService.followUser(
          ctx.user.userId,
          input.userId
        );
      }),

    unfollow: this.trpc.protectedProcedure
      .input(z.object({ userId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        return await this.socialService.unfollowUser(
          ctx.user.userId,
          input.userId
        );
      }),

    getFollowers: this.trpc.protectedProcedure
      .input(
        z.object({
          userId: z.string().uuid(),
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(50).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        return await this.socialService.getFollowers(
          input.userId,
          ctx.user.userId,
          input.page,
          input.pageSize
        );
      }),

    getFollowing: this.trpc.protectedProcedure
      .input(
        z.object({
          userId: z.string().uuid(),
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(50).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        return await this.socialService.getFollowing(
          input.userId,
          ctx.user.userId,
          input.page,
          input.pageSize
        );
      }),

    getFollowCounts: this.trpc.protectedProcedure
      .input(z.object({ userId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return await this.socialService.getFollowCounts(input.userId);
      }),

    getUserPreview: this.trpc.protectedProcedure
      .input(z.object({ userId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return await this.socialService.getUserPreview(
          input.userId,
          ctx.user.userId
        );
      }),

    getPublicProfile: this.trpc.protectedProcedure
      .input(z.object({ userId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return await this.socialService.getPublicProfile(
          input.userId,
          ctx.user.userId
        );
      }),
  });
}
