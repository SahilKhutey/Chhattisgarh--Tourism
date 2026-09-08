import { SuggestionService } from '../suggestion.service';
import { createMockPrisma } from '../../../../../test/test-helpers';

describe('SuggestionService', () => {
  let service: SuggestionService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new SuggestionService(prisma as any);
  });

  it('returns empty list if query is less than 2 characters', async () => {
    expect(await service.suggest('')).toEqual([]);
    expect(await service.suggest('a')).toEqual([]);
    expect(prisma.contentSearchIndex.findMany).not.toHaveBeenCalled();
  });

  it('queries published items and returns deduplicated suggestions', async () => {
    prisma.contentSearchIndex.findMany.mockResolvedValue([
      { title: 'Chitrakote Waterfalls' },
      { title: 'Chitrakote Camp' },
      { title: 'Chitrakote Waterfalls' }, // duplicate
    ]);

    const res = await service.suggest('chit');

    expect(prisma.contentSearchIndex.findMany).toHaveBeenCalledWith({
      where: {
        entry: {
          status: 'PUBLISHED',
        },
        title: {
          contains: 'chit',
          mode: 'insensitive',
        },
      },
      select: {
        title: true,
      },
      take: 16,
    });

    expect(res).toEqual(['Chitrakote Waterfalls', 'Chitrakote Camp']);
  });

  it('respects requested limit', async () => {
    prisma.contentSearchIndex.findMany.mockResolvedValue([
      { title: 'Place 1' },
      { title: 'Place 2' },
      { title: 'Place 3' },
    ]);

    const res = await service.suggest('place', 2);
    expect(res).toHaveLength(2);
  });
});
