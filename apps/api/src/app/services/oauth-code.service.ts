import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma.service';

const CODE_TTL_SECONDS = 60;
const KEY_PREFIX = 'oauth:code:';

@Injectable()
export class OAuthCodeService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService
  ) {}

  async createCode(userId: string): Promise<string> {
    const code = randomBytes(32).toString('base64url');
    await this.redis.getClient().setex(
      `${KEY_PREFIX}${code}`,
      CODE_TTL_SECONDS,
      userId
    );
    return code;
  }

  async exchangeCode(code: string): Promise<{ id: string; email: string; name: string | null; role: string }> {
    const key = `${KEY_PREFIX}${code}`;
    const userId = await this.redis.getClient().getdel(key);

    if (!userId) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
