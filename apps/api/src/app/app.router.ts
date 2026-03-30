import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AuthRouter } from './routers/auth.router';
import { ContentRouter } from './routers/content.router';
import { GameRouter } from './routers/game.router';
import { StatsRouter } from './routers/stats.routers';
import { RankingRouter } from './routers/ranking.router';
import { AdminRouter } from './routers/admin.router';
import { ProfileRouter } from './routers/profile.routers';
import { ShopRouter } from './routers/shop.router';
import { LearningRouter } from './routers/learning.router';
import { SubscriptionRouter } from './routers/subscription.router';

@Injectable()
export class AppRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly auth: AuthRouter,
    private readonly content: ContentRouter,
    private readonly game: GameRouter,
    private readonly stats: StatsRouter,
    private readonly ranking: RankingRouter,
    private readonly admin: AdminRouter,
    private readonly profile: ProfileRouter,
    private readonly shop: ShopRouter,
    private readonly learning: LearningRouter,
    private readonly subscription: SubscriptionRouter
  ) {}

  appRouter = this.trpc.router({
    // 1. Health Check (Para saber si el server vive)
    healthCheck: this.trpc.publicProcedure.query(() => 'OK'),

    // Ruta de prueba "hello" solicitada por el cliente
    hello: this.trpc.router({
      getQuestions: this.trpc.publicProcedure.query(() => {
        return {
          message: '¡Petición exitosa desde el Backend (tRPC)!',
          timestamp: new Date().toISOString(),
        };
      }),
    }),

    // 2. Módulos del Sistema (Namespaced)
    auth: this.auth.router,       // Acceso: client.auth.login
    content: this.content.router, // Acceso: client.content.getQuestions
    game: this.game.router,       // Acceso: client.game.submitAnswer
    stats: this.stats.router,     // Acceso: client.stats.getDashboard
    ranking: this.ranking.router, // Acceso: client.ranking.getTopStudents
    admin: this.admin.router,     // Acceso: client.admin.createQuestion
    profile: this.profile.router, // Acceso: client.profile.getMe
    shop: this.shop.router,       // Acceso: client.shop.getCatalog
    learning: this.learning.router, // Acceso: client.learning.getRandomQuestion
    subscription: this.subscription.router, // Acceso: client.subscription.requestSubscription
  });
}

export type AppRouterType = AppRouter['appRouter'];