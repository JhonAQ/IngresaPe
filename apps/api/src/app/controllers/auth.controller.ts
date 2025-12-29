import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';

@Controller('auth') // Ruta base: /api/auth
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. El usuario hace clic aquí para iniciar el viaje
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Guarda inicia el flujo automáticamente
  }

  // 2. Google nos devuelve al usuario aquí
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Si llegamos aquí, el usuario ya fue validado por la Strategy
    const user = req.user;
    
    // Generamos el Token
    const token = this.authService.generateToken(user);

    // REDIRECCIÓN FINAL AL FRONTEND
    // Enviamos el token en la URL para que el Frontend lo capture
    // Ajusta el puerto 4200 si tu frontend usa otro
    res.redirect(`http://localhost:4200/login?token=${token}`);
  }
}