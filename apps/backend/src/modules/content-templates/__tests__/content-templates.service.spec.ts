import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContentTemplatesService } from '../content-templates.service';
import { createMockPrisma } from '../../../../test/test-helpers';
import { FieldType } from '@prisma/client';

describe('ContentTemplatesService', () => {
  let service: ContentTemplatesService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new ContentTemplatesService(prisma as any);
  });

  describe('create', () => {
    it('creates a new content template with fields', async () => {
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
    it('creates a version snapshot and updates status to PUBLISHED', async () => {
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
      expect(res).toEqual(mockTpl);
    });
  });

  describe('archive', () => {
    it('updates status to ARCHIVED', async () => {
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
      expect(res.status).toBe('ARCHIVED');
    });
  });
});
