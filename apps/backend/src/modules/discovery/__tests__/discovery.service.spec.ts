import { DiscoveryService } from '../discovery.service';
import { RankingService } from '../ranking/ranking.service';

describe('DiscoveryService', () => {
  let service: DiscoveryService;
  let repository: any;
  let indexer: any;
  let ranking: RankingService;
  let suggestions: any;

  beforeEach(() => {
    repository = {
      search: jest.fn(),
      findNearby: jest.fn(),
      findInBounds: jest.fn(),
    };
    indexer = {
      indexEntry: jest.fn(),
      removeEntry: jest.fn(),
      rebuild: jest.fn(),
    };
    ranking = new RankingService();
    suggestions = {
      suggest: jest.fn(),
    };

    service = new DiscoveryService(repository, indexer, ranking, suggestions);
  });

  describe('search', () => {
    it('returns formatted results and applies ranking when query is present', async () => {
      repository.search.mockResolvedValue({
        items: [
          {
            title: 'Waterfalls of Bastar',
            searchableText: 'General description',
            templateId: 'tpl-1',
            entry: {
              id: 'e1',
              slug: 'waterfalls-of-bastar',
              template: { name: 'Destination', slug: 'destination' },
              data: { title: 'Waterfalls of Bastar' },
            },
            region: 'Bastar',
            publishedAt: new Date(),
          },
          {
            title: 'Water',
            searchableText: 'Pure water stream',
            templateId: 'tpl-1',
            entry: {
              id: 'e2',
              slug: 'water',
              template: { name: 'Destination', slug: 'destination' },
              data: { title: 'Water' },
            },
            region: 'Raipur',
            publishedAt: new Date(),
          },
        ],
        total: 2,
      });

      const res = await service.search({
        q: 'Water',
        page: 1,
        limit: 10,
      });

      expect(res.items).toHaveLength(2);
      // Exact match "Water" should be ranked higher than "Waterfalls of Bastar"
      expect(res.items[0].slug).toBe('water');
      expect(res.items[1].slug).toBe('waterfalls-of-bastar');
      expect(res.pagination.total).toBe(2);
      expect(res.filters.query).toBe('Water');
    });

    it('handles empty results', async () => {
      repository.search.mockResolvedValue({ items: [], total: 0 });
      const res = await service.search({ page: 1, limit: 10 });
      expect(res.items).toHaveLength(0);
      expect(res.pagination.totalPages).toBe(0);
    });
  });

  describe('nearby', () => {
    it('maps nearby items to DiscoveryResult array', async () => {
      repository.findNearby.mockResolvedValue([
        {
          templateId: 'tpl-1',
          title: 'Nearby Camp',
          entry: {
            id: 'e-nearby',
            slug: 'nearby-camp',
            template: { name: 'Camp', slug: 'camp' },
            data: { title: 'Nearby Camp' },
          },
          lat: 19.2,
          lng: 81.7,
        },
      ]);

      const res = await service.nearby(19.2, 81.7, 20, 10);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('e-nearby');
      expect(res[0].templateName).toBe('Camp');
    });
  });

  describe('bounds', () => {
    it('maps in-bounds items to DiscoveryResult array', async () => {
      repository.findInBounds.mockResolvedValue([
        {
          templateId: 'tpl-1',
          title: 'Park In Bounds',
          entry: {
            id: 'e-park',
            slug: 'park-in-bounds',
            template: { name: 'Park', slug: 'park' },
            data: { title: 'Park In Bounds' },
          },
          lat: 20.0,
          lng: 82.0,
        },
      ]);

      const res = await service.bounds(22, 18, 84, 80, 50);
      expect(res).toHaveLength(1);
      expect(res[0].slug).toBe('park-in-bounds');
    });
  });

  describe('suggest and rebuild', () => {
    it('delegates suggest to SuggestionService', async () => {
      suggestions.suggest.mockResolvedValue(['suggestion-1']);
      const res = await service.suggest('sugg');
      expect(res).toEqual(['suggestion-1']);
      expect(suggestions.suggest).toHaveBeenCalledWith('sugg', 8);
    });

    it('delegates rebuild to DiscoveryIndexerService', async () => {
      indexer.rebuild.mockResolvedValue({ processed: 5, indexed: 5, failed: 0 });
      const res = await service.rebuild();
      expect(res.processed).toBe(5);
      expect(indexer.rebuild).toHaveBeenCalled();
    });
  });
});
