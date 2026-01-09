import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { TrpcService } from './app/trpc.service';
import { AppRouter } from './app/app.router';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './app/trpc.context';
// 👇 Importamos Request/Response para los tipos del Spyware
import { json, urlencoded, Request, Response, NextFunction } from 'express'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // ---------------------------------------------------------
  // 1. CONFIGURACIÓN DE PARSERS (Los "Oídos" del servidor)
  // ---------------------------------------------------------
  // Esto DEBE ir antes de cualquier ruta o middleware
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // ---------------------------------------------------------
  // 2. CÁMARA ESPÍA (Spyware de Diagnóstico)
  // ---------------------------------------------------------
  // Esto intercepta la llamada justo después de ser parseada
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Solo espiamos las llamadas a tRPC para no llenar la consola de basura
    if (req.path.includes('/trpc')) {
      console.log('\n🔎 ---------------- [SPY START] ---------------- 🔎');
      console.log(`📡 URL: ${req.method} ${req.path}`);
      console.log(`🏷️  Content-Type: ${req.headers['content-type']}`);
      
      // Aquí está la verdad: ¿Llegó el body o está vacío?
      if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 BODY RECIBIDO:', JSON.stringify(req.body, null, 2));
      } else {
        console.log('⚠️  BODY VACÍO O UNDEFINED (Aquí está el error)');
        console.log('   Valor crudo de req.body:', req.body);
      }
      console.log('🔎 ---------------- [SPY END] ------------------ 🔎\n');
    }
    next();
  });

  // ---------------------------------------------------------
  // 3. CONFIGURACIÓN DE CORS
  // ---------------------------------------------------------
  app.enableCors();

  // ---------------------------------------------------------
  // 4. CONFIGURACIÓN DE TRPC
  // ---------------------------------------------------------
  const trpcService = app.get(TrpcService);
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