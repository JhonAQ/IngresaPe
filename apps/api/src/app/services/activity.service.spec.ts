import { ActivityService } from './activity.service';

const mockPrisma = {
  activityLog: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
};

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ActivityService(mockPrisma as unknown as Parameters<typeof ActivityService>[0]);
  });

  describe('log', () => {
    it('registra actividad diaria de un usuario ficticio', async () => {
      await service.log({
        userId: 'user-ficticio-1',
        questionsAnswered: 5,
        questionsCorrect: 3,
        nodesCompleted: 2,
        xpEarned: 50,
        gemsEarned: 10,
        simulacrosCompleted: 1,
      });

      expect(mockPrisma.activityLog.upsert).toHaveBeenCalledTimes(1);
      const call = mockPrisma.activityLog.upsert.mock.calls[0][0];
      expect(call.where.userId_date.userId).toBe('user-ficticio-1');
      expect(call.update.questionsAnswered.increment).toBe(5);
      expect(call.update.xpEarned.increment).toBe(50);
    });
  });

  describe('getHeatmap', () => {
    it('calcula intensidad considerando preguntas, nodos, simulacros, XP y gemas', async () => {
      mockPrisma.activityLog.findMany.mockResolvedValue([
        {
          date: new Date('2026-07-14T00:00:00.000Z'),
          questionsAnswered: 2,
          nodesCompleted: 1,
          simulacrosCompleted: 1,
          xpEarned: 40,
          gemsEarned: 5,
        },
      ]);

      const result = await service.getHeatmap('user-ficticio-2', 7);

      expect(result).toHaveLength(1);
      expect(result[0].intensity).toBeGreaterThan(0);
      expect(result[0].simulacrosCompleted).toBe(1);
      expect(result[0].xpEarned).toBe(40);
    });

    it('devuelve intensidad 0 para días sin actividad', async () => {
      mockPrisma.activityLog.findMany.mockResolvedValue([
        {
          date: new Date('2026-07-14T00:00:00.000Z'),
          questionsAnswered: 0,
          nodesCompleted: 0,
          simulacrosCompleted: 0,
          xpEarned: 0,
          gemsEarned: 0,
        },
      ]);

      const result = await service.getHeatmap('user-ficticio-3', 7);

      expect(result[0].intensity).toBe(0);
    });
  });

  describe('getStats', () => {
    it('agrega estadísticas de actividad del usuario', async () => {
      mockPrisma.activityLog.aggregate.mockResolvedValue({
        _sum: {
          questionsAnswered: 42,
          questionsCorrect: 30,
          nodesCompleted: 12,
          simulacrosCompleted: 3,
        },
      });

      const stats = await service.getStats('user-ficticio-4');

      expect(stats.totalQuestionsAnswered).toBe(42);
      expect(stats.totalQuestionsCorrect).toBe(30);
      expect(stats.totalNodesCompleted).toBe(12);
      expect(stats.totalSimulacrosCompleted).toBe(3);
    });

    it('devuelve 0 cuando no hay actividad', async () => {
      mockPrisma.activityLog.aggregate.mockResolvedValue({
        _sum: {
          questionsAnswered: null,
          questionsCorrect: null,
          nodesCompleted: null,
          simulacrosCompleted: null,
        },
      });

      const stats = await service.getStats('user-ficticio-5');

      expect(stats.totalQuestionsAnswered).toBe(0);
      expect(stats.totalNodesCompleted).toBe(0);
    });
  });
});
