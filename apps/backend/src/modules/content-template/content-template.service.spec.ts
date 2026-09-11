import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ContentTemplateService } from './content-template.service';
import { ContentTemplateStatus } from './template-types';

describe('ContentTemplateService', () => {
  let service: ContentTemplateService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      contentTemplate: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      contentEntry: {
        count: jest.fn(),
      },
      templateVersion: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      templateField: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => cb(mockPrisma)),
    };
    service = new ContentTemplateService(mockPrisma);
  });

  it('creates a template', async () => {
    mockPrisma.contentTemplate.findUnique.mockResolvedValue(null);
    mockPrisma.contentTemplate.create.mockResolvedValue({
      id: 'tpl-fest',
      name: 'Festival',
      slug: 'festival',
      fields: [
        {
          key: 'title',
          label: 'Festival Name',
          fieldType: 'TEXT',
          required: true,
          order: 0,
        },
      ],
    });

    const result = await service.create(
      {
        name: 'Festival',
        slug: 'festival',
        fields: [
          {
            key: 'title',
            label: 'Festival Name',
            fieldType: 'TEXT',
            required: true,
            order: 0,
          },
        ],
      },
      'admin-id',
    );

    expect(result.name).toBe('Festival');
    expect(result.fields).toHaveLength(1);
    expect(mockPrisma.contentTemplate.create).toHaveBeenCalled();
  });

  it('rejects duplicate slugs', async () => {
    mockPrisma.contentTemplate.findUnique.mockResolvedValue({
      id: 'existing-id',
      slug: 'festival',
    });

    await expect(
      service.create(
        {
          name: 'Festival',
          slug: 'festival',
          fields: [],
        },
        'admin-id',
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('publishes a template and creates an immutable snapshot version', async () => {
    mockPrisma.contentTemplate.findUnique.mockResolvedValue({
      id: 'tpl-fest',
      name: 'Festival',
      slug: 'festival',
      version: 1,
      fields: [
        {
          key: 'title',
          label: 'Festival Name',
          fieldType: 'TEXT',
          required: true,
          order: 0,
          translatable: true,
        },
      ],
    });
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    mockPrisma.contentTemplate.update.mockResolvedValue({
      id: 'tpl-fest',
      status: ContentTemplateStatus.PUBLISHED,
      version: 2,
      publishedVersion: 2,
    });

    const published = await service.publish('tpl-fest', 'admin-id');

    expect(mockPrisma.templateVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          templateId: 'tpl-fest',
          version: 2,
        }),
      }),
    );
    expect(published.status).toBe(ContentTemplateStatus.PUBLISHED);
    expect(published.version).toBe(2);
  });

  it('rejects publish if user is not an administrator', async () => {
    mockPrisma.contentTemplate.findUnique.mockResolvedValue({
      id: 'tpl-fest',
      version: 1,
      fields: [],
    });
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'USER' });

    await expect(service.publish('tpl-fest', 'regular-user')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rolls back to an earlier published template snapshot without mutating entries', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    mockPrisma.templateVersion.findUnique.mockResolvedValue({
      id: 'v1',
      templateId: 'tpl-fest',
      version: 1,
    });
    mockPrisma.contentTemplate.update.mockResolvedValue({
      id: 'tpl-fest',
      publishedVersion: 1,
    });

    const result = await service.rollback('tpl-fest', 1, 'admin-id');
    expect(result.publishedVersion).toBe(1);
  });

  it('rejects archiving a template when active published entries exist', async () => {
    mockPrisma.contentTemplate.findUnique.mockResolvedValue({
      id: 'tpl-fest',
      name: 'Festival',
      status: ContentTemplateStatus.PUBLISHED,
    });
    mockPrisma.contentEntry.count.mockResolvedValue(5);

    await expect(service.archive('tpl-fest', 'admin-id')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('allows archiving a template when zero published entries exist', async () => {
    mockPrisma.contentTemplate.findUnique.mockResolvedValue({
      id: 'tpl-fest',
      name: 'Festival',
      status: ContentTemplateStatus.PUBLISHED,
    });
    mockPrisma.contentEntry.count.mockResolvedValue(0);
    mockPrisma.contentTemplate.update.mockResolvedValue({
      id: 'tpl-fest',
      status: ContentTemplateStatus.ARCHIVED,
    });

    const result = await service.archive('tpl-fest', 'admin-id');
    expect(result.status).toBe(ContentTemplateStatus.ARCHIVED);
  });

  it('duplicates a template into a new DRAFT with copy slug', async () => {
    mockPrisma.contentTemplate.findUnique
      .mockResolvedValueOnce({
        id: 'tpl-fest',
        name: 'Festival',
        slug: 'festival',
        fields: [
          {
            key: 'title',
            label: 'Festival Name',
            fieldType: 'TEXT',
            required: true,
            order: 0,
          },
        ],
      })
      .mockResolvedValueOnce(null); // when checking if 'festival-copy' exists

    mockPrisma.contentTemplate.create.mockResolvedValue({
      id: 'tpl-copy-1',
      name: 'Festival (Copy)',
      slug: 'festival-copy',
      status: ContentTemplateStatus.DRAFT,
      fields: [
        {
          key: 'title',
          label: 'Festival Name',
          fieldType: 'TEXT',
          required: true,
          order: 0,
        },
      ],
    });

    const duplicated = await service.duplicate('tpl-fest', 'admin-id');
    expect(duplicated.name).toBe('Festival (Copy)');
    expect(duplicated.status).toBe(ContentTemplateStatus.DRAFT);
  });

  it('computes upgrade risk diff between template versions', async () => {
    mockPrisma.templateVersion.findUnique.mockResolvedValue({
      id: 'v2',
      templateId: 'tpl-fest',
      version: 2,
      snapshot: {
        id: 'tpl-fest',
        name: 'Festival',
        slug: 'festival',
        version: 2,
        fields: [
          { key: 'title', label: 'Festival Name', fieldType: 'TEXT', required: true, order: 0 },
          { key: 'district', label: 'District', fieldType: 'TEXT', required: true, order: 1 },
        ],
      },
    });

    mockPrisma.templateVersion.findFirst.mockResolvedValue({
      id: 'v1',
      templateId: 'tpl-fest',
      version: 1,
      snapshot: {
        id: 'tpl-fest',
        name: 'Festival',
        slug: 'festival',
        version: 1,
        fields: [
          { key: 'title', label: 'Festival Name', fieldType: 'TEXT', required: true, order: 0 },
        ],
      },
    });

    const diff = await service.getVersionDiff('tpl-fest', 2);
    expect(diff.riskLevel).toBe('BREAKING');
    expect(diff.breakingChanges.length).toBe(1);
    expect(diff.breakingChanges[0].key).toBe('district');
  });
});
