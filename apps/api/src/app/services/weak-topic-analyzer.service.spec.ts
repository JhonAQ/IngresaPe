import { Test, TestingModule } from '@nestjs/testing';
import { WeakTopicAnalyzerService } from './weak-topic-analyzer.service';
import { PrismaService } from '../prisma.service';

// Mock de PrismaService. No tocamos la base de datos real.
const mockPrismaService = () => ({
  answerLog: { findMany: jest.fn() },
  examQuestion: { findMany: jest.fn() },
});

describe('WeakTopicAnalyzerService', () => {
  let service: WeakTopicAnalyzerService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeakTopicAnalyzerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WeakTopicAnalyzerService>(WeakTopicAnalyzerService);
  });

  describe('selectQuestions (modo IA)', () => {
    it('debería permitir un segundo simulacro aunque todas las preguntas ya hayan sido respondidas', async () => {
      // 4 preguntas de examen, una por eje temático.
      const questions = [
        makeCandidate('q1', 'topic-rm', 'exam-1', 'razonamiento-matematico', 'MEDIUM'),
        makeCandidate('q2', 'topic-rv', 'exam-1', 'razonamiento-verbal', 'MEDIUM'),
        makeCandidate('q3', 'topic-mat', 'exam-2', 'algebra', 'MEDIUM'),
        makeCandidate('q4', 'topic-ct', 'exam-2', 'fisica', 'MEDIUM'),
      ];

      // El usuario ya respondió todo.
      const answeredIds = questions.map((q) => q.id);
      mockEmptyHistory();
      mockAnsweredExamQuestions(answeredIds);

      // Primera llamada (con exclusión) devuelve vacío; fallback devuelve todo.
      (prisma.examQuestion.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(questions);

      const result = await service.selectQuestions('user-1', 4);

      expect(result.questionIds).toHaveLength(4);
      // No debe duplicar dentro del mismo simulacro.
      expect(new Set(result.questionIds).size).toBe(4);
    });

    it('debería priorizar temas débiles y ajustar la dificultad', async () => {
      const topicWeak = 'topic-weak';
      const topicStrong = 'topic-strong';

      const weakQuestion = makeCandidate(
        'qw',
        topicWeak,
        'exam-a',
        'razonamiento-matematico',
        'EASY'
      );
      const strongQuestion = makeCandidate(
        'qs',
        topicStrong,
        'exam-a',
        'algebra',
        'HARD'
      );

      mockTopicStats([
        { topicId: topicWeak, total: 10, correct: 0 },
        { topicId: topicStrong, total: 10, correct: 10 },
      ]);
      mockAnsweredExamQuestions([]);
      (prisma.examQuestion.findMany as jest.Mock).mockResolvedValue([
        weakQuestion,
        strongQuestion,
      ]);

      const result = await service.selectQuestions('user-1', 2);

      // Con 2 preguntas y 2 ejes distintos, el eje débil debería entrar.
      expect(result.questionIds).toContain(weakQuestion.id);
      expect(result.questionIds).toContain(strongQuestion.id);
      expect(result.topicBreakdown[topicWeak]).toBeGreaterThanOrEqual(1);
    });

    it('debería balancear preguntas por eje temático cuando no hay historial', async () => {
      const questions = [
        makeCandidate('q1', 't1', 'exam-1', 'razonamiento-matematico', 'MEDIUM'),
        makeCandidate('q2', 't2', 'exam-1', 'razonamiento-verbal', 'MEDIUM'),
        makeCandidate('q3', 't3', 'exam-2', 'algebra', 'MEDIUM'),
        makeCandidate('q4', 't4', 'exam-2', 'historia-peru', 'MEDIUM'),
        makeCandidate('q5', 't5', 'exam-3', 'fisica', 'MEDIUM'),
        makeCandidate('q6', 't6', 'exam-3', 'psicologia', 'MEDIUM'),
        makeCandidate('q7', 't7', 'exam-4', 'lenguaje', 'MEDIUM'),
        makeCandidate('q8', 't8', 'exam-4', 'ingles', 'MEDIUM'),
      ];

      mockEmptyHistory();
      mockAnsweredExamQuestions([]);
      (prisma.examQuestion.findMany as jest.Mock).mockResolvedValue(questions);

      const result = await service.selectQuestions('user-1', 8);

      expect(result.questionIds).toHaveLength(8);
      // Con 8 preguntas y 8 ejes, el balanceador debería cubrir todos.
      expect(new Set(result.questionIds).size).toBe(8);
    });
  });

  describe('selectRandomQuestions', () => {
    it('debería balancear preguntas al azar por eje cuando no hay historial', async () => {
      const questions = [
        makeCandidate('q1', 't1', 'exam-1', 'razonamiento-matematico', 'MEDIUM'),
        makeCandidate('q2', 't2', 'exam-1', 'razonamiento-verbal', 'MEDIUM'),
        makeCandidate('q3', 't3', 'exam-2', 'algebra', 'MEDIUM'),
        makeCandidate('q4', 't4', 'exam-2', 'historia-peru', 'MEDIUM'),
      ];

      (prisma.examQuestion.findMany as jest.Mock).mockResolvedValue(questions);

      const result = await service.selectRandomQuestions(4);

      expect(result).toHaveLength(4);
      expect(new Set(result).size).toBe(4);
    });
  });

  // Helpers

  function makeCandidate(
    id: string,
    topicId: string,
    examId: string,
    courseSlug: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  ) {
    return {
      id,
      topicId,
      examId,
      difficulty,
      course: { slug: courseSlug },
    };
  }

  function mockEmptyHistory() {
    (prisma.answerLog.findMany as jest.Mock).mockResolvedValue([]);
  }

  function mockTopicStats(
    stats: { topicId: string; total: number; correct: number }[]
  ) {
    (prisma.answerLog.findMany as jest.Mock).mockImplementation((args: any) => {
      // La segunda llamada es getAnsweredExamQuestionIds.
      if (args?.select?.examQuestionId) return Promise.resolve([]);

      return Promise.resolve(
        stats.map((s) => ({
          isCorrect: true,
          createdAt: new Date(),
          question: { topicId: s.topicId },
          examQuestion: null,
          ...s,
        }))
      );
    });
  }

  function mockAnsweredExamQuestions(ids: string[]) {
    // getAnsweredExamQuestionIds llama con select.examQuestionId.
    (prisma.answerLog.findMany as jest.Mock)
      .mockResolvedValueOnce([]) // topic stats
      .mockResolvedValueOnce(ids.map((id) => ({ examQuestionId: id })));
  }
});
