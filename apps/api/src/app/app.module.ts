import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TrpcService } from './trpc.service';
import { AppRouter } from './app.router';
import { PrismaService } from './prisma.service';
import { AuthRouter } from './routers/auth.router';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleStrategy } from './strategies/google.strategy';

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
    TrpcService,
    PrismaService,
    AppRouter,
    AuthRouter,
    AuthService,
    GoogleStrategy,
  ],
})
export class AppModule {}