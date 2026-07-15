import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeasonService } from './services/season.service';
import { RatingService } from './services/rating.service';
import { ShopService } from './services/shop.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class RankingCronService {
  private readonly logger = new Logger(RankingCronService.name);

  constructor(
    private readonly seasonService: SeasonService,
    private readonly ratingService: RatingService,
    private readonly shopService: ShopService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Cada sábado a las 00:00 UTC se asegura que exista la temporada activa.
   */
  @Cron(CronExpression.EVERY_WEEKEND)
  async ensureWeekendSeason() {
    this.logger.log('Creando/verificando temporada de fin de semana');
    const season = await this.seasonService.getOrCreateCurrentSeason();
    this.logger.log(
      `Temporada activa: ${
        season.id
      } (${season.eventStartsAt.toISOString()} - ${season.eventEndsAt.toISOString()})`
    );
  }

  /**
   * Lunes a las 07:00 UTC se revelan los resultados del fin de semana.
   */
  @Cron('0 7 * * 1')
  async revealSeason() {
    this.logger.log('Iniciando revelación de temporada');

    // Asegurar catálogo de protectores.
    await this.shopService.seedItems();

    const season = await this.prisma.season.findFirst({
      where: { isActive: true, isRevealed: false },
      orderBy: { eventStartsAt: 'desc' },
    });

    if (!season) {
      this.logger.warn('No hay temporada activa para revelar');
      return;
    }

    const results = await this.ratingService.revealSeason(season.id);
    this.logger.log(`Revelados ${results.length} intentos oficiales`);
  }
}
