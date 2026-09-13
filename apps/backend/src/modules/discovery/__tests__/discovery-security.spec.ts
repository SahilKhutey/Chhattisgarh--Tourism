import { SearchRepository } from '../search/search.repository';
import { GeoService } from '../geo/geo.service';

describe('Discovery Public Data Security Gate', () => {
  let searchRepo: SearchRepository;
  let geoService: GeoService;
  let prisma: { $queryRaw: jest.Mock };
  let redis: { get: jest.Mock; set: jest.Mock };

  beforeEach(() => {
    prisma = { $queryRaw: jest.fn() };
    redis = { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) };
    searchRepo = new SearchRepository(prisma as any);
    geoService = new GeoService(prisma as any, redis as any);
  });

  it('Search query enforces PUBLISHED and PUBLIC filters', async () => {
    prisma.$queryRaw.mockResolvedValue([
      { id: 'published-1', name: 'Published Place', slug: 'pub', status: 'PUBLISHED', visibility: 'PUBLIC' },
    ]);

    await searchRepo.search({ query: 'Bastar' });

    expect(prisma.$queryRaw).toHaveBeenCalled();
    const queryCall = prisma.$queryRaw.mock.calls[0];
    const queryStrings = queryCall[0].join(' ');

    expect(queryStrings).toContain("p.status = 'PUBLISHED'");
    expect(queryStrings).toContain("p.visibility = 'PUBLIC'");
  });

  it('Nearby query strictly enforces status = PUBLISHED and visibility = PUBLIC', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    await geoService.nearby(21.25, 81.63, 10000);

    expect(prisma.$queryRaw).toHaveBeenCalled();
    const queryCall = prisma.$queryRaw.mock.calls[0];
    const queryStrings = queryCall[0].join(' ');

    expect(queryStrings).toContain("p.status = 'PUBLISHED'");
    expect(queryStrings).toContain("p.visibility = 'PUBLIC'");
  });

  it('Map viewport query strictly enforces status = PUBLISHED and visibility = PUBLIC', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    await geoService.mapViewport(22.0, 20.0, 83.0, 81.0, 8);

    expect(prisma.$queryRaw).toHaveBeenCalled();
    const queryCall = prisma.$queryRaw.mock.calls[0];
    const queryStrings = queryCall[0].join(' ');

    expect(queryStrings).toContain("p.status = 'PUBLISHED'");
    expect(queryStrings).toContain("p.visibility = 'PUBLIC'");
    // Ensure draft bypass parameter is impossible
    expect(queryStrings).not.toContain('includeDraft');
  });
});
