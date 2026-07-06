import {
  questionContentSchema,
  questionViewSchema,
  answerSubmissionSchema,
  QuestionType,
} from './question';

describe('matching schemas', () => {
  const validMatchingContent = {
    type: QuestionType.MATCHING,
    pairs: [
      { id: 'a', left: 'Sol', right: 'Estrella' },
      { id: 'b', left: 'Luna', right: 'Satélite' },
    ],
  };

  it('acepta contenido matching válido', () => {
    const result = questionContentSchema.safeParse(validMatchingContent);
    expect(result.success).toBe(true);
  });

  it('acepta vista matching válida', () => {
    const result = questionViewSchema.safeParse(validMatchingContent);
    expect(result.success).toBe(true);
  });

  it('acepta respuesta matching válida', () => {
    const result = answerSubmissionSchema.safeParse({
      type: QuestionType.MATCHING,
      matchedPairIds: ['a', 'b'],
    });
    expect(result.success).toBe(true);
  });

  it('rechaza menos de 2 pares', () => {
    const result = questionContentSchema.safeParse({
      type: QuestionType.MATCHING,
      pairs: [{ id: 'a', left: 'Sol', right: 'Estrella' }],
    });
    expect(result.success).toBe(false);
  });

  it('rechaza ids duplicados', () => {
    const result = questionContentSchema.safeParse({
      type: QuestionType.MATCHING,
      pairs: [
        { id: 'a', left: 'Sol', right: 'Estrella' },
        { id: 'a', left: 'Luna', right: 'Satélite' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rechaza textos vacíos', () => {
    const result = questionContentSchema.safeParse({
      type: QuestionType.MATCHING,
      pairs: [
        { id: 'a', left: '', right: 'Estrella' },
        { id: 'b', left: 'Luna', right: 'Satélite' },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('true_false_swipe schemas', () => {
  const legacyContent = {
    type: QuestionType.TRUE_FALSE_SWIPE,
    isTrue: true,
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
  };

  const modernContent = {
    type: QuestionType.TRUE_FALSE_SWIPE,
    category: {
      left: { label: 'Falso', color: '#ff4b4b', darkColor: '#df2b2b' },
      right: { label: 'Verdadero', color: '#58cc02', darkColor: '#58a700' },
    },
    correctSide: 'right',
    cardText: 'La Tierra es plana.',
  };

  it('acepta contenido legacy válido', () => {
    const result = questionContentSchema.safeParse(legacyContent);
    expect(result.success).toBe(true);
  });

  it('acepta contenido arcade/moderno válido', () => {
    const result = questionContentSchema.safeParse(modernContent);
    expect(result.success).toBe(true);
  });

  it('acepta vista arcade válida', () => {
    const result = questionViewSchema.safeParse({
      type: QuestionType.TRUE_FALSE_SWIPE,
      category: modernContent.category,
      cardText: modernContent.cardText,
    });
    expect(result.success).toBe(true);
  });

  it('acepta respuesta legacy válida', () => {
    const result = answerSubmissionSchema.safeParse({
      type: QuestionType.TRUE_FALSE_SWIPE,
      isTrue: true,
    });
    expect(result.success).toBe(true);
  });

  it('acepta respuesta arcade válida', () => {
    const result = answerSubmissionSchema.safeParse({
      type: QuestionType.TRUE_FALSE_SWIPE,
      side: 'right',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza contenido que mezcla legacy y arcade', () => {
    const result = questionContentSchema.safeParse({
      ...modernContent,
      isTrue: true,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza contenido arcade sin correctSide', () => {
    const result = questionContentSchema.safeParse({
      type: QuestionType.TRUE_FALSE_SWIPE,
      category: modernContent.category,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza respuesta sin isTrue ni side', () => {
    const result = answerSubmissionSchema.safeParse({
      type: QuestionType.TRUE_FALSE_SWIPE,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza respuesta con ambos isTrue y side', () => {
    const result = answerSubmissionSchema.safeParse({
      type: QuestionType.TRUE_FALSE_SWIPE,
      isTrue: true,
      side: 'right',
    });
    expect(result.success).toBe(false);
  });
});
