import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let repository: { search: jest.Mock };
  let ranking: { rank: jest.Mock };
  let redis: { get: jest.Mock; set: jest.Mock };
  let analytics: { track: jest.Mock };

  beforeEach(() => {
    repository = { search: jest.fn() };
    ranking = { rank: jest.fn() };
    redis = { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) };
    analytics = { track: jest.fn().mockResolvedValue(undefined) };

    service = new SearchService(
      repository as any,
      ranking as any,
      redis as any,
      analytics as any,
    );
  });

  it('searches repository and ranks results on cache miss', async () => {
    const mockCandidates = [{ id: '1', name: 'Chitrakote Waterfall', slug: 'chitrakote' }];
    const mockRanked = [{ id: '1', name: 'Chitrakote Waterfall', slug: 'chitrakote', score: 100 }];

    repository.search.mockResolvedValue(mockCandidates);
    ranking.rank.mockReturnValue(mockRanked);

    const result = await service.search({ q: 'Chitrakote' });

    expect(repository.search).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'Chitrakote' }),
    );
    expect(ranking.rank).toHaveBeenCalledWith(mockCandidates, 'Chitrakote');
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining('discovery:search:'),
      expect.objectContaining({ data: mockRanked, total: 1 }),
      300,
    );
    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'search_performed' }),
    );
    expect(result.data).toEqual(mockRanked);
    expect(result.total).toBe(1);
  });

  it('returns cached results when present in Redis', async () => {
    const cachedData = {
      data: [{ id: '1', name: 'Cached Waterfall', slug: 'cached', score: 100 }],
      total: 1,
      limit: 20,
      offset: 0,
    };
    redis.get.mockResolvedValue(cachedData);

    const result = await service.search({ q: 'Cached' });

    expect(redis.get).toHaveBeenCalledWith(expect.stringContaining('discovery:search:'));
    expect(repository.search).not.toHaveBeenCalled();
    expect(result).toEqual(cachedData);
  });
});
