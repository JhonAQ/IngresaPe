import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { PrismaService } from './prisma.service'; // <--- Importar DB
import { z } from 'zod';
import { helloSchema } from '@ingresa-pe/domain';

@Injectable()
export class AppRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService // <--- Inyectar DB
  ) {}

  appRouter = this.trpc.router({
    hello: this.trpc.procedure
      .input(helloSchema)
      .query(async ({ input }) => { // <--- Convertir a async
        
        // Simulación: Generamos un email único basado en el nombre
        // para que puedas probar con varios nombres
        const emailSimulado = `${input.name.replace(/\s+/g, '').toLowerCase()}@ingresa.pe`;
        
        // 1. Buscamos si el estudiante ya existe en Postgres
        let student = await this.prisma.student.findUnique({
            where: { email: emailSimulado }
        });

        // 2. Si no existe, lo CREAMOS
        if (!student) {
            student = await this.prisma.student.create({
                data: {
                    email: emailSimulado,
                    name: input.name,
                    progress: { xp: 0, level: 1 } // <--- JSONB guardándose
                }
            });
        }

        return {
          message: `Hola ${student.name}, estás registrado en Postgres con ID: ${student.id}`,
          timestamp: Date.now(),
        };
      }),
  });
}

export type AppRouterType = AppRouter['appRouter'];