import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TrpcService } from './trpc.service';
import { AppRouter } from './app.router';
import { PrismaService } from './prisma.service';
import { AuthRouter } from './routers/auth.router';

@Module({
  imports: [
    // Configuración Global de JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' }, // El token dura 7 días
    }),
  ],
  controllers: [],
  providers: [
    TrpcService,
    PrismaService,
    AppRouter,
    AuthRouter,
  ],
})
export class AppModule {}