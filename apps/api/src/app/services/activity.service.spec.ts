import { ActivityService, toDateOnly } from './activity.service';

const mockTx = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  answerLog: {
    create: jest.fn(),
    createMany: jest.fn(),
  },
  activityLog: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  userItem: {
    findFirst: jest.fn(),
  },
};

const mockPrisma = {
  $transaction: jest.fn((callback) => callback(mockTx)),
  activityLog: {
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

// Valor de día (medianoche UTC del día civil de Lima) hace n días.
// Misma convención que usa la BD, para que los tests no dependan del día
// en que se ejecutan.
function daysAgo(n: number): Date {
  return new Date(toDateOnly(new Date()).getTime() - n * 86_400_000);
}

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ActivityService(
      mockPrisma as unknown as ConstructorParameters<typeof ActivityService>[0]
    );
  });

  describe('recordActivity', () => {
    it('registra actividad, gemas y racha en una transacción', async () => {
      const user = {
        id: 'user-1',
        streak: 3,
        lastActivityDate: daysAgo(1),
        streakFreezes: 0,
        gems: 100,
        coins: 50,
        energy: 20,
      };

      mockTx.user.findUnique.mockResolvedValue(user);
      mockTx.activityLog.findUnique.mockResolvedValue(null);
      mockTx.activityLog.upsert.mockResolvedValue({
        id: 'log-1',
        userId: 'user-1',
        date: new Date('2026-08-09T00:00:00.000Z'),
        questionsAnswered: 1,
        questionsCorrect: 1,
        nodesCompleted: 0,
        simulacrosCompleted: 0,
        gemsEarned: 0,
        loginBonusGems: 0,
        streakMilestoneGems: 0,
      });
      mockTx.userItem.findFirst.mockResolvedValue(null);
      mockTx.user.update.mockResolvedValue({
        ...user,
        gems: 115,
        streak: 4,
      });

      const result = await service.recordActivity({
        userId: 'user-1',
        type: 'QUESTION_ANSWERED',
        questionId: 'q-1',
        answer: { selectedOptionId: 'a' },
        isCorrect: true,
        baseGems: 10,
        questionsAnswered: 1,
        questionsCorrect: 1,
      });

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
      expect(mockTx.answerLog.create).toHaveBeenCalledTimes(1);
      expect(mockTx.activityLog.upsert).toHaveBeenCalledTimes(1);
      expect(mockTx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            streak: 4,
          }),
        })
      );
      expect(result.streak).toBe(4);
      expect(result.streakIncremented).toBe(true);
      expect(result.user.gems).toBe(115);
    });

    it('usa freeze cuando se perdió un día y hay freeze disponible', async () => {
      const user = {
        id: 'user-1',
        streak: 5,
        lastActivityDate: daysAgo(2),
        streakFreezes: 1,
        gems: 100,
        coins: 50,
        energy: 20,
      };

      mockTx.user.findUnique.mockResolvedValue(user);
      mockTx.activityLog.findUnique.mockResolvedValue(null);
      mockTx.activityLog.upsert.mockResolvedValue({
        id: 'log-1',
        userId: 'user-1',
        date: new Date('2026-08-09T00:00:00.000Z'),
        questionsAnswered: 0,
        questionsCorrect: 0,
        nodesCompleted: 1,
        simulacrosCompleted: 0,
        gemsEarned: 0,
        loginBonusGems: 0,
        streakMilestoneGems: 0,
      });
      mockTx.userItem.findFirst.mockResolvedValue(null);
      mockTx.user.update.mockResolvedValue({
        ...user,
        gems: 110,
        streak: 6,
        streakFreezes: 0,
      });

      const result = await service.recordActivity({
        userId: 'user-1',
        type: 'NODE_COMPLETED',
        topicId: 'topic-1',
        nodeIndex: 0,
        baseGems: 10,
        nodesCompleted: 1,
      });

      expect(result.streak).toBe(6);
      expect(result.freezesUsed).toBe(1);
      expect(mockTx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            streakFreezes: { decrement: 1 },
          }),
        })
      );
    });
  });

  describe('getStreakStatus', () => {
    it('devuelve la racha sin sincronizar cuando está vigente', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        streak: 5,
        lastActivityDate: daysAgo(1),
        streakFreezes: 0,
      });

      const result = await service.getStreakStatus('user-1');

      expect(result.streak).toBe(5);
      expect(result.needsSync).toBe(false);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('consume freezes y sincroniza cuando hay días perdidos', async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      mockPrisma.user.findUnique.mockResolvedValue({
        streak: 5,
        lastActivityDate: threeDaysAgo,
        streakFreezes: 2,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.getStreakStatus('user-1');

      expect(result.streak).toBe(5);
      expect(result.needsSync).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            streakFreezes: expect.any(Number),
            lastActivityDate: expect.any(Date),
          }),
        })
      );
    });

    it('resetea la racha cuando no hay freezes suficientes', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        streak: 5,
        lastActivityDate: daysAgo(3),
        streakFreezes: 1,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.getStreakStatus('user-1');

      expect(result.streak).toBe(0);
      expect(result.needsSync).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { streak: 0 },
      });
    });
  });

  describe('getHeatmap', () => {
    it('calcula intensidad basada en nodos completados', async () => {
      mockPrisma.activityLog.findMany.mockResolvedValue([
        {
          date: new Date('2026-07-14T00:00:00.000Z'),
          questionsAnswered: 20,
          nodesCompleted: 2,
          simulacrosCompleted: 0,
          gemsEarned: 15,
        },
      ]);

      const result = await service.getHeatmap('user-ficticio-2', 7);

      expect(result).toHaveLength(1);
      expect(result[0].intensity).toBe(2);
      expect(result[0].nodesCompleted).toBe(2);
    });

    it('calcula intensidad basada en simulacros completados', async () => {
      mockPrisma.activityLog.findMany.mockResolvedValue([
        {
          date: new Date('2026-07-14T00:00:00.000Z'),
          questionsAnswered: 0,
          nodesCompleted: 0,
          simulacrosCompleted: 1,
          gemsEarned: 0,
        },
      ]);

      const result = await service.getHeatmap('user-ficticio-sim', 7);

      expect(result[0].intensity).toBe(2);
      expect(result[0].simulacrosCompleted).toBe(1);
    });

    it('ignora preguntas, XP y gemas para la intensidad', async () => {
      mockPrisma.activityLog.findMany.mockResolvedValue([
        {
          date: new Date('2026-07-14T00:00:00.000Z'),
          questionsAnswered: 50,
          nodesCompleted: 0,
          simulacrosCompleted: 0,
          gemsEarned: 100,
        },
      ]);

      const result = await service.getHeatmap('user-ficticio-xp', 7);

      expect(result[0].intensity).toBe(0);
    });

    it('devuelve intensidad máxima cuando hay mucha actividad de nodos y simulacros', async () => {
      mockPrisma.activityLog.findMany.mockResolvedValue([
        {
          date: new Date('2026-07-14T00:00:00.000Z'),
          questionsAnswered: 10,
          nodesCompleted: 2,
          simulacrosCompleted: 1,
          gemsEarned: 5,
        },
      ]);

      const result = await service.getHeatmap('user-ficticio-3', 7);

      expect(result[0].intensity).toBe(4);
    });

    it('devuelve intensidad 0 para días sin actividad', async () => {
      mockPrisma.activityLog.findMany.mockResolvedValue([
        {
          date: new Date('2026-07-14T00:00:00.000Z'),
          questionsAnswered: 0,
          nodesCompleted: 0,
          simulacrosCompleted: 0,
          gemsEarned: 0,
        },
      ]);

      const result = await service.getHeatmap('user-ficticio-4', 7);

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
