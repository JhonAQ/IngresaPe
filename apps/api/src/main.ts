import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppRouter } from './app/app.router';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './app/trpc.context';
import { json, urlencoded, Request, Response, NextFunction } from 'express'; 
import * as dotenv from 'dotenv';
dotenv.config({ override: true }); // Ignora las variables globales del sistema si cruzan

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.includes('/trpc')) {
      console.log('\n🔎 [SPY] ${req.method} ${req.path}');
      console.log(`Content-Type: ${req.headers['content-type']}`);
      
      if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
      } else {
        console.log('⚠️  Body vacío:', req.body);
      }
    }
    next();
  });

  app.enableCors();

  const appRouter = app.get(AppRouter);

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter.appRouter,
      createContext: createContext,
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