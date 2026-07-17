import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { loginSchema, registerSchema } from '@ingresa-pe/domain';
import { TRPCError } from '@trpc/server';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  router = this.trpc.router({
    
    // --- 1. REGISTRO ---
    register: this.trpc.publicProcedure
      .input(registerSchema)
      .mutation(async ({ input }) => {
        // A. Verificar si ya existe
        const exists = await this.prisma.user.findUnique({
          where: { email: input.email.toLowerCase() }, // Normalizar email
        });
        if (exists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Este correo ya está registrado.',
          });
        }

        // B. Encriptar contraseña (Hashing con salt rounds de 12 para mayor seguridad)
        const hashedPassword = await bcrypt.hash(input.password, 12);

        // C. Crear usuario en DB
        const newUser = await this.prisma.user.create({
          data: {
            email: input.email.toLowerCase(), // Normalizar email
            name: input.name,
            password: hashedPassword,
            role: 'USER', // Por defecto
          },
        });

        // D. Generar Token inmediato para que entre directo
        const token = this.authService.generateToken(newUser);

        return { 
            message: '¡Bienvenido a Ingresa.pe!', 
            token, 
            user: { id: newUser.id, name: newUser.name, email: newUser.email } 
        };
      }),

    // --- 2. LOGIN (Email/Password) ---
    login: this.trpc.publicProcedure
      .input(loginSchema)
      .mutation(async ({ input }) => {
        // A. Buscar usuario (normalizar email)
        const user = await this.prisma.user.findUnique({
          where: { email: input.email.toLowerCase() },
        });

        if (!user || !user.password) {
          // Nota: Si user.password es null es porque se registró con Google y no tiene pass
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Credenciales inválidas',
          });
        }

        // B. Comparar contraseñas
        const isValid = await bcrypt.compare(input.password, user.password);
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Credenciales inválidas',
          });
        }

        // C. Generar Token
        const token = this.authService.generateToken(user);

        return { 
            message: 'Sesión iniciada', 
            token,
            user: { id: user.id, name: user.name, email: user.email }
        };
      }),

    // --- 3. VALIDAR SESIÓN (ME) ---
    // Este endpoint permite al Frontend saber si el token que tiene guardado sigue vivo
    me: this.trpc.protectedProcedure
      .query(async ({ ctx }) => {
        // Si llegamos aquí, el token ya fue validado por el middleware
        const user = await this.prisma.user.findUnique({
          where: { id: ctx.user.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            energy: true
          }
        });
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Usuario no encontrado',
          });
        }
        
        return user;
      }),
  });
}