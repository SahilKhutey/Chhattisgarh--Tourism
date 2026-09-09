import { TemplateAccessService } from './template-access.service';
import { ContentTemplateStatus, ContentEntryStatus } from './template-types';
import { NotFoundException } from '@nestjs/common';

describe('ContentTemplate Relation Scoping (Security Integration)', () => {
  let accessService: TemplateAccessService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      contentTemplate: {
        findUnique: jest.fn(),
      },
      contentEntry: {
        findMany: jest.fn(),
      },
    };
    accessService = new TemplateAccessService(mockPrisma);
  });

  it('only returns published entries from published target templates', async () => {
    mockPrisma.contentTemplate.findUnique.mockResolvedValue({
      id: 'tpl-story',
      status: ContentTemplateStatus.PUBLISHED,
    });
    mockPrisma.contentEntry.findMany.mockResolvedValue([
      {
        id: 'entry-story-1',
        slug: 'bastaria-dussehra-legend',
        data: { title: 'Dussehra Legend' },
        publishedAt: new Date(),
      },
    ]);

    const candidates = await accessService.findPublishedRelationCandidates('tribal-story');

    expect(mockPrisma.contentEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          templateId: 'tpl-story',
          status: ContentEntryStatus.PUBLISHED,
        },
      }),
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].slug).toBe('bastaria-dussehra-legend');
  });

  it('rejects candidate discovery when target template is not published', async () => {
    mockPrisma.contentTemplate.findUnique.mockResolvedValue({
      id: 'tpl-draft',
      status: ContentTemplateStatus.DRAFT,
    });

    await expect(
      accessService.findPublishedRelationCandidates('draft-template'),
    ).rejects.toThrow(NotFoundException);
  });
});
