import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Season } from '@prisma/client';

@Injectable()
export class SeasonService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve la temporada activa actual o la crea si no existe.
   * La temporada cubre el fin de semana en curso: sábado 00:00 UTC – domingo 23:59:59 UTC.
   */
  async getOrCreateCurrentSeason(): Promise<Season> {
    const now = new Date();
    const { startsAt, endsAt } = this.getWeekendBounds(now);
    const weekIndex = this.getWeekIndex(startsAt);

    const existing = await this.prisma.season.findUnique({ where: { weekIndex } });
    if (existing) return existing;

    return await this.prisma.season.create({
      data: {
        weekIndex,
        eventStartsAt: startsAt,
        eventEndsAt: endsAt,
        isActive: true,
        isRevealed: false,
      },
    });
  }

  /**
   * Crea explícitamente la temporada para una fecha dada.
   */
  async createSeasonForDate(date: Date): Promise<Season> {
    const { startsAt, endsAt } = this.getWeekendBounds(date);
    const weekIndex = this.getWeekIndex(startsAt);

    return await this.prisma.season.upsert({
      where: { weekIndex },
      update: {},
      create: {
        weekIndex,
        eventStartsAt: startsAt,
        eventEndsAt: endsAt,
        isActive: true,
        isRevealed: false,
      },
    });
  }

  /**
   * Indica si la ventana de inicio de simulacro oficial está abierta.
   */
  isEventOpen(season: Season): boolean {
    const now = new Date();
    return (
      season.isActive &&
      !season.isRevealed &&
      now >= season.eventStartsAt &&
      now < season.eventEndsAt
    );
  }

  /**
   * Indica si el usuario ya inició un intento oficial en la temporada dada.
   */
  async hasOfficialAttempt(userId: string, seasonId: string): Promise<boolean> {
    const count = await this.prisma.examAttempt.count({
      where: {
        userId,
        seasonId,
        isOfficial: true,
      },
    });
    return count > 0;
  }

  /**
   * Devuelve el intento oficial actual (en progreso o enviado sin revelar) del usuario.
   */
  async getCurrentOfficialAttempt(userId: string, seasonId: string) {
    return await this.prisma.examAttempt.findFirst({
      where: {
        userId,
        seasonId,
        isOfficial: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Calcula los límites del fin de semana de ranking para una fecha dada.
   */
  getWeekendBounds(date: Date): { startsAt: Date; endsAt: Date } {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay(); // 0 = domingo, 6 = sábado
    const diffToSaturday = (day + 1) % 7; // días hacia atrás hasta el sábado
    const startsAt = new Date(d.getTime() - diffToSaturday * 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 2 * 24 * 60 * 60 * 1000 - 1);
    return { startsAt, endsAt };
  }

  private getWeekIndex(date: Date): number {
    const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((date.getTime() - startOfYear) / msPerWeek);
  }
}
