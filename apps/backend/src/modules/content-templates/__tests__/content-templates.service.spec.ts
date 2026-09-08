import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContentTemplatesService } from '../content-templates.service';
import { createMockPrisma } from '../../../../test/test-helpers';
import { FieldType } from '@prisma/client';

describe('ContentTemplatesService', () => {
  let service: ContentTemplatesService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let redis: {
    get: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
    ping: jest.Mock;
  };

  beforeEach(() => {
    prisma = createMockPrisma();
    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      ping: jest.fn().mockResolvedValue('PONG'),
    };
    service = new ContentTemplatesService(prisma as any, redis as any);
  });

  describe('create', () => {
    it('creates a new content template and invalidates cache', async () => {
      prisma.contentTemplate.findUnique.mockResolvedValue(null);
      prisma.contentTemplate.create.mockResolvedValue({
        id: 'tpl-1',
        name: 'Heritage Site',
        slug: 'heritage-site',
        status: 'DRAFT',
        fields: [],
      });

      const result = await service.create(
        {
          name: 'Heritage Site',
          slug: 'heritage-site',
          description: 'Places of historical significance',
          fields: [
            {
              key: 'title',
              label: 'Title',
              fieldType: FieldType.TEXT,
              required: true,
              order: 0,
            },
          ],
        },
        'user-admin-1',
      );

      expect(prisma.contentTemplate.findUnique).toHaveBeenCalledWith({
        where: { slug: 'heritage-site' },
      });
      expect(prisma.contentTemplate.create).toHaveBeenCalled();
      expect(redis.delete).toHaveBeenCalledWith('content:templates:published');
      expect(result.id).toBe('tpl-1');
    });

    it('throws ConflictException if slug already exists', async () => {
      prisma.contentTemplate.findUnique.mockResolvedValue({
        id: 'existing-tpl',
        slug: 'heritage-site',
      });

      await expect(
        service.create(
          {
            name: 'Heritage Site',
            slug: 'heritage-site',
            fields: [],
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findPublished with Redis caching', () => {
    it('returns cached templates on cache hit without querying database', async () => {
      const cachedTemplates = [{ id: 'tpl-cached', name: 'Cached Waterfalls' }];
      redis.get.mockResolvedValue(cachedTemplates);

      const res = await service.findPublished();
      expect(redis.get).toHaveBeenCalledWith('content:templates:published');
      expect(prisma.contentTemplate.findMany).not.toHaveBeenCalled();
      expect(res).toEqual(cachedTemplates);
    });

    it('queries database and populates Redis cache on cache miss', async () => {
      redis.get.mockResolvedValue(null);
      const dbTemplates = [{ id: 'tpl-db', name: 'DB Waterfalls' }];
      prisma.contentTemplate.findMany.mockResolvedValue(dbTemplates);

      const res = await service.findPublished();
      expect(redis.get).toHaveBeenCalledWith('content:templates:published');
      expect(prisma.contentTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PUBLISHED' } }),
      );
      expect(redis.set).toHaveBeenCalledWith(
        'content:templates:published',
        dbTemplates,
        300,
      );
      expect(res).toEqual(dbTemplates);
    });
  });

  describe('findById', () => {
    it('returns template when found', async () => {
      const mockTpl = { id: 'tpl-1', name: 'Waterfalls', fields: [] };
      prisma.contentTemplate.findUnique.mockResolvedValue(mockTpl);

      const res = await service.findById('tpl-1');
      expect(res).toBe(mockTpl);
    });

    it('throws NotFoundException when template does not exist', async () => {
      prisma.contentTemplate.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('publish', () => {
    it('creates a version snapshot, updates status, and invalidates cache', async () => {
      const mockTpl = {
        id: 'tpl-1',
        name: 'Festivals',
        slug: 'festivals',
        description: 'Tribal festivals of CG',
        version: 1,
        fields: [],
      };
      prisma.contentTemplate.findUnique.mockResolvedValue(mockTpl);
      prisma.$transaction.mockResolvedValue([{}, {}]);

      const res = await service.publish('tpl-1', 'admin-id');
      expect(prisma.templateVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            templateId: 'tpl-1',
            version: 1,
            createdBy: 'admin-id',
          }),
        }),
      );
      expect(prisma.contentTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tpl-1' },
          data: { status: 'PUBLISHED' },
        }),
      );
      expect(redis.delete).toHaveBeenCalledWith('content:templates:published');
      expect(res).toEqual(mockTpl);
    });
  });

  describe('archive', () => {
    it('updates status to ARCHIVED and invalidates cache', async () => {
      prisma.contentTemplate.findUnique.mockResolvedValue({ id: 'tpl-1' });
      prisma.contentTemplate.update.mockResolvedValue({
        id: 'tpl-1',
        status: 'ARCHIVED',
      });

      const res = await service.archive('tpl-1');
      expect(prisma.contentTemplate.update).toHaveBeenCalledWith({
        where: { id: 'tpl-1' },
        data: { status: 'ARCHIVED' },
      });
      expect(redis.delete).toHaveBeenCalledWith('content:templates:published');
      expect(res.status).toBe('ARCHIVED');
    });
  });
});
