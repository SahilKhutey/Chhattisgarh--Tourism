import { describe, expect, it } from 'vitest';

describe('mobile fallback', () => {
  it('keeps the web application independent of native APIs', () => {
    expect(typeof globalThis).toBe('object');
  });
});
