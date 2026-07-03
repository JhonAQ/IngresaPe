import { helloSchema } from './domain';

describe('domain', () => {
  it('should validate hello schema', () => {
    const result = helloSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = helloSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});
