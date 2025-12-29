import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { TrpcService } from './app/trpc.service';
import { AppRouter } from './app/app.router';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './app/trpc.context'; // <--- 1. IMPORTANTE: Importar tu contexto

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors(); 

  const trpcService = app.get(TrpcService);
  const appRouter = app.get(AppRouter);

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter.appRouter,
      createContext: createContext, // <--- 2. CORRECCIÓN: Usar la función importada
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `🔌 tRPC is running on: http://localhost:${port}/trpc`
  );
}

bootstrap();