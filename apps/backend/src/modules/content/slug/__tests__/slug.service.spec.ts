import { SlugService } from '../slug.service';

describe('SlugService', () => {
  const service = new SlugService();

  it('creates a URL-safe slug', () => {
    expect(service.generate('Amazing Waterfall!')).toBe('amazing-waterfall');
  });

  it('removes duplicate spaces', () => {
    expect(service.generate('Amazing   Place')).toBe('amazing-place');
  });

  it('handles special characters', () => {
    expect(service.generate('Temple @ Bilaspur')).toBe('temple-bilaspur');
  });
});
