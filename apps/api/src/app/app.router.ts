import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AuthRouter } from './routers/auth.router';
import { ContentRouter } from './routers/content.router';
import { GameRouter } from './routers/game.router'; 

@Injectable()
export class AppRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly auth: AuthRouter,
    private readonly content: ContentRouter,
    private readonly game: GameRouter 
  ) {}

  appRouter = this.trpc.router({
    // 1. Health Check (Para saber si el server vive)
    healthCheck: this.trpc.publicProcedure.query(() => 'OK'),

    // 2. Módulos del Sistema (Namespaced)
    auth: this.auth.router,       // Acceso: client.auth.login
    content: this.content.router, // Acceso: client.content.getQuestions
    game: this.game.router,    // Acceso: client.game.submitAnswer
  });
}

export type AppRouterType = AppRouter['appRouter'];