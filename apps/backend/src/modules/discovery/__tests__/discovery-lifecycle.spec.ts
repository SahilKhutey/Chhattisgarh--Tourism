import { ContentService } from '../../content/content.service';
import { EntryValidatorService } from '../../content/validators/entry-validator.service';
import { SlugService } from '../../content/slug/slug.service';
import { DiscoveryIndexerService } from '../indexer/discovery-indexer.service';
import { DiscoveryRepository } from '../discovery.repository';
import { DiscoveryService } from '../discovery.service';
import { RankingService } from '../ranking/ranking.service';
import { SuggestionService } from '../suggestions/suggestion.service';
import { createMockPrisma } from '../../../../test/test-helpers';
import { EntryStatus, FieldType } from '@prisma/client';

describe('Discovery Lifecycle Integration', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let contentService: ContentService;
  let indexerService: DiscoveryIndexerService;
  let discoveryService: DiscoveryService;
  let repository: DiscoveryRepository;
  let ranking: RankingService;
  let suggestions: SuggestionService;

  const mockTemplate = {
    id: 'tpl-festival',
    name: 'Festival',
    slug: 'festival',
    status: 'PUBLISHED',
    version: 1,
    fields: [
      { key: 'title', label: 'Festival Name', fieldType: FieldType.TEXT, required: true, order: 0 },
      { key: 'description', label: 'Story', fieldType: FieldType.RICHTEXT, required: false, order: 1 },
      { key: 'tags', label: 'Tags', fieldType: FieldType.TAGS, required: false, order: 2 },
    ],
  };

  beforeEach(() => {
    prisma = createMockPrisma();
    indexerService = new DiscoveryIndexerService(prisma as any);
    repository = new DiscoveryRepository(prisma as any);
    ranking = new RankingService();
    suggestions = new SuggestionService(prisma as any);
    discoveryService = new DiscoveryService(repository, indexerService, ranking, suggestions);

    contentService = new ContentService(
      prisma as any,
      new EntryValidatorService(),
      new SlugService(),
      undefined,
      indexerService,
    );
  });

  it('indexes entry upon moderator approval and removes it upon rejection', async () => {
    // 1. Entry is pending review
    const pendingEntry = {
      id: 'entry-bastar-dussehra',
      templateId: 'tpl-festival',
      status: EntryStatus.PENDING_REVIEW,
      slug: 'bastar-dussehra',
      data: {
        title: 'Bastar Dussehra',
        description: '75-day world-famous tribal celebration in Jagdalpur.',
        tags: ['festival', 'tribal', 'bastar'],
      },
      region: 'Bastar',
      district: 'Bastar',
      division: 'Bastar',
      lat: 19.07,
      lng: 82.02,
      publishedAt: null,
      template: mockTemplate,
    };

    const publishedEntry = {
      ...pendingEntry,
      status: EntryStatus.PUBLISHED,
      publishedAt: new Date(),
    };

    // First call is in contentService.review to check status (PENDING_REVIEW)
    // Second call is in indexerService.indexEntry to get the published entry
    prisma.contentEntry.findUnique
      .mockResolvedValueOnce(pendingEntry)
      .mockResolvedValueOnce(publishedEntry);

    prisma.contentEntry.update.mockResolvedValue(publishedEntry);
    prisma.contentSearchIndex.upsert.mockResolvedValue({ id: 'idx-1' });

    // 2. Moderator approves
    await contentService.review('entry-bastar-dussehra', 'mod-1', true, 'Approved for publishing');

    // Verify indexer was called and search index upsert occurred
    expect(prisma.contentSearchIndex.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entryId: 'entry-bastar-dussehra' },
        create: expect.objectContaining({
          entryId: 'entry-bastar-dussehra',
          title: 'Bastar Dussehra',
          tags: ['festival', 'tribal', 'bastar'],
        }),
      }),
    );

    // 3. Now moderator rejects or revokes approval
    prisma.contentEntry.findUnique.mockResolvedValue({
      ...pendingEntry,
      status: EntryStatus.PENDING_REVIEW,
    });
    prisma.contentEntry.update.mockResolvedValue({
      ...pendingEntry,
      status: EntryStatus.REJECTED,
      publishedAt: null,
    });
    prisma.contentSearchIndex.deleteMany.mockResolvedValue({ count: 1 });

    await contentService.review('entry-bastar-dussehra', 'mod-1', false, 'Violates guidelines');

    // Verify search index was purged
    expect(prisma.contentSearchIndex.deleteMany).toHaveBeenCalledWith({
      where: { entryId: 'entry-bastar-dussehra' },
    });
  });
});
