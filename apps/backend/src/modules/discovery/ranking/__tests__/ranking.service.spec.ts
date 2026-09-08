import { RankingService } from '../ranking.service';

describe('RankingService', () => {
  let service: RankingService;

  beforeEach(() => {
    service = new RankingService();
  });

  it('returns 0 for empty or whitespace query', () => {
    expect(service.score('', { searchableText: 'anything' })).toBe(0);
    expect(service.score('   ', { searchableText: 'anything' })).toBe(0);
  });

  it('scores exact title match highest (100+)', () => {
    const score = service.score('Chitrakote', {
      title: 'Chitrakote',
      searchableText: 'Chitrakote waterfalls',
    });
    // 100 (exact) + 25 (text contains) = 125
    expect(score).toBeGreaterThanOrEqual(100);
  });

  it('scores title prefix higher than non-prefix substring', () => {
    const prefixScore = service.score('water', {
      title: 'Waterfalls of Bastar',
      searchableText: 'description',
    });
    const containsScore = service.score('water', {
      title: 'Majestic Waterfalls',
      searchableText: 'description',
    });

    expect(prefixScore).toBeGreaterThan(containsScore);
  });

  it('awards score for tag match', () => {
    const scoreWithTag = service.score('tribal', {
      title: 'Bastar Market',
      searchableText: 'Local village market',
      tags: ['tribal', 'culture'],
    });
    const scoreWithoutTag = service.score('tribal', {
      title: 'Bastar Market',
      searchableText: 'Local village market',
      tags: ['market'],
    });

    expect(scoreWithTag - scoreWithoutTag).toBe(40);
  });

  it('awards score for searchable text match', () => {
    const score = service.score('gond', {
      title: 'Artisan Workshop',
      searchableText: 'Traditional Gond painting craft',
    });

    expect(score).toBe(25);
  });
});
