import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface TopicAccuracy {
  topicId: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface WeakTopicSelection {
  questionIds: string[];
  topicBreakdown: Record<string, number>;
}

@Injectable()
export class WeakTopicAnalyzerService {
  constructor(private readonly prisma: PrismaService) {}

  async selectQuestions(userId: string, desiredCount: number): Promise<WeakTopicSelection> {
    const topicStats = await this.buildTopicStats(userId);
    const answeredExamQuestionIds = await this.getAnsweredExamQuestionIds(userId);

    // Si el usuario no tiene historial, caemos a selección aleatoria.
    if (topicStats.length === 0) {
      const randomIds = await this.selectRandomQuestions(
        desiredCount,
        answeredExamQuestionIds
      );
      return {
        questionIds: randomIds,
        topicBreakdown: {},
      };
    }

    const orderedTopicIds = topicStats.map((t) => t.topicId);
    const pool = await this.prisma.examQuestion.findMany({
      where: {
        topicId: { in: orderedTopicIds },
        id: { notIn: answeredExamQuestionIds },
      },
      select: { id: true, topicId: true, difficulty: true },
    });

    const poolByTopic = new Map<string, typeof pool>();
    for (const q of pool) {
      const arr = poolByTopic.get(q.topicId) ?? [];
      arr.push(q);
      poolByTopic.set(q.topicId, arr);
    }

    const selected: string[] = [];
    const topicBreakdown: Record<string, number> = {};

    // Rellenar desde los temas más débiles hacia los menos débiles.
    // Tomamos hasta 5 preguntas por tema en cada pasada para diversificar.
    let remaining = desiredCount;
    const chunkSize = 5;

    while (remaining > 0) {
      let addedInRound = 0;

      for (const topicId of orderedTopicIds) {
        if (remaining <= 0) break;

        const available = poolByTopic.get(topicId) ?? [];
        if (available.length === 0) continue;

        const take = Math.min(chunkSize, remaining, available.length);
        const taken = available.splice(0, take);

        for (const q of taken) {
          selected.push(q.id);
          topicBreakdown[topicId] = (topicBreakdown[topicId] ?? 0) + 1;
        }

        remaining -= take;
        addedInRound += take;
      }

      if (addedInRound === 0) break;
    }

    // Si aún faltan preguntas, completamos al azar desde todo el banco.
    if (remaining > 0) {
      const extraIds = await this.selectRandomQuestions(
        remaining,
        [...answeredExamQuestionIds, ...selected]
      );
      selected.push(...extraIds);
    }

    return {
      questionIds: selected,
      topicBreakdown,
    };
  }

  async selectRandomQuestions(
    desiredCount: number,
    excludeIds: string[] = []
  ): Promise<string[]> {
    const rows = await this.prisma.examQuestion.findMany({
      where: { id: { notIn: excludeIds.length > 0 ? excludeIds : undefined } },
      select: { id: true },
    });

    const shuffled = this.shuffle(rows.map((r) => r.id));
    return shuffled.slice(0, desiredCount);
  }

  private async buildTopicStats(userId: string): Promise<TopicAccuracy[]> {
    const logs = await this.prisma.answerLog.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        question: { select: { topicId: true } },
        examQuestion: { select: { topicId: true } },
      },
    });

    const stats = new Map<string, { total: number; correct: number }>();

    for (const log of logs) {
      const topicId = log.question?.topicId ?? log.examQuestion?.topicId;
      if (!topicId) continue;

      const current = stats.get(topicId) ?? { total: 0, correct: 0 };
      current.total += 1;
      if (log.isCorrect) current.correct += 1;
      stats.set(topicId, current);
    }

    return Array.from(stats.entries())
      .map(([topicId, { total, correct }]) => ({
        topicId,
        total,
        correct,
        accuracy: total > 0 ? correct / total : 0,
      }))
      .sort((a, b) => {
        // Priorizamos temas con peor tasa de acierto.
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        // En empate, priorizamos los que más intentos tienen (más evidencia).
        return b.total - a.total;
      });
  }

  private async getAnsweredExamQuestionIds(userId: string): Promise<string[]> {
    const logs = await this.prisma.answerLog.findMany({
      where: { userId, examQuestionId: { not: null } },
      select: { examQuestionId: true },
    });

    return logs
      .map((l) => l.examQuestionId)
      .filter((id): id is string => id !== null);
  }

  private shuffle<T>(array: T[]): T[] {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
