import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import { TRPCError } from '@trpc/server';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  image: z.string().optional(),
});

@Injectable()
export class ProfileRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService
  ) {}

  public router = this.trpc.router({
    // 1. OBTENER MI PERFIL
    getMe: this.trpc.protectedProcedure.query(async ({ ctx }) => {
      const user = await this.prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          provider: true,
          createdAt: true,
          careerId: true,
          career: {
            select: {
              id: true,
              name: true,
              area: true,
            },
          },
          energy: true,
          coins: true,      // 👈 Agregado: para que el front sepa cuánto dinero tiene
          inventory: true,  // 👈 Agregado: para saber qué items tiene
          lastRefill: true,
          totalXp: true,
          streak: true,
          lastInteraction: true,
          isPremium: true,
          subExpiresAt: true,
        },
      });
      
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' });
      return user;
    }),

    // 2. ACTUALIZAR DATOS (Con protección de Inventario)
    update: this.trpc.protectedProcedure
      .input(updateProfileSchema)
      .mutation(async ({ ctx, input }) => {
        
        // --- 🛡️ INICIO LÓGICA ANTI-TRAMPAS ---
        if (input.image) {
          // Si la imagen NO empieza con http/https, asumimos que es un ID de la tienda (ej: 'avatar_male_1')
          // Si es una URL (ej: google user content), la dejamos pasar.
          const isShopItem = !input.image.startsWith('http');

          if (isShopItem) {
            // Buscamos si el usuario tiene ese item en su inventario
            const user = await this.prisma.user.findUnique({
              where: { id: ctx.user.userId },
              select: { inventory: true },
            });

            // Si el usuario no existe O el item no está en su array de inventario
            if (!user || !user.inventory.includes(input.image)) {
              throw new TRPCError({ 
                code: 'FORBIDDEN', 
                message: '⛔ No posees este avatar. Debes comprarlo en la tienda primero.' 
              });
            }
          }
        }
        // --- FIN LÓGICA ANTI-TRAMPAS ---

        const updatedUser = await this.prisma.user.update({
          where: { id: ctx.user.userId },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.image && { image: input.image }),
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            coins: true,     // Retornamos saldo actualizado
            inventory: true, // Retornamos inventario
          },
        });
        
        return {
          message: 'Perfil actualizado exitosamente',
          user: updatedUser,
        };
      }),
  });
}