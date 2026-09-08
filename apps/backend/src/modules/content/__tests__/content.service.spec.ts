import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EntryStatus, AuditAction, FieldType } from '@prisma/client';
import { ContentService } from '../content.service';
import { EntryValidatorService } from '../validators/entry-validator.service';
import { SlugService } from '../slug/slug.service';
import { createMockPrisma } from '../../../../test/test-helpers';

describe('ContentService (Generic Content Engine)', () => {
  let service: ContentService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let validator: EntryValidatorService;
  let slugService: SlugService;

  const mockPublishedTemplate = {
    id: 'tpl-destination',
    name: 'Destination',
    slug: 'destination',
    status: 'PUBLISHED',
    version: 1,
    fields: [
      {
        key: 'title',
        label: 'Title',
        fieldType: FieldType.TEXT,
        required: true,
        order: 0,
      },
      {
        key: 'location',
        label: 'Location',
        fieldType: FieldType.GEO_POINT,
        required: false,
        order: 1,
      },
    ],
  };

  beforeEach(() => {
    prisma = createMockPrisma();
    validator = new EntryValidatorService();
    slugService = new SlugService();
    service = new ContentService(
      prisma as any,
      validator,
      slugService,
    );
  });

  describe('create', () => {
    it('creates a valid entry for a published template and writes audit log', async () => {
      prisma.contentTemplate.findFirst.mockResolvedValue(mockPublishedTemplate);
      prisma.contentEntry.findFirst.mockResolvedValue(null); // slug not duplicate
      prisma.contentEntry.create.mockResolvedValue({
        id: 'entry-1',
        templateId: 'tpl-destination',
        slug: 'chitrakote-falls',
        status: EntryStatus.DRAFT,
        data: { title: 'Chitrakote Falls' },
      });

      const res = await service.create(
        {
          templateId: 'tpl-destination',
          data: { title: 'Chitrakote Falls' },
        },
        'author-1',
      );

      expect(prisma.contentTemplate.findFirst).toHaveBeenCalledWith({
        where: { id: 'tpl-destination', status: 'PUBLISHED' },
        include: expect.any(Object),
      });
      expect(prisma.contentEntry.create).toHaveBeenCalled();
      expect(prisma.contentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryId: 'entry-1',
          action: AuditAction.CREATED,
          actorId: 'author-1',
        }),
      });
      expect(res.id).toBe('entry-1');
    });

    it('throws NotFoundException if template is not published or does not exist', async () => {
      prisma.contentTemplate.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            templateId: 'tpl-draft',
            data: { title: 'Some Title' },
          },
          'author-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects creation if required fields are missing', async () => {
      prisma.contentTemplate.findFirst.mockResolvedValue(mockPublishedTemplate);

      await expect(
        service.create(
          {
            templateId: 'tpl-destination',
            data: {},
          },
          'author-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('resolves duplicate slugs by incrementing counter', async () => {
      prisma.contentTemplate.findFirst.mockResolvedValue(mockPublishedTemplate);
      // first call finds existing slug, second call returns null
      prisma.contentEntry.findFirst
        .mockResolvedValueOnce({ id: 'existing', slug: 'chitrakote' })
        .mockResolvedValueOnce(null);

      prisma.contentEntry.create.mockResolvedValue({
        id: 'entry-2',
        slug: 'chitrakote-2',
      });

      await service.create(
        {
          templateId: 'tpl-destination',
          data: { title: 'Chitrakote' },
        },
        'author-1',
      );

      expect(prisma.contentEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'chitrakote-2',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('allows author to update a draft entry', async () => {
      const mockEntry = {
        id: 'entry-1',
        authorId: 'author-1',
        status: EntryStatus.DRAFT,
        data: { title: 'Original Title' },
        template: mockPublishedTemplate,
      };
      prisma.contentEntry.findUnique.mockResolvedValue(mockEntry);
      prisma.contentEntry.update.mockResolvedValue({
        ...mockEntry,
        data: { title: 'Updated Title' },
      });

      const res = await service.update(
        'entry-1',
        { data: { title: 'Updated Title' } },
        'author-1',
      );

      expect(prisma.contentEntry.update).toHaveBeenCalled();
      expect(prisma.contentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryId: 'entry-1',
          action: AuditAction.UPDATED,
          actorId: 'author-1',
        }),
      });
      expect((res.data as any).title).toBe('Updated Title');
    });

    it('rejects update if caller is not author', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        authorId: 'author-1',
        status: EntryStatus.DRAFT,
        template: mockPublishedTemplate,
      });

      await expect(
        service.update('entry-1', { data: { title: 'Hack' } }, 'attacker'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects update if entry is already published', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        authorId: 'author-1',
        status: EntryStatus.PUBLISHED,
        template: mockPublishedTemplate,
      });

      await expect(
        service.update('entry-1', { data: { title: 'Change' } }, 'author-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submit', () => {
    it('transitions draft entry to PENDING_REVIEW and logs audit', async () => {
      const mockEntry = {
        id: 'entry-1',
        authorId: 'author-1',
        status: EntryStatus.DRAFT,
        data: { title: 'Ready to submit' },
        template: mockPublishedTemplate,
      };
      prisma.contentEntry.findUnique.mockResolvedValue(mockEntry);
      prisma.contentEntry.update.mockResolvedValue({
        ...mockEntry,
        status: EntryStatus.PENDING_REVIEW,
      });

      const res = await service.submit('entry-1', 'author-1');

      expect(prisma.contentEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: {
          status: EntryStatus.PENDING_REVIEW,
          reviewNote: null,
        },
        include: expect.any(Object),
      });
      expect(prisma.contentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryId: 'entry-1',
          action: AuditAction.SUBMITTED,
          actorId: 'author-1',
        }),
      });
      expect(res.status).toBe(EntryStatus.PENDING_REVIEW);
    });

    it('rejects submit if caller is not the author', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        authorId: 'author-1',
        status: EntryStatus.DRAFT,
        template: mockPublishedTemplate,
      });

      await expect(service.submit('entry-1', 'not-author')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('review', () => {
    it('approves a pending entry and publishes it with timestamp', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        status: EntryStatus.PENDING_REVIEW,
      });
      prisma.contentEntry.update.mockResolvedValue({
        id: 'entry-1',
        status: EntryStatus.PUBLISHED,
        reviewedBy: 'moderator-1',
      });

      const res = await service.review('entry-1', 'moderator-1', true, 'Looks verified');

      expect(prisma.contentEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: expect.objectContaining({
          status: EntryStatus.PUBLISHED,
          reviewedBy: 'moderator-1',
          reviewNote: 'Looks verified',
          publishedAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
      expect(prisma.contentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryId: 'entry-1',
          action: AuditAction.APPROVED,
          actorId: 'moderator-1',
        }),
      });
      expect(prisma.contentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryId: 'entry-1',
          action: AuditAction.PUBLISHED,
          actorId: 'moderator-1',
        }),
      });
    });

    it('rejects a pending entry with notes', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        status: EntryStatus.PENDING_REVIEW,
      });
      prisma.contentEntry.update.mockResolvedValue({
        id: 'entry-1',
        status: EntryStatus.REJECTED,
        reviewNote: 'Inaccurate coordinates',
      });

      await service.review('entry-1', 'moderator-1', false, 'Inaccurate coordinates');

      expect(prisma.contentEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: expect.objectContaining({
          status: EntryStatus.REJECTED,
          reviewNote: 'Inaccurate coordinates',
          publishedAt: null,
        }),
        include: expect.any(Object),
      });
    });

    it('throws BadRequestException if entry is not awaiting review', async () => {
      prisma.contentEntry.findUnique.mockResolvedValue({
        id: 'entry-1',
        status: EntryStatus.DRAFT,
      });

      await expect(
        service.review('entry-1', 'mod', true),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findPublic and findInBounds', () => {
    it('returns only published entries in findPublic', async () => {
      prisma.contentEntry.findMany.mockResolvedValue([
        { id: 'e1', status: EntryStatus.PUBLISHED },
      ]);

      const res = await service.findPublic('tpl-1', 'Bastar', 'Jagdalpur');

      expect(prisma.contentEntry.findMany).toHaveBeenCalledWith({
        where: {
          status: EntryStatus.PUBLISHED,
          templateId: 'tpl-1',
          region: 'Bastar',
          district: 'Jagdalpur',
        },
        include: expect.any(Object),
        orderBy: { publishedAt: 'desc' },
      });
      expect(res).toHaveLength(1);
    });

    it('executes bounding box query in findInBounds', async () => {
      prisma.contentEntry.findMany.mockResolvedValue([]);

      await service.findInBounds(24.0, 17.5, 84.5, 80.0);

      expect(prisma.contentEntry.findMany).toHaveBeenCalledWith({
        where: {
          status: EntryStatus.PUBLISHED,
          lat: { gte: 17.5, lte: 24.0 },
          lng: { gte: 80.0, lte: 84.5 },
        },
        include: { template: true },
      });
    });
  });
});
