import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './trpc.context';
import superjson from 'superjson';

interface RateLimitOptions {
  max: number;
  windowMs: number;
  keyPrefix?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class TrpcService {
  t = initTRPC.context<Context>().create({
    transformer: superjson,
  });

  // Store compartido para rate limiting en memoria (suficiente para un solo servidor).
  private readonly rateLimitStore = new Map<string, RateLimitEntry>();

  // 1. Procedimiento Público (Cualquiera puede entrar)
  publicProcedure = this.t.procedure;

  // 2. Procedimiento Protegido (Solo usuarios con token)
  protectedProcedure = this.t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Debes iniciar sesión para hacer esto 🦖',
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user, // TypeScript ahora sabe que user NO es null aquí
      },
    });
  });

  // 3. Rate limit middleware reusable para procedimientos críticos
  createRateLimitMiddleware(options: RateLimitOptions) {
    const { max, windowMs, keyPrefix = 'rl' } = options;

    return this.t.middleware(async ({ ctx, next }) => {
      const req = ctx.req as
        | (Context['req'] & { socket?: { remoteAddress?: string } })
        | undefined;
      const ip =
        (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req?.socket?.remoteAddress ||
        'unknown';
      const userId = ctx.user?.userId;
      const key = userId ? `${keyPrefix}:user:${userId}` : `${keyPrefix}:ip:${ip}`;

      const now = Date.now();
      const entry = this.rateLimitStore.get(key);

      if (!entry || now > entry.resetAt) {
        this.rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      } else {
        entry.count += 1;
        if (entry.count > max) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Demasiadas peticiones. Inténtalo de nuevo en unos momentos.',
          });
        }
      }

      return next();
    });
  }

  router = this.t.router;
  mergeRouters = this.t.mergeRouters;
}
