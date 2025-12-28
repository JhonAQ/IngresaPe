import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AppRouter } from './app.router';
import { PrismaService } from './prisma.service'; // <--- 1. Importar

@Module({
  imports: [],
  controllers: [],
  providers: [
    TrpcService, 
    AppRouter, 
    PrismaService // <--- 2. Agregar a la lista de providers
  ],
})
export class AppModule {}