import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Division, ExamAttempt, Season, User } from '@prisma/client';

const MIN_RATING = 400;
const MAX_RATING = 3000;

export const DIVISION_THRESHOLDS: {
  division: Division;
  minScore: number;
  maxScore: number;
  minRating: number;
  maxRating: number;
  kFactor: number;
}[] = [
  {
    division: 'HUEVITO',
    minScore: 0,
    maxScore: 20,
    minRating: 400,
    maxRating: 920,
    kFactor: 80,
  },
  {
    division: 'POLLITO',
    minScore: 20,
    maxScore: 40,
    minRating: 920,
    maxRating: 1440,
    kFactor: 64,
  },
  {
    division: 'DINOSAURIO',
    minScore: 40,
    maxScore: 60,
    minRating: 1440,
    maxRating: 1960,
    kFactor: 48,
  },
  {
    division: 'FOSIL',
    minScore: 60,
    maxScore: 80,
    minRating: 1960,
    maxRating: 2480,
    kFactor: 36,
  },
  {
    division: 'CACHIMBO',
    minScore: 80,
    maxScore: 100,
    minRating: 2480,
    maxRating: 3000,
    kFactor: 24,
  },
];

export function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function ratingToScore(rating: number): number {
  return clamp(0, Math.round(((rating - 400) / 2600) * 1000) / 10, 100);
}

export function scoreToRating(score: number): number {
  return clamp(MIN_RATING, Math.round(400 + (score / 100) * 2600), MAX_RATING);
}

export function getDivisionByScore(score: number): Division {
  const threshold = DIVISION_THRESHOLDS.find(
    (t) => score >= t.minScore && score < t.maxScore
  );
  return threshold?.division ?? 'CACHIMBO';
}

export function getDivisionByRating(rating: number): Division {
  return getDivisionByScore(ratingToScore(rating));
}

export function getKFactorByRating(rating: number): number {
  const division = getDivisionByRating(rating);
  return (
    DIVISION_THRESHOLDS.find((t) => t.division === division)?.kFactor ?? 80
  );
}

export function expectedScore(myRating: number, avgRating: number): number {
  return 1 / (1 + Math.pow(10, (avgRating - myRating) / 400));
}

export function ratingChange(
  myRating: number,
  avgOpponentRating: number,
  scorePercent: number,
  kFactor: number,
  newUserMultiplier = 1
): number {
  const actual = clamp(0, scorePercent / 100, 1);
  const expected = expectedScore(myRating, avgOpponentRating);
  const rawDelta = Math.round(
    kFactor * (actual - expected) * newUserMultiplier
  );
  return clamp(-200, rawDelta, 200);
}

export function applyProtectors(delta: number, protectors: string[]): number {
  let result = delta;
  if (result < 0 && protectors.includes('RATING_SHIELD_50')) {
    result = Math.round(result * 0.5);
  }
  if (result < 0 && protectors.includes('RATING_FREEZE')) {
    result = 0;
  }
  if (result > 0 && protectors.includes('RATING_BOOSTER')) {
    result = Math.round(result * 1.5);
  }
  return clamp(-200, result, 200);
}

export function examWeight(
  questionCount: number,
  timeLimitMinutes: number
): number {
  return clamp(0.5, questionCount / 100 + timeLimitMinutes / 180, 1.5);
}

export interface RevealedAttempt {
  attemptId: string;
  userId: string;
  oldRating: number;
  newRating: number;
  delta: number;
  divisionAtTime: Division;
}

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula el cambio de rating para un intento completado sin aplicarlo.
   */
  async calculateDelta(
    attempt: ExamAttempt & { user?: User; season?: Season | null },
    protectors: string[] = []
  ): Promise<{
    delta: number;
    score: number;
    avgOpponentRating: number;
    kFactor: number;
  }> {
    const user =
      attempt.user ??
      (await this.prisma.user.findUnique({ where: { id: attempt.userId } }));
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!attempt.score || attempt.score < 0) {
      throw new Error('Intento sin puntaje válido');
    }

    const score = clamp(0, attempt.score, 100);
    const avgOpponentRating = await this.getAvgOpponentRating(attempt);
    const completedOfficials = await this.prisma.ratingHistory.count({
      where: { userId: user.id },
    });
    const newUserMultiplier = Math.max(1, 2 - completedOfficials / 10);
    const kFactor = getKFactorByRating(user.rating);
    const weight = examWeight(
      attempt.questionCount,
      attempt.timeLimitSeconds / 60
    );

    let delta = ratingChange(
      user.rating,
      avgOpponentRating,
      score,
      Math.round(kFactor * weight),
      newUserMultiplier
    );

    // Abandono parcial
    if (attempt.status === 'ABANDONED') {
      const answeredRatio =
        attempt.questionCount > 0
          ? ((attempt.correctCount ?? 0) + (attempt.incorrectCount ?? 0)) /
            attempt.questionCount
          : 0;
      delta = answeredRatio > 0.5 ? -10 : 0;
    }

    delta = applyProtectors(delta, protectors);

    return { delta, score, avgOpponentRating, kFactor };
  }

  /**
   * Aplica el cambio de rating a un usuario y crea el RatingHistory.
   * Esta función se llama durante revealSeason (lunes).
   */
  async applyDelta(
    attempt: ExamAttempt,
    protectors: string[] = []
  ): Promise<RevealedAttempt> {
    const { delta, score, avgOpponentRating, kFactor } =
      await this.calculateDelta(attempt, protectors);

    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: attempt.userId } });
      if (!user) throw new Error('Usuario no encontrado');

      const oldRating = user.rating;
      const newRating = clamp(MIN_RATING, oldRating + delta, MAX_RATING);
      const newDivision = getDivisionByRating(newRating);

      await tx.user.update({
        where: { id: user.id },
        data: {
          rating: newRating,
          highestRating: Math.max(user.highestRating, newRating),
          division: newDivision,
          highestDivision: this.higherDivision(
            user.highestDivision,
            newDivision
          ),
          lastExamScore: score,
        },
      });

      await tx.examAttempt.update({
        where: { id: attempt.id },
        data: {
          isRevealed: true,
          calculatedRatingDelta: delta,
          calculatedScore: score,
        },
      });

      await tx.ratingHistory.create({
        data: {
          userId: user.id,
          seasonId: attempt.seasonId!,
          examAttemptId: attempt.id,
          mode: attempt.mode,
          score,
          oldRating,
          newRating,
          delta,
          divisionAtTime: newDivision,
          kFactorUsed: kFactor,
          avgOpponentRating,
          protectorsUsed: protectors,
          appliedAt: new Date(),
        },
      });

      return {
        attemptId: attempt.id,
        userId: user.id,
        oldRating,
        newRating,
        delta,
        divisionAtTime: newDivision,
      };
    });
  }

  /**
   * Procesa todos los intentos oficiales completados de una temporada
   * y revela los deltas el lunes.
   */
  async revealSeason(seasonId: string): Promise<RevealedAttempt[]> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });
    if (!season) throw new Error('Temporada no encontrada');
    if (season.isRevealed) throw new Error('Temporada ya revelada');

    // Intentos oficiales completados, no revelados, de usuarios sin freeze.
    const attempts = await this.prisma.examAttempt.findMany({
      where: {
        seasonId,
        isOfficial: true,
        status: { in: ['COMPLETED', 'ABANDONED'] },
        isRevealed: false,
        timerStartedAt: { gte: season.eventStartsAt, lt: season.eventEndsAt },
        user: {
          OR: [
            { ratingFrozenUntil: null },
            { ratingFrozenUntil: { lt: new Date() } },
          ],
        },
      },
      include: { user: true },
      orderBy: { submittedAt: 'asc' },
    });

    // Tomar solo el mejor intento oficial por usuario en esta temporada.
    const bestByUser = new Map<string, (typeof attempts)[0]>();
    for (const attempt of attempts) {
      const existing = bestByUser.get(attempt.userId);
      if (!existing || (attempt.score ?? 0) > (existing.score ?? 0)) {
        bestByUser.set(attempt.userId, attempt);
      }
    }

    const results: RevealedAttempt[] = [];
    for (const attempt of bestByUser.values()) {
      // Validar anti-gaming
      if (!this.isValidForRating(attempt)) continue;

      // Determinar protectores equipados: por simplicidad, usamos el inventario
      // del usuario y consumimos el primero disponible según prioridad.
      const protectors = await this.getEquippedProtectors(attempt.userId);
      const result = await this.applyDelta(attempt, protectors);
      results.push(result);

      // Consumir protectores usados.
      for (const key of protectors) {
        await this.prisma.userItem.updateMany({
          where: { userId: attempt.userId, itemKey: key, quantity: { gt: 0 } },
          data: { quantity: { decrement: 1 } },
        });
      }
    }

    await this.prisma.season.update({
      where: { id: seasonId },
      data: { isRevealed: true, revealedAt: new Date(), isActive: false },
    });

    return results;
  }

  /**
   * Verifica que un intento cumpla las reglas anti-gaming.
   */
  isValidForRating(attempt: ExamAttempt): boolean {
    if (attempt.status !== 'COMPLETED' && attempt.status !== 'ABANDONED')
      return false;
    if (!attempt.timerStartedAt) return false;
    if (!attempt.timeUsedSeconds) return false;

    const minTime = attempt.questionCount * 10;
    const maxTime = attempt.serverTimeLimitSec * 1.1;
    if (attempt.timeUsedSeconds < minTime || attempt.timeUsedSeconds > maxTime)
      return false;

    const blankRatio =
      attempt.questionCount > 0
        ? (attempt.blankCount ?? 0) / attempt.questionCount
        : 0;
    if (blankRatio > 0.8) return false;

    return true;
  }

  /**
   * Devuelve el oponente promedio para un intento.
   */
  private async getAvgOpponentRating(attempt: ExamAttempt): Promise<number> {
    if (attempt.mode === 'ARCHIVE' && attempt.examId) {
      const recent = await this.prisma.examAttempt.findMany({
        where: {
          examId: attempt.examId,
          status: 'COMPLETED',
          isRevealed: true,
          userId: { not: attempt.userId },
        },
        orderBy: { submittedAt: 'desc' },
        take: 50,
        include: { user: true },
      });
      if (recent.length > 0) {
        return this.median(recent.map((r) => r.user.rating));
      }
    }

    // Fallback: mediana de rating de usuarios activos de la misma división.
    const user = await this.prisma.user.findUnique({
      where: { id: attempt.userId },
    });
    if (!user) return 1500;

    const peers = await this.prisma.user.findMany({
      where: { division: user.division, id: { not: attempt.userId } },
      select: { rating: true },
      take: 200,
    });
    if (peers.length === 0) return 1500;
    return this.median(peers.map((p) => p.rating));
  }

  private median(values: number[]): number {
    if (values.length === 0) return 1500;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private higherDivision(a: Division, b: Division): Division {
    const order: Division[] = [
      'HUEVITO',
      'POLLITO',
      'DINOSAURIO',
      'FOSIL',
      'CACHIMBO',
    ];
    return order[Math.max(order.indexOf(a), order.indexOf(b))];
  }

  /**
   * Por defecto equipa protectores disponibles según prioridad defensiva.
   * A futuro se puede hacer configurable desde el frontend.
   */
  private async getEquippedProtectors(userId: string): Promise<string[]> {
    const items = await this.prisma.userItem.findMany({
      where: { userId, quantity: { gt: 0 } },
    });
    const protectors = items
      .filter((i) =>
        ['RATING_SHIELD_50', 'RATING_FREEZE', 'RATING_BOOSTER'].includes(
          i.itemKey
        )
      )
      .map((i) => i.itemKey);
    // Defensivos primero
    const priority = ['RATING_FREEZE', 'RATING_SHIELD_50', 'RATING_BOOSTER'];
    return protectors
      .sort((a, b) => priority.indexOf(a) - priority.indexOf(b))
      .slice(0, 2);
  }
}
