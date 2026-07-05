import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Core Services
import { TrpcService } from './trpc.service';
import { PrismaService } from './prisma.service';
import { AppRouter } from './app.router';

// Question engine services
import { QuestionGraderService } from './services/question-grader.service';
import { QuestionViewService } from './services/question-view.service';

// Routers (tRPC)
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
import { SimulacroRouter } from './routers/simulacro.router';

// Auth Components (REST & Strategies)
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { GameService } from './services/game.service';

@Module({
  imports: [
    // Configuración Global de JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' }, // El token dura 7 días
    }),
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    // Infraestructura
    TrpcService,
    PrismaService,
    AppRouter,

    // Question engine services
    QuestionGraderService,
    QuestionViewService,

    // Routers tRPC (Inyectables)
    AuthRouter,
    ContentRouter,
    GameRouter,
    StatsRouter,
    RankingRouter,
    GameService,
    AdminRouter,
    ProfileRouter,
    ShopRouter,
    LearningRouter,
    SubscriptionRouter,
    SimulacroRouter,

    // Lógica de Negocio Auth
    AuthService,
    GoogleStrategy,
  ],
})
export class AppModule {}