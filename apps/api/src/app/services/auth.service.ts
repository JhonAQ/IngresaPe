import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // 1. Validar o Crear usuario de Google
  async validateOAuthUser(profile: any) {
    const { email, name, picture, providerId } = profile;

    // A. Buscamos si ya existe
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // B. Si existe, actualizamos su foto y provider si es necesario
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          image: picture, // Actualizamos foto
          provider: 'google',
          providerId: providerId,
        },
      });
    } else {
      // C. Si no existe, lo creamos
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          image: picture,
          provider: 'google',
          providerId,
          // password: null (ya es opcional por defecto)
        },
      });
    }

    return user;
  }

  // 2. Generar el Token JWT (Centralizado)
  generateToken(user: any) {
    const payload = { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });
  }
}