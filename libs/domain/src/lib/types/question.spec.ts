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
