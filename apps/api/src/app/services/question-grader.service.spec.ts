import { QuestionGraderService } from './question-grader.service';
import { QuestionType } from '@ingresa-pe/domain';
import { Difficulty, Question } from '@prisma/client';

describe('QuestionGraderService', () => {
  const grader = new QuestionGraderService();

  function makeQuestion(content: unknown): Question {
    return {
      id: 'q-1',
      statement: 'Pregunta de prueba',
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: Difficulty.MEDIUM,
      explanation: 'Explicación de prueba',
      content: content as any,
      options: null,
      imageUrl: null,
      topicId: 'topic-1',
    };
  }

  describe('MULTIPLE_CHOICE', () => {
    const question = makeQuestion({
      type: QuestionType.MULTIPLE_CHOICE,
      options: [
        { id: 'a', text: 'Opción A', isCorrect: false },
        { id: 'b', text: 'Opción B', isCorrect: true },
      ],
    });

    it('califica correctamente una respuesta acertada', () => {
      const result = grader.grade(question, {
        type: QuestionType.MULTIPLE_CHOICE,
        selectedOptionId: 'b',
      });

      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswerText).toBe('Opción B');
    });

    it('califica incorrectamente una respuesta errada', () => {
      const result = grader.grade(question, {
        type: QuestionType.MULTIPLE_CHOICE,
        selectedOptionId: 'a',
      });

      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswerText).toBe('Opción B');
    });

    it('lanza error si la opción no existe', () => {
      expect(() =>
        grader.grade(question, {
          type: QuestionType.MULTIPLE_CHOICE,
          selectedOptionId: 'z',
        })
      ).toThrow('Opción seleccionada no existe');
    });
  });

  describe('TRUE_FALSE_SWIPE', () => {
    it('modo legacy: acepta respuesta verdadera cuando es correcta', () => {
      const question = makeQuestion({
        type: QuestionType.TRUE_FALSE_SWIPE,
        isTrue: true,
        trueLabel: 'Verdadero',
        falseLabel: 'Falso',
      });

      const result = grader.grade(question, {
        type: QuestionType.TRUE_FALSE_SWIPE,
        isTrue: true,
      });
      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswerText).toBe('Verdadero');
    });

    it('modo legacy: rechaza respuesta falsa cuando es verdadera', () => {
      const question = makeQuestion({
        type: QuestionType.TRUE_FALSE_SWIPE,
        isTrue: true,
        trueLabel: 'Verdadero',
        falseLabel: 'Falso',
      });

      const result = grader.grade(question, {
        type: QuestionType.TRUE_FALSE_SWIPE,
        isTrue: false,
      });
      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswerText).toBe('Verdadero');
    });

    it('modo arcade: acepta lado correcto', () => {
      const question = makeQuestion({
        type: QuestionType.TRUE_FALSE_SWIPE,
        category: {
          left: { label: 'Falso', color: '#ff4b4b', darkColor: '#df2b2b' },
          right: { label: 'Verdadero', color: '#58cc02', darkColor: '#58a700' },
        },
        correctSide: 'right',
        cardText: 'La Tierra es redonda.',
      });

      const result = grader.grade(question, {
        type: QuestionType.TRUE_FALSE_SWIPE,
        side: 'right',
      });
      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswerText).toBe('Verdadero');
    });

    it('modo arcade: rechaza lado incorrecto', () => {
      const question = makeQuestion({
        type: QuestionType.TRUE_FALSE_SWIPE,
        category: {
          left: { label: 'Falso', color: '#ff4b4b', darkColor: '#df2b2b' },
          right: { label: 'Verdadero', color: '#58cc02', darkColor: '#58a700' },
        },
        correctSide: 'right',
        cardText: 'La Tierra es redonda.',
      });

      const result = grader.grade(question, {
        type: QuestionType.TRUE_FALSE_SWIPE,
        side: 'left',
      });
      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswerText).toBe('Verdadero');
    });
  });

  describe('FLASHCARD', () => {
    const question = makeQuestion({
      type: QuestionType.FLASHCARD,
      front: 'Capital de Francia',
      back: 'París',
    });

    it('califica según remembered', () => {
      expect(
        grader.grade(question, {
          type: QuestionType.FLASHCARD,
          remembered: true,
        }).isCorrect
      ).toBe(true);

      expect(
        grader.grade(question, {
          type: QuestionType.FLASHCARD,
          remembered: false,
        }).isCorrect
      ).toBe(false);
    });
  });

  describe('ORDERING', () => {
    const question = makeQuestion({
      type: QuestionType.ORDERING,
      items: [
        { id: '1', text: 'Primero' },
        { id: '2', text: 'Segundo' },
        { id: '3', text: 'Tercero' },
      ],
      correctOrder: ['1', '2', '3'],
    });

    it('acepta orden correcto', () => {
      const result = grader.grade(question, {
        type: QuestionType.ORDERING,
        itemIds: ['1', '2', '3'],
      });
      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswerText).toBe('Primero → Segundo → Tercero');
    });

    it('rechaza orden incorrecto', () => {
      const result = grader.grade(question, {
        type: QuestionType.ORDERING,
        itemIds: ['3', '2', '1'],
      });
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('MATCHING', () => {
    const question = makeQuestion({
      type: QuestionType.MATCHING,
      pairs: [
        { id: 'a', left: 'Sol', right: 'Estrella' },
        { id: 'b', left: 'Luna', right: 'Satélite' },
        { id: 'c', left: 'Tierra', right: 'Planeta' },
      ],
    });

    it('acepta cuando todos los pares están emparejados', () => {
      const result = grader.grade(question, {
        type: QuestionType.MATCHING,
        matchedPairIds: ['a', 'b', 'c'],
      });
      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswerText).toBe('Sol → Estrella, Luna → Satélite, Tierra → Planeta');
    });

    it('rechaza cuando falta un par', () => {
      const result = grader.grade(question, {
        type: QuestionType.MATCHING,
        matchedPairIds: ['a', 'b'],
      });
      expect(result.isCorrect).toBe(false);
    });

    it('rechaza cuando hay un id extra', () => {
      const result = grader.grade(question, {
        type: QuestionType.MATCHING,
        matchedPairIds: ['a', 'b', 'c', 'd'],
      });
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('computeRewards', () => {
    it('devuelve recompensas por dificultad cuando acierta', () => {
      expect(grader.computeRewards(Difficulty.EASY, true)).toEqual({ xp: 10, coins: 5 });
      expect(grader.computeRewards(Difficulty.MEDIUM, true)).toEqual({ xp: 20, coins: 10 });
      expect(grader.computeRewards(Difficulty.HARD, true)).toEqual({ xp: 30, coins: 15 });
    });

    it('devuelve XP de consuelo cuando falla', () => {
      expect(grader.computeRewards(Difficulty.MEDIUM, false)).toEqual({ xp: 5, coins: 0 });
    });
  });
});
