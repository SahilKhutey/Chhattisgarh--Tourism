import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ContentEntryService } from './content-entry.service';
import { ContentEntryStatus, ContentTemplateStatus } from './template-types';

describe('ContentEntryService validation & review', () => {
  let service: ContentEntryService;
  let mockPrisma: any;

  const mockPublishedTemplate = {
    id: 'template-id',
    name: 'Destination',
    slug: 'destination',
    status: ContentTemplateStatus.PUBLISHED,
    version: 1,
    publishedVersion: 1,
    fields: [
      {
        key: 'title',
        label: 'Title',
        fieldType: 'TEXT',
        required: true,
        order: 0,
      },
      {
        key: 'altitude',
        label: 'Altitude',
        fieldType: 'NUMBER',
        required: false,
        order: 1,
      },
    ],
  };

  beforeEach(() => {
    mockPrisma = {
      contentTemplate: {
        findUnique: jest.fn().mockResolvedValue(mockPublishedTemplate),
      },
      contentEntry: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };
    service = new ContentEntryService(mockPrisma);
  });

  it('rejects missing required fields', async () => {
    mockPrisma.contentEntry.findUnique.mockResolvedValue(null);

    await expect(
      service.create(
        {
          templateId: 'template-id',
          slug: 'test',
          data: {},
        },
        'creator-id',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects wrong field type', async () => {
    mockPrisma.contentEntry.findUnique.mockResolvedValue(null);

    await expect(
      service.create(
        {
          templateId: 'template-id',
          slug: 'test',
          data: {
            title: 123 as any,
          },
        },
        'creator-id',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('accepts valid data and sets status to PENDING_REVIEW', async () => {
    mockPrisma.contentEntry.findUnique.mockResolvedValue(null);
    mockPrisma.contentEntry.create.mockResolvedValue({
      id: 'entry-1',
      templateId: 'template-id',
      slug: 'valid-entry',
      status: ContentEntryStatus.PENDING_REVIEW,
      data: { title: 'Achanakmar' },
    });

    const result = await service.create(
      {
        templateId: 'template-id',
        slug: 'valid-entry',
        data: { title: 'Achanakmar' },
      },
      'creator-id',
    );

    expect(result.status).toBe(ContentEntryStatus.PENDING_REVIEW);
    expect(mockPrisma.contentEntry.create).toHaveBeenCalled();
  });

  it('allows moderator to approve entry to PUBLISHED', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'MODERATOR' });
    mockPrisma.contentEntry.findUnique.mockResolvedValue({
      id: 'entry-1',
      status: ContentEntryStatus.PENDING_REVIEW,
    });
    mockPrisma.contentEntry.update.mockResolvedValue({
      id: 'entry-1',
      status: ContentEntryStatus.PUBLISHED,
    });

    const result = await service.review(
      'entry-1',
      'moderator-1',
      'PUBLISH',
      'Verified location',
    );

    expect(result.status).toBe(ContentEntryStatus.PUBLISHED);
    expect(mockPrisma.contentEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: ContentEntryStatus.PUBLISHED,
          reviewedBy: 'moderator-1',
        }),
      }),
    );
  });

  it('rejects review by non-moderator role', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'USER' });

    await expect(
      service.review('entry-1', 'user-1', 'PUBLISH'),
    ).rejects.toThrow(ForbiddenException);
  });
});
