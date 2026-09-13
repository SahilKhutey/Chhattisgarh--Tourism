import { RankingService } from '../ranking.service';

describe('RankingService', () => {
  let service: RankingService;

  beforeEach(() => {
    service = new RankingService();
  });

  describe('score (legacy)', () => {
    it('returns 0 for empty or whitespace query', () => {
      expect(service.score('', { searchableText: 'anything' })).toBe(0);
      expect(service.score('   ', { searchableText: 'anything' })).toBe(0);
    });

    it('scores exact title match highest (100+)', () => {
      const score = service.score('Chitrakote', {
        title: 'Chitrakote',
        searchableText: 'Chitrakote waterfalls',
      });
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

  describe('rank (deterministic Phase 3)', () => {
    it('ranks exact name highest', () => {
      const result = service.rank(
        [
          { id: '1', name: 'Bastar', slug: 'bastar' },
          { id: '2', name: 'Bastar Palace', slug: 'bastar-palace' },
        ],
        'Bastar',
      );

      expect(result[0].id).toBe('1');
      expect(result[0].score).toBe(100);
    });

    it('ranks prefix above contains', () => {
      const result = service.rank(
        [
          { id: '1', name: 'Waterfall Chitrakote', slug: 'x' },
          { id: '2', name: 'Chitrakote Waterfall', slug: 'y' },
        ],
        'Chitrakote',
      );

      expect(result[0].id).toBe('2');
      expect(result[0].score).toBe(80);
      expect(result[1].id).toBe('1');
      expect(result[1].score).toBe(60);
    });

    it('ranks exact slug match with 100 points', () => {
      const result = service.rank(
        [
          { id: '1', name: 'Some Name', slug: 'chitrakote-falls' },
          { id: '2', name: 'Other Name', slug: 'other-slug' },
        ],
        'chitrakote-falls',
      );

      expect(result[0].id).toBe('1');
      expect(result[0].score).toBeGreaterThanOrEqual(100);
    });

    it('applies geographic score based on distance decay', () => {
      const result = service.rank([
        { id: '1', name: 'Place A', slug: 'a', distanceMeters: 1000 },
        { id: '2', name: 'Place B', slug: 'b', distanceMeters: 20000 },
      ]);

      expect(result[0].id).toBe('1');
      expect(result[0].score).toBe(29); // 30 - 1 = 29
      expect(result[1].id).toBe('2');
      expect(result[1].score).toBe(10); // 30 - 20 = 10
    });
  });
});
