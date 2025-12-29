import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './trpc.context';
import superjson from 'superjson';

@Injectable()
export class TrpcService {
  t = initTRPC.context<Context>().create({
    transformer: superjson,
  });

  // 1. Procedimiento Público (Cualquiera puede entrar)
  publicProcedure = this.t.procedure;

  // 2. Procedimiento Protegido (Solo usuarios con token)
  protectedProcedure = this.t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ 
        code: 'UNAUTHORIZED', 
        message: 'Debes iniciar sesión para hacer esto 🦖' 
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user, // TypeScript ahora sabe que user NO es null aquí
      },
    });
  });

  router = this.t.router;
  mergeRouters = this.t.mergeRouters;
}