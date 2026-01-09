import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Core Services
import { TrpcService } from './trpc.service';
import { PrismaService } from './prisma.service';
import { AppRouter } from './app.router';

// Routers (tRPC)
import { AuthRouter } from './routers/auth.router';
import { ContentRouter } from './routers/content.router';
import { GameRouter } from './routers/game.router';
import { StatsRouter } from './routers/stats.routers';
import { RankingRouter } from './routers/ranking.router';

// Auth Components (REST & Strategies)
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { GameService } from './services/game.service';
import { AdminRouter } from './routers/admin.router';
import { ProfileRouter } from './routers/profile.routers';

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
    
    // Routers tRPC (Inyectables)
    AuthRouter,
    ContentRouter,
    GameRouter,
    StatsRouter,
    RankingRouter,
    GameService,
    AdminRouter,
    ProfileRouter,

    // Lógica de Negocio Auth
    AuthService,
    GoogleStrategy,
  ],
})
export class AppModule {}