// Cargar y validar variables de entorno antes que cualquier módulo de NestJS.
import './app/config/env';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app/app.module';
import { AppRouter } from './app/app.router';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './app/trpc.context';
import { json, urlencoded, Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  PORT,
  CORS_ORIGINS,
  RATE_LIMIT_TTL_MS,
  RATE_LIMIT_MAX,
} from './app/config/env';

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

  // CORS restringido a orígenes conocidos.
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow origin: ${origin}`), false);
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  } as CorsOptions);

  // Rate limiting global por IP para todas las rutas (REST + tRPC).
  app.use(
    rateLimit({
      windowMs: RATE_LIMIT_TTL_MS,
      max: RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: 'Too many requests, please try again later.',
      },
      // Trust proxy si el API corre detrás de un load balancer/proxy.
      skip: (req) => req.method === 'OPTIONS',
    })
  );

  const appRouter = app.get(AppRouter);

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter.appRouter,
      createContext: createContext,
    })
  );

  const port = PORT;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `🔌 tRPC is running on: http://localhost:${port}/trpc`
  );
  Logger.log(
    process.env.GOOGLE_CLIENT_ID
      ? `🔑 Google OAuth: configurado (client ...${process.env.GOOGLE_CLIENT_ID.slice(-12)})`
      : '⚠️  Google OAuth: GOOGLE_CLIENT_ID no encontrado. Revisa apps/api/.env'
  );
}

bootstrap();