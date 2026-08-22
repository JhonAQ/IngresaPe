// Cargar y validar variables de entorno antes que cualquier provider lea process.env.
import './config/env';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JWT_SECRET } from './config/env';

// Core Services
import { TrpcService } from './trpc.service';
import { PrismaService } from './prisma.service';
import { AppRouter } from './app.router';

// Redis
import { RedisModule } from './redis/redis.module';

// Question engine services
import { QuestionGraderService } from './services/question-grader.service';
import { QuestionViewService } from './services/question-view.service';
import { WeakTopicAnalyzerService } from './services/weak-topic-analyzer.service';
import { RatingService } from './services/rating.service';
import { SeasonService } from './services/season.service';
import { LeaderboardService } from './services/leaderboard.service';
import { ActivityService } from './services/activity.service';
import { ShopService } from './services/shop.service';
import { SocialService } from './services/social.service';

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
import { SocialRouter } from './routers/social.router';

// Auth Components (REST & Strategies)
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OAuthCodeService } from './services/oauth-code.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { GameService } from './services/game.service';
import { RankingCronService } from './ranking-cron.service';

@Module({
  imports: [
    // Configuración Global de JWT
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '7d' }, // El token dura 7 días
    }),
    // Rate limiting para controladores REST
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    // Redis para códigos OAuth temporales y caché futura
    RedisModule,
    // Tareas programadas
    ScheduleModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [
    // Rate limiting guard global para controladores REST
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Infraestructura
    TrpcService,
    PrismaService,
    AppRouter,

    // Question engine services
    QuestionGraderService,
    QuestionViewService,
    WeakTopicAnalyzerService,

    // Ranking competitivo
    RatingService,
    SeasonService,
    LeaderboardService,
    ActivityService,
    ShopService,
    SocialService,
    RankingCronService,

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
    SocialRouter,

    // Lógica de Negocio Auth
    AuthService,
    OAuthCodeService,
    GoogleStrategy,
  ],
})
export class AppModule {}
