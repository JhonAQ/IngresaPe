import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

@Controller('auth') // Ruta base: /api/auth
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. El usuario hace clic aquí para iniciar el viaje
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {
    // Guarda inicia el flujo automáticamente
  }

  // 2. Google nos devuelve al usuario aquí
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // Si llegamos aquí, el usuario ya fue validado por la Strategy
    const user = (req as any).user;

    // Generamos el Token
    const token = this.authService.generateToken(user);

    // Redirigimos al frontend a la página de callback para que almacene el token.
    // FRONTEND_URL permite usar el mismo dominio incluso en dispositivos de la red local.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    res.redirect(`${frontendUrl}/auth-callback?token=${token}`);
  }
}