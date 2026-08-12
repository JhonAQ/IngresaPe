import {
  computeStreakOnActivity,
  computeStreakOnRead,
} from './activity.service';

describe('Streak Helpers', () => {
  const today = new Date('2026-08-09T12:00:00.000Z');

  describe('computeStreakOnActivity', () => {
    it('inicia racha en 1 cuando es la primera actividad', () => {
      const result = computeStreakOnActivity(
        { streak: 0, lastActivityDate: null, streakFreezes: 0 },
        today
      );

      expect(result.streak).toBe(1);
      expect(result.freezesUsed).toBe(0);
    });

    it('mantiene la racha cuando ya hubo actividad hoy', () => {
      const result = computeStreakOnActivity(
        { streak: 5, lastActivityDate: today, streakFreezes: 0 },
        today
      );

      expect(result.streak).toBe(5);
      expect(result.freezesUsed).toBe(0);
    });

    it('incrementa la racha cuando la última actividad fue ayer', () => {
      const yesterday = new Date('2026-08-08T12:00:00.000Z');
      const result = computeStreakOnActivity(
        { streak: 5, lastActivityDate: yesterday, streakFreezes: 0 },
        today
      );

      expect(result.streak).toBe(6);
      expect(result.freezesUsed).toBe(0);
    });

    it('usa 1 freeze cuando se perdió 1 día y hay 1 freeze disponible', () => {
      const twoDaysAgo = new Date('2026-08-07T12:00:00.000Z');
      const result = computeStreakOnActivity(
        { streak: 5, lastActivityDate: twoDaysAgo, streakFreezes: 1 },
        today
      );

      expect(result.streak).toBe(6);
      expect(result.freezesUsed).toBe(1);
    });

    it('usa 2 freezes cuando se perdieron 2 días y hay 2 freezes disponibles', () => {
      const threeDaysAgo = new Date('2026-08-06T12:00:00.000Z');
      const result = computeStreakOnActivity(
        { streak: 5, lastActivityDate: threeDaysAgo, streakFreezes: 2 },
        today
      );

      expect(result.streak).toBe(6);
      expect(result.freezesUsed).toBe(2);
    });

    it('reinicia la racha a 1 cuando no hay freezes suficientes', () => {
      const threeDaysAgo = new Date('2026-08-06T12:00:00.000Z');
      const result = computeStreakOnActivity(
        { streak: 5, lastActivityDate: threeDaysAgo, streakFreezes: 1 },
        today
      );

      expect(result.streak).toBe(1);
      expect(result.freezesUsed).toBe(0);
    });

    it('reinicia la racha a 1 cuando no hay freezes', () => {
      const threeDaysAgo = new Date('2026-08-06T12:00:00.000Z');
      const result = computeStreakOnActivity(
        { streak: 5, lastActivityDate: threeDaysAgo, streakFreezes: 0 },
        today
      );

      expect(result.streak).toBe(1);
      expect(result.freezesUsed).toBe(0);
    });
  });

  describe('computeStreakOnRead', () => {
    it('devuelve 0 cuando no hay última actividad', () => {
      const result = computeStreakOnRead(
        { streak: 0, lastActivityDate: null, streakFreezes: 0 },
        today
      );

      expect(result.streak).toBe(0);
      expect(result.needsSync).toBe(false);
    });

    it('devuelve la racha cuando hubo actividad hoy', () => {
      const result = computeStreakOnRead(
        { streak: 5, lastActivityDate: today, streakFreezes: 0 },
        today
      );

      expect(result.streak).toBe(5);
      expect(result.needsSync).toBe(false);
    });

    it('devuelve la racha cuando la última actividad fue ayer', () => {
      const yesterday = new Date('2026-08-08T12:00:00.000Z');
      const result = computeStreakOnRead(
        { streak: 5, lastActivityDate: yesterday, streakFreezes: 0 },
        today
      );

      expect(result.streak).toBe(5);
      expect(result.needsSync).toBe(false);
    });

    it('consume 1 freeze y mantiene la racha cuando se perdió 1 día', () => {
      const twoDaysAgo = new Date('2026-08-07T12:00:00.000Z');
      const result = computeStreakOnRead(
        { streak: 5, lastActivityDate: twoDaysAgo, streakFreezes: 1 },
        today
      );

      expect(result.streak).toBe(5);
      expect(result.needsSync).toBe(true);
      expect(result.syncData).toEqual({
        streakFreezes: 0,
        lastActivityDate: new Date('2026-08-08T00:00:00.000Z'),
      });
    });

    it('consume 2 freezes y mantiene la racha cuando se perdieron 2 días', () => {
      const threeDaysAgo = new Date('2026-08-06T12:00:00.000Z');
      const result = computeStreakOnRead(
        { streak: 5, lastActivityDate: threeDaysAgo, streakFreezes: 2 },
        today
      );

      expect(result.streak).toBe(5);
      expect(result.needsSync).toBe(true);
      expect(result.syncData).toEqual({
        streakFreezes: 0,
        lastActivityDate: new Date('2026-08-08T00:00:00.000Z'),
      });
    });

    it('resetea la racha a 0 cuando no hay freezes suficientes', () => {
      const threeDaysAgo = new Date('2026-08-06T12:00:00.000Z');
      const result = computeStreakOnRead(
        { streak: 5, lastActivityDate: threeDaysAgo, streakFreezes: 1 },
        today
      );

      expect(result.streak).toBe(0);
      expect(result.needsSync).toBe(true);
      expect(result.syncData).toEqual({ streak: 0 });
    });

    it('resetea la racha a 0 cuando no hay freezes', () => {
      const threeDaysAgo = new Date('2026-08-06T12:00:00.000Z');
      const result = computeStreakOnRead(
        { streak: 5, lastActivityDate: threeDaysAgo, streakFreezes: 0 },
        today
      );

      expect(result.streak).toBe(0);
      expect(result.needsSync).toBe(true);
      expect(result.syncData).toEqual({ streak: 0 });
    });
  });
});
