import { DiscoveryIndexerService } from '../discovery-indexer.service';
import { createMockPrisma } from '../../../../../test/test-helpers';
import { FieldType } from '@prisma/client';

describe('DiscoveryIndexerService', () => {
  let service: DiscoveryIndexerService;
  let prisma: ReturnType<typeof createMockPrisma>;

  const mockPublishedTemplate = {
    id: 'tpl-destination',
    name: 'Destination',
    slug: 'destination',
    fields: [
      { key: 'title', label: 'Title', fieldType: FieldType.TEXT, order: 0 },
      { key: 'description', label: 'Description', fieldType: FieldType.RICHTEXT, order: 1 },
      { key: 'tags', label: 'Tags', fieldType: FieldType.TAGS, order: 2 },
      { key: 'location', label: 'Location', fieldType: FieldType.GEO_POINT, order: 3 },
    ],
  };

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new DiscoveryIndexerService(prisma as any);
  });

  it('indexes a published entry with extracted title, searchable text, tags, and coordinates', async () => {
    const publishedAt = new Date('2026-09-08T12:00:00Z');
    prisma.contentEntry.findUnique.mockResolvedValue({
      id: 'entry-1',
      templateId: 'tpl-destination',
      status: 'PUBLISHED',
      slug: 'chitrakote-waterfalls',
      data: {
        title: 'Chitrakote Waterfalls',
        description: 'The Niagara of India located in Bastar.',
        tags: ['waterfall', 'bastar', 'nature'],
        location: { lat: 19.201, lng: 81.701 },
      },
      region: 'Bastar',
      division: 'Bastar',
      district: 'Bastar',
      lat: 19.201,
      lng: 81.701,
      publishedAt,
      template: mockPublishedTemplate,
    });

    prisma.contentSearchIndex.upsert.mockResolvedValue({ id: 'idx-1' });

    await service.indexEntry('entry-1');

    expect(prisma.contentSearchIndex.upsert).toHaveBeenCalledWith({
      where: { entryId: 'entry-1' },
      create: expect.objectContaining({
        entryId: 'entry-1',
        templateId: 'tpl-destination',
        title: 'Chitrakote Waterfalls',
        searchableText: expect.stringContaining('Chitrakote Waterfalls'),
        region: 'Bastar',
        division: 'Bastar',
        district: 'Bastar',
        lat: 19.201,
        lng: 81.701,
        tags: ['waterfall', 'bastar', 'nature'],
        publishedAt,
      }),
      update: expect.objectContaining({
        templateId: 'tpl-destination',
        title: 'Chitrakote Waterfalls',
        searchableText: expect.stringContaining('Chitrakote Waterfalls'),
        lat: 19.201,
        lng: 81.701,
        tags: ['waterfall', 'bastar', 'nature'],
      }),
    });
  });

  it('removes entry from index if status is DRAFT', async () => {
    prisma.contentEntry.findUnique.mockResolvedValue({
      id: 'entry-draft',
      status: 'DRAFT',
      template: mockPublishedTemplate,
    });
    prisma.contentSearchIndex.deleteMany.mockResolvedValue({ count: 1 });

    await service.indexEntry('entry-draft');

    expect(prisma.contentSearchIndex.upsert).not.toHaveBeenCalled();
    expect(prisma.contentSearchIndex.deleteMany).toHaveBeenCalledWith({
      where: { entryId: 'entry-draft' },
    });
  });

  it('removes entry from index if status is REJECTED', async () => {
    prisma.contentEntry.findUnique.mockResolvedValue({
      id: 'entry-rejected',
      status: 'REJECTED',
      template: mockPublishedTemplate,
    });
    prisma.contentSearchIndex.deleteMany.mockResolvedValue({ count: 1 });

    await service.indexEntry('entry-rejected');

    expect(prisma.contentSearchIndex.upsert).not.toHaveBeenCalled();
    expect(prisma.contentSearchIndex.deleteMany).toHaveBeenCalledWith({
      where: { entryId: 'entry-rejected' },
    });
  });

  it('handles entry removal via removeEntry explicitly', async () => {
    prisma.contentSearchIndex.deleteMany.mockResolvedValue({ count: 1 });

    await service.removeEntry('entry-to-delete');

    expect(prisma.contentSearchIndex.deleteMany).toHaveBeenCalledWith({
      where: { entryId: 'entry-to-delete' },
    });
  });

  it('rebuilds entire search index for all published entries', async () => {
    prisma.contentEntry.findMany.mockResolvedValue([
      { id: 'entry-1', templateId: 'tpl-1' },
      { id: 'entry-2', templateId: 'tpl-2' },
    ]);

    // Mock indexEntry internals
    prisma.contentEntry.findUnique
      .mockResolvedValueOnce({
        id: 'entry-1',
        status: 'PUBLISHED',
        templateId: 'tpl-1',
        data: { title: 'Entry 1' },
        template: { fields: [{ key: 'title', fieldType: FieldType.TEXT }] },
      })
      .mockResolvedValueOnce({
        id: 'entry-2',
        status: 'PUBLISHED',
        templateId: 'tpl-2',
        data: { title: 'Entry 2' },
        template: { fields: [{ key: 'title', fieldType: FieldType.TEXT }] },
      });

    prisma.contentSearchIndex.upsert.mockResolvedValue({});

    const stats = await service.rebuild();

    expect(stats).toEqual({
      processed: 2,
      indexed: 2,
      failed: 0,
    });
  });

  it('extracts name or first text field when title field is not explicitly titled title', async () => {
    prisma.contentEntry.findUnique.mockResolvedValue({
      id: 'entry-craft',
      templateId: 'tpl-craft',
      status: 'PUBLISHED',
      data: {
        craftName: 'Dhokra Brass Art',
        history: 'Cast using ancient techniques.',
      },
      template: {
        fields: [
          { key: 'craftName', label: 'Craft Name', fieldType: FieldType.TEXT, order: 0 },
          { key: 'history', label: 'History', fieldType: FieldType.RICHTEXT, order: 1 },
        ],
      },
    });

    prisma.contentSearchIndex.upsert.mockResolvedValue({});

    await service.indexEntry('entry-craft');

    expect(prisma.contentSearchIndex.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          title: 'Dhokra Brass Art',
        }),
      }),
    );
  });
});
