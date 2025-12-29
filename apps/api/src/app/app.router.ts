import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { PrismaService } from './prisma.service';
import { AuthRouter } from './routers/auth.router';
import { helloSchema } from '@ingresa-pe/domain';

@Injectable()
export class AppRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService,
    private readonly authRouter: AuthRouter
  ) {}

  appRouter = this.trpc.mergeRouters(
    this.trpc.router({
      hello: this.trpc.publicProcedure
        .input(helloSchema)
        .query(async ({ input }) => {
          // Simulación: Generamos un email único basado en el nombre
          const emailSimulado = `${input.name.replace(/\s+/g, '').toLowerCase()}@ingresa.pe`;
          
          // 1. Buscamos si el usuario ya existe en Postgres
          let user = await this.prisma.user.findUnique({
            where: { email: emailSimulado }
          });

          // 2. Si no existe, lo CREAMOS
          if (!user) {
            user = await this.prisma.user.create({
              data: {
                email: emailSimulado,
                name: input.name,
              }
            });
          }

          return {
            message: `Hola ${user.name}, estás registrado en Postgres con ID: ${user.id}`,
            timestamp: Date.now(),
          };
        }),
      healthCheck: this.trpc.publicProcedure.query(() => 'OK'),
    }),
    this.authRouter.router
  );
}

export type AppRouterType = AppRouter['appRouter'];