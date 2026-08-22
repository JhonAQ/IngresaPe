import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { OAuthCodeService } from '../services/oauth-code.service';
import { FRONTEND_URL } from '../config/env';

interface OAuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

const exchangeCodeSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
});

@Controller('auth') // Ruta base: /api/auth
export class AuthController {
  constructor(
    private authService: AuthService,
    private oauthCodeService: OAuthCodeService
  ) {}

  // 1. El usuario hace clic aquí para iniciar el viaje
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guarda inicia el flujo automáticamente
  }

  // 2. Google nos devuelve al usuario aquí
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // Si llegamos aquí, el usuario ya fue validado por la Strategy
    const user = (req as unknown as { user: OAuthUser }).user;

    // Generamos un código de intercambio corta duración en lugar de exponer el JWT en la URL.
    const code = await this.oauthCodeService.createCode(user.id);

    const frontendUrl = FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth-callback?code=${encodeURIComponent(code)}`);
  }

  // 3. El frontend canjea el código por el JWT real
  @Post('exchange')
  async exchangeCode(@Body() body: unknown, @Res() res: Response) {
    const parse = exchangeCodeSchema.safeParse(body);
    if (!parse.success) {
      throw new UnauthorizedException('Código inválido');
    }

    const { code } = parse.data;
    const user = await this.oauthCodeService.exchangeCode(code);
    const token = this.authService.generateToken(user);

    return res.json({ token });
  }
}
