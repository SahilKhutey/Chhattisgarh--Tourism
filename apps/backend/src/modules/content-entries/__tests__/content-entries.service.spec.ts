import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ContentEntriesService } from '../content-entries.service';
import { TemplateValidatorService } from '../../content-templates/template-validator.service';
import { createMockPrisma } from '../../../../test/test-helpers';
import { EntryStatus, FieldType } from '@prisma/client';

describe('ContentEntriesService', () => {
  let service: ContentEntriesService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let validator: TemplateValidatorService;
  let spatial: {
    setEntryLocation: jest.Mock;
    clearEntryLocation: jest.Mock;
  };

  beforeEach(() => {
    prisma = createMockPrisma();
    validator = new TemplateValidatorService();
    spatial = {
      setEntryLocation: jest.fn().mockResolvedValue(undefined),
      clearEntryLocation: jest.fn().mockResolvedValue(undefined),
    };
    service = new ContentEntriesService(prisma as any, validator, spatial as any);
  });

  const mockPublishedTemplate = {
    id: 'tpl-destination',
    name: 'Destination',
    slug: 'destination',
    status: 'PUBLISHED',
    version: 1,
    fields: [
      {
        id: 'f-title',
        templateId: 'tpl-destination',
        key: 'title',
        label: 'Destination Name',
        fieldType: FieldType.TEXT,
        required: true,
        order: 0,
        options: null,
        translatable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'f-geo',
        templateId: 'tpl-destination',
        key: 'location',
        label: 'Location',
        fieldType: FieldType.GEO_POINT,
        required: true,
        order: 1,
        options: null,
        translatable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'f-district',
        templateId: 'tpl-destination',
        key: 'district',
        label: 'District',
        fieldType: FieldType.TEXT,
        required: false,
        order: 2,
        options: null,
        translatable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  describe('create', () => {
    it('creates an entry, auto-extracts lat/lng/region, and synchronizes PostGIS location', async () => {
      prisma.contentTemplate.findUnique.mockResolvedValue(mockPublishedTemplate);
      prisma.contentEntry.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'entry-1',
          ...data,
          template: {
            id: mockPublishedTemplate.id,
            name: mockPublishedTemplate.name,
            slug: mockPublishedTemplate.slug,
            icon: null,
          },
        }),
      );

      const result = await service.create(
        {
          templateId: 'tpl-destination',
          data: {
            title: 'Chitrakote Falls',
            location: { lat: 19.201, lng: 81.706 },
            district: 'Bastar',
          },
        },
        'creator-1',
      );

      expect(prisma.contentEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            templateId: 'tpl-destination',
            authorId: 'creator-1',
            latitude: 19.201,
            longitude: 81.706,
            region: 'Bastar',
            status: EntryStatus.PENDING_REVIEW,
          }),
        }),
      );
      // Verify PostGIS spatial synchronization
      expect(spatial.setEntryLocation).toHaveBeenCalledWith('entry-1', 19.201, 81.706);
      expect(result.id).toBe('entry-1');
    });

    it('throws NotFoundException if template does not exist', async () => {
      prisma.contentTemplate.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          {
            templateId: 'invalid-id',
            data: { title: 'Test' },
          },
          'creator-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if template is not PUBLISHED', async () => {
      prisma.contentTemplate.findUnique.mockResolvedValue({
        ...mockPublishedTemplate,
        status: 'DRAFT',
      });

      await expect(
        service.create(
          {
            templateId: 'tpl-destination',
            data: { title: 'Test' },
          },
          'creator-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws validation error if required fields are missing', async () => {
      prisma.contentTemplate.findUnique.mockResolvedValue(mockPublishedTemplate);

      await expect(
        service.create(
          {
            templateId: 'tpl-destination',
            data: {
              // missing 'title' and 'location'
              district: 'Bastar',
            },
          },
          'creator-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('returns paginated entries with metadata', async () => {
      prisma.contentEntry.count.mockResolvedValue(1);
      prisma.contentEntry.findMany.mockResolvedValue([
        {
          id: 'entry-1',
          data: { title: 'Tirathgarh' },
          status: EntryStatus.PUBLISHED,
        },
      ]);

      const res = await service.findAll({
        status: EntryStatus.PUBLISHED,
        page: 1,
        limit: 10,
      });

      expect(res.data).toHaveLength(1);
      expect(res.meta.total).toBe(1);
      expect(res.meta.totalPages).toBe(1);
    });
  });

  describe('findById', () => {
    it('returns entry with template if found', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        data: { title: 'Tirathgarh' },
        template: mockPublishedTemplate,
      });

      const res = await service.findById('entry-1');
      expect(res.id).toBe('entry-1');
    });

    it('throws NotFoundException if not found', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('review', () => {
    it('moderator approves and publishes entry', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        status: EntryStatus.PENDING_REVIEW,
      });
      prisma.contentEntry.update.mockResolvedValue({
        id: 'entry-1',
        status: EntryStatus.PUBLISHED,
        reviewedBy: 'mod-1',
        reviewNote: 'Looks great!',
      });

      const res = await service.review(
        'entry-1',
        {
          status: EntryStatus.PUBLISHED,
          reviewNote: 'Looks great!',
        },
        'mod-1',
      );

      expect(prisma.contentEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'entry-1' },
          data: {
            status: EntryStatus.PUBLISHED,
            reviewedBy: 'mod-1',
            reviewNote: 'Looks great!',
          },
        }),
      );
      expect(res.status).toBe(EntryStatus.PUBLISHED);
    });
  });

  describe('permissions (update & delete)', () => {
    it('allows author to update their draft and synchronizes coordinates', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        authorId: 'creator-1',
        templateId: 'tpl-destination',
        status: EntryStatus.DRAFT,
      });
      prisma.contentTemplate.findUnique.mockResolvedValue(mockPublishedTemplate);
      prisma.contentEntry.update.mockResolvedValue({ id: 'entry-1' });

      await expect(
        service.update(
          'entry-1',
          {
            data: { title: 'Updated Chitrakote', location: { lat: 19.2, lng: 81.7 } },
            lat: 19.2,
            lng: 81.7,
          },
          'creator-1',
          'CREATOR',
        ),
      ).resolves.toBeDefined();

      expect(spatial.setEntryLocation).toHaveBeenCalledWith('entry-1', 19.2, 81.7);
    });

    it('rejects another user from updating entry', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        authorId: 'creator-1',
        templateId: 'tpl-destination',
      });

      await expect(
        service.update(
          'entry-1',
          { data: { title: 'Hacked' } },
          'random-user',
          'USER',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to delete any entry', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        authorId: 'creator-1',
      });
      prisma.contentEntry.delete.mockResolvedValue({ id: 'entry-1' });

      await expect(
        service.delete('entry-1', 'admin-id', 'ADMIN'),
      ).resolves.toBeDefined();
    });
  });
});
