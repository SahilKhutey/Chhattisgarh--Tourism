import { NotFoundException } from '@nestjs/common';
import { PublicContentController } from '../public-content.controller';

describe('PublicContentController', () => {
  let controller: PublicContentController;
  let mockContentService: any;

  beforeEach(() => {
    mockContentService = {
      findPublicBySlug: jest.fn(),
    };
    controller = new PublicContentController(mockContentService);
  });

  it('returns canonical public content payload when found', async () => {
    const publishedDate = new Date('2026-09-08T12:00:00.000Z');
    mockContentService.findPublicBySlug.mockResolvedValue({
      id: 'entry-123',
      slug: 'chitrakote-falls',
      data: {
        title: 'Chitrakote Waterfalls',
        description: 'Spectacular horseshoe falls on Indravati River',
      },
      region: 'Bastar',
      division: 'Bastar Division',
      district: 'Bastar',
      lat: 19.201,
      lng: 81.701,
      publishedAt: publishedDate,
      template: {
        id: 'tpl-destination',
        name: 'Destination',
        slug: 'destination',
        version: 1,
        fields: [
          {
            key: 'title',
            label: 'Title',
            fieldType: 'TEXT',
            required: true,
            order: 0,
          },
        ],
      },
    });

    const result = await controller.getContent('destination', 'chitrakote-falls');

    expect(mockContentService.findPublicBySlug).toHaveBeenCalledWith(
      'destination',
      'chitrakote-falls',
    );
    expect(result).toEqual({
      id: 'entry-123',
      title: 'Chitrakote Waterfalls',
      slug: 'chitrakote-falls',
      data: {
        title: 'Chitrakote Waterfalls',
        description: 'Spectacular horseshoe falls on Indravati River',
      },
      region: 'Bastar',
      division: 'Bastar Division',
      district: 'Bastar',
      lat: 19.201,
      lng: 81.701,
      publishedAt: publishedDate,
      template: {
        id: 'tpl-destination',
        name: 'Destination',
        slug: 'destination',
        version: 1,
        fields: [
          {
            key: 'title',
            label: 'Title',
            fieldType: 'TEXT',
            required: true,
            order: 0,
          },
        ],
      },
    });
  });

  it('falls back to name property if title is absent', async () => {
    mockContentService.findPublicBySlug.mockResolvedValue({
      id: 'entry-festival-1',
      slug: 'bastar-dussehra',
      data: {
        name: 'Bastar Dussehra Festival',
      },
      template: {
        id: 'tpl-fest',
        name: 'Festival',
        slug: 'festival',
        version: 2,
        fields: [],
      },
    });

    const result = await controller.getContent('festival', 'bastar-dussehra');
    expect(result.title).toBe('Bastar Dussehra Festival');
  });

  it('falls back to Untitled when neither title nor name exists', async () => {
    mockContentService.findPublicBySlug.mockResolvedValue({
      id: 'entry-folklore-1',
      slug: 'turturiya-legend',
      data: {
        story: 'Ancient legend...',
      },
      template: {
        id: 'tpl-folklore',
        name: 'Folklore',
        slug: 'folklore',
        version: 1,
        fields: [],
      },
    });

    const result = await controller.getContent('folklore', 'turturiya-legend');
    expect(result.title).toBe('Untitled');
  });

  it('throws NotFoundException when entry is not found', async () => {
    mockContentService.findPublicBySlug.mockResolvedValue(null);

    await expect(
      controller.getContent('destination', 'unknown-place'),
    ).rejects.toThrow(NotFoundException);
  });
});
