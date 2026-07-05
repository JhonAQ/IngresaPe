import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ACADEMIC_AXIS_DEFINITIONS,
  AcademicAxisId,
  getAxisIdByCourseSlug,
} from '../lib/academic-dna';

export interface TopicAccuracy {
  topicId: string;
  total: number;
  correct: number;
  accuracy: number;
  lastIncorrectAt: Date | null;
}

export interface WeakTopicSelection {
  questionIds: string[];
  topicBreakdown: Record<string, number>;
}

interface CandidateQuestion {
  id: string;
  topicId: string;
  examId: string;
  courseSlug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const DIFFICULTY_RANK: Record<'EASY' | 'MEDIUM' | 'HARD', number> = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

/**
 * Pesos objetivo por eje temático para que un simulacro refleje la estructura
 * real de un examen de admisión UNSA. Suman 1.
 */
const AXIS_TARGET_WEIGHTS: Record<AcademicAxisId, number> = {
  'raz-mat': 0.15,
  'raz-ver': 0.15,
  matematica: 0.2,
  sociales: 0.1,
  'ciencia-tech': 0.15,
  dpcc: 0.1,
  comunicacion: 0.1,
  ingles: 0.05,
};

const WEAKNESS_WEIGHT = 1.0;
const DIFFICULTY_WEIGHT = 0.25;
const RECENCY_WEIGHT = 0.5;
const EXAM_REPETITION_WEIGHT = 0.4;
const TOPIC_REPETITION_WEIGHT = 0.2;
const NEVER_FAILED_DAYS = 90;
const MAX_RECENCY_DAYS = 60;

@Injectable()
export class WeakTopicAnalyzerService {
  constructor(private readonly prisma: PrismaService) {}

  async selectQuestions(userId: string, desiredCount: number): Promise<WeakTopicSelection> {
    const topicStats = await this.buildTopicStats(userId);
    const answeredExamQuestionIds = await this.getAnsweredExamQuestionIds(userId);
    const candidates = await this.fetchCandidatesWithFallback(
      answeredExamQuestionIds,
      desiredCount
    );

    if (candidates.length === 0) {
      return {
        questionIds: [],
        topicBreakdown: {},
      };
    }

    const topicStatsMap = new Map(topicStats.map((t) => [t.topicId, t]));

    // Sin historial suficiente: simulacro balanceado pero aleatorio.
    if (topicStats.length === 0) {
      const balanced = this.selectBalancedRandom(candidates, desiredCount);
      return {
        questionIds: this.shuffle(balanced),
        topicBreakdown: this.buildTopicBreakdown(balanced, candidates),
      };
    }

    const byAxis = this.groupCandidatesByAxis(candidates);
    const axisTargets = this.computeAxisTargets(desiredCount);

    const selectedIds = new Set<string>();
    const examUsage: Record<string, number> = {};
    const topicUsage: Record<string, number> = {};

    // Ordenamos ejes de más débil a más fuerte para que los ejes con peor
    // desempeño compitan primero por las mejores preguntas disponibles.
    const axisWeakness = this.computeAxisWeakness(topicStatsMap, candidates);
    const sortedAxes = [...ACADEMIC_AXIS_DEFINITIONS].sort(
      (a, b) => axisWeakness[a.id] - axisWeakness[b.id]
    );

    const selected: string[] = [];

    for (const { id: axisId } of sortedAxes) {
      const target = axisTargets[axisId] ?? 0;
      if (target <= 0) continue;

      const picked = this.pickBestFromPool(
        byAxis[axisId] ?? [],
        target,
        topicStatsMap,
        examUsage,
        topicUsage,
        selectedIds
      );
      selected.push(...picked);
    }

    // Si por falta de pool no se llegó al total, completamos con lo mejor del
    // resto del banco sin restricción de eje.
    const remaining = desiredCount - selected.length;
    if (remaining > 0) {
      const leftoverPool = candidates.filter((q) => !selectedIds.has(q.id));
      const extra = this.pickBestFromPool(
        leftoverPool,
        remaining,
        topicStatsMap,
        examUsage,
        topicUsage,
        selectedIds
      );
      selected.push(...extra);
    }

    return {
      questionIds: this.shuffle(selected),
      topicBreakdown: this.buildTopicBreakdown(selected, candidates),
    };
  }

  async selectRandomQuestions(
    desiredCount: number,
    excludeIds: string[] = []
  ): Promise<string[]> {
    const candidates = await this.fetchCandidatesWithFallback(excludeIds, desiredCount);
    if (candidates.length === 0) return [];
    return this.shuffle(this.selectBalancedRandom(candidates, desiredCount));
  }

  private async buildTopicStats(userId: string): Promise<TopicAccuracy[]> {
    const logs = await this.prisma.answerLog.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        createdAt: true,
        question: { select: { topicId: true } },
        examQuestion: { select: { topicId: true } },
      },
    });

    const stats = new Map<
      string,
      { total: number; correct: number; lastIncorrectAt: Date | null }
    >();

    for (const log of logs) {
      const topicId = log.question?.topicId ?? log.examQuestion?.topicId;
      if (!topicId) continue;

      const current = stats.get(topicId) ?? {
        total: 0,
        correct: 0,
        lastIncorrectAt: null,
      };
      current.total += 1;
      if (log.isCorrect) {
        current.correct += 1;
      } else {
        if (!current.lastIncorrectAt || log.createdAt > current.lastIncorrectAt) {
          current.lastIncorrectAt = log.createdAt;
        }
      }
      stats.set(topicId, current);
    }

    return Array.from(stats.entries())
      .map(([topicId, { total, correct, lastIncorrectAt }]) => ({
        topicId,
        total,
        correct,
        accuracy: total > 0 ? correct / total : 0,
        lastIncorrectAt,
      }))
      .sort((a, b) => {
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
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

  private async fetchCandidates(excludeIds: string[] = []): Promise<CandidateQuestion[]> {
    const rows = await this.prisma.examQuestion.findMany({
      where: {
        id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
      },
      select: {
        id: true,
        topicId: true,
        examId: true,
        difficulty: true,
        course: { select: { slug: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      topicId: r.topicId,
      examId: r.examId,
      courseSlug: r.course.slug,
      difficulty: r.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
    }));
  }

  private async fetchCandidatesWithFallback(
    excludeIds: string[] = [],
    desiredCount: number
  ): Promise<CandidateQuestion[]> {
    const preferred = await this.fetchCandidates(excludeIds);
    if (preferred.length >= desiredCount) {
      return preferred;
    }

    // Si no hay suficientes preguntas nuevas, permitimos repetir preguntas
    // ya respondidas para que usuarios premium puedan hacer simulacros ilimitados.
    const all = await this.fetchCandidates([]);
    return all.length > 0 ? all : preferred;
  }

  private groupCandidatesByAxis(
    candidates: CandidateQuestion[]
  ): Record<AcademicAxisId, CandidateQuestion[]> {
    const groups = Object.fromEntries(
      ACADEMIC_AXIS_DEFINITIONS.map((def) => [def.id, [] as CandidateQuestion[]])
    ) as Record<AcademicAxisId, CandidateQuestion[]>;

    for (const q of candidates) {
      const axisId = getAxisIdByCourseSlug(q.courseSlug);
      if (axisId) {
        groups[axisId].push(q);
      }
    }

    return groups;
  }

  private computeAxisTargets(desiredCount: number): Record<AcademicAxisId, number> {
    const raw = ACADEMIC_AXIS_DEFINITIONS.map((def) => ({
      axisId: def.id,
      value: desiredCount * AXIS_TARGET_WEIGHTS[def.id],
    }));

    const allocated = raw.map((r) => ({
      axisId: r.axisId,
      count: Math.floor(r.value),
      remainder: r.value - Math.floor(r.value),
    }));

    const remaining = desiredCount - allocated.reduce((sum, a) => sum + a.count, 0);
    const byRemainder = allocated
      .map((a, index) => ({ index, remainder: a.remainder }))
      .sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < remaining; i++) {
      const idx = byRemainder[i % byRemainder.length].index;
      allocated[idx].count += 1;
    }

    return Object.fromEntries(allocated.map((a) => [a.axisId, a.count])) as Record<
      AcademicAxisId,
      number
    >;
  }

  private computeAxisWeakness(
    topicStatsMap: Map<string, TopicAccuracy>,
    candidates: CandidateQuestion[]
  ): Record<AcademicAxisId, number> {
    // Mapeo topicId -> eje inferido a partir de los candidatos
    const topicToAxis = new Map<string, AcademicAxisId>();
    for (const q of candidates) {
      const axisId = getAxisIdByCourseSlug(q.courseSlug);
      if (axisId && !topicToAxis.has(q.topicId)) {
        topicToAxis.set(q.topicId, axisId);
      }
    }

    const axisAccuracy = new Map<AcademicAxisId, { total: number; weightedSum: number }>();

    for (const [topicId, stat] of topicStatsMap.entries()) {
      const axisId = topicToAxis.get(topicId);
      if (!axisId) continue;

      const current = axisAccuracy.get(axisId) ?? { total: 0, weightedSum: 0 };
      current.total += stat.total;
      current.weightedSum += stat.accuracy * stat.total;
      axisAccuracy.set(axisId, current);
    }

    const result = Object.fromEntries(
      ACADEMIC_AXIS_DEFINITIONS.map((def) => [def.id, 0.5])
    ) as Record<AcademicAxisId, number>;

    for (const [axisId, { total, weightedSum }] of axisAccuracy.entries()) {
      result[axisId] = total > 0 ? weightedSum / total : 0.5;
    }

    return result;
  }

  private pickBestFromPool(
    pool: CandidateQuestion[],
    target: number,
    topicStatsMap: Map<string, TopicAccuracy>,
    examUsage: Record<string, number>,
    topicUsage: Record<string, number>,
    selectedIds: Set<string>
  ): string[] {
    const available = pool.filter((q) => !selectedIds.has(q.id));
    const picked: string[] = [];

    while (picked.length < target && available.length > 0) {
      let bestIndex = -1;
      let bestScore = Infinity;

      for (let i = 0; i < available.length; i++) {
        const q = available[i];
        const score = this.computeScore(q, topicStatsMap, examUsage, topicUsage);
        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }

      if (bestIndex === -1) break;

      const chosen = available.splice(bestIndex, 1)[0];
      picked.push(chosen.id);
      selectedIds.add(chosen.id);
      examUsage[chosen.examId] = (examUsage[chosen.examId] ?? 0) + 1;
      topicUsage[chosen.topicId] = (topicUsage[chosen.topicId] ?? 0) + 1;
    }

    return picked;
  }

  private computeScore(
    q: CandidateQuestion,
    topicStatsMap: Map<string, TopicAccuracy>,
    examUsage: Record<string, number>,
    topicUsage: Record<string, number>
  ): number {
    const stat = topicStatsMap.get(q.topicId);
    const accuracy = stat && stat.total > 0 ? stat.accuracy : 0.5;
    const targetRank = this.targetDifficultyRank(accuracy);
    const difficultyPenalty =
      Math.abs(DIFFICULTY_RANK[q.difficulty] - targetRank) * DIFFICULTY_WEIGHT;

    const daysSinceIncorrect = stat?.lastIncorrectAt
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - stat.lastIncorrectAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : NEVER_FAILED_DAYS;
    const recencyPenalty =
      Math.min(daysSinceIncorrect, MAX_RECENCY_DAYS) / 30 * RECENCY_WEIGHT;

    const repetitionPenalty =
      (examUsage[q.examId] ?? 0) * EXAM_REPETITION_WEIGHT +
      (topicUsage[q.topicId] ?? 0) * TOPIC_REPETITION_WEIGHT;

    return accuracy * WEAKNESS_WEIGHT + difficultyPenalty + recencyPenalty + repetitionPenalty;
  }

  private targetDifficultyRank(accuracy: number): number {
    if (accuracy < 0.35) return DIFFICULTY_RANK.EASY;
    if (accuracy < 0.65) return DIFFICULTY_RANK.MEDIUM;
    return DIFFICULTY_RANK.HARD;
  }

  private selectBalancedRandom(
    candidates: CandidateQuestion[],
    desiredCount: number
  ): string[] {
    const byAxis = this.groupCandidatesByAxis(candidates);
    const targets = this.computeAxisTargets(desiredCount);
    const selectedIds = new Set<string>();
    const selected: string[] = [];

    for (const { id: axisId } of ACADEMIC_AXIS_DEFINITIONS) {
      const target = targets[axisId] ?? 0;
      if (target <= 0) continue;

      const pool = byAxis[axisId] ?? [];
      const shuffled = this.shuffle(pool);
      const take = Math.min(target, shuffled.length);
      for (let i = 0; i < take; i++) {
        const q = shuffled[i];
        if (!selectedIds.has(q.id)) {
          selected.push(q.id);
          selectedIds.add(q.id);
        }
      }
    }

    // Completar faltantes al azar si algún eje no tenía suficientes preguntas.
    const remaining = desiredCount - selected.length;
    if (remaining > 0) {
      const leftovers = this.shuffle(candidates.filter((q) => !selectedIds.has(q.id)));
      for (let i = 0; i < Math.min(remaining, leftovers.length); i++) {
        selected.push(leftovers[i].id);
      }
    }

    return selected;
  }

  private buildTopicBreakdown(
    questionIds: string[],
    candidates: CandidateQuestion[]
  ): Record<string, number> {
    const map = new Map(candidates.map((q) => [q.id, q]));
    const breakdown: Record<string, number> = {};

    for (const id of questionIds) {
      const q = map.get(id);
      if (!q) continue;
      breakdown[q.topicId] = (breakdown[q.topicId] ?? 0) + 1;
    }

    return breakdown;
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
