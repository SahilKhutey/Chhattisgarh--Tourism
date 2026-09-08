import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  AuditAction,
  EntryStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { SpatialService } from '../../infrastructure/database/spatial.service';
import { EntryValidatorService } from './validators/entry-validator.service';
import { SlugService } from './slug/slug.service';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: EntryValidatorService,
    private readonly slugService: SlugService,
    @Optional() private readonly spatial?: SpatialService,
  ) {}

  async create(
    dto: {
      templateId: string;
      data: Record<string, unknown>;
      region?: string;
      district?: string;
      division?: string;
    },
    authorId: string,
  ) {
    const template = await this.prisma.contentTemplate.findFirst({
      where: {
        id: dto.templateId,
        status: 'PUBLISHED',
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Published template not found');
    }

    this.validator.validate(template.fields, dto.data);

    const title = this.extractTitle(template.fields, dto.data);

    const slug = await this.uniqueSlug(
      template.id,
      this.slugService.generate(title),
    );

    const geo = this.extractGeoPoint(template.fields, dto.data);

    const entry = await this.prisma.contentEntry.create({
      data: {
        templateId: template.id,
        templateVersion: template.version,
        slug,
        data: dto.data as Prisma.InputJsonValue,
        authorId,
        region: dto.region,
        district: dto.district,
        division: dto.division,
        lat: geo?.lat,
        lng: geo?.lng,
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (geo && this.spatial) {
      await this.spatial.setEntryLocation(entry.id, geo.lat, geo.lng).catch(() => {});
    }

    await this.audit(entry.id, AuditAction.CREATED, authorId);

    return entry;
  }

  async update(
    id: string,
    dto: {
      data?: Record<string, unknown>;
      region?: string;
      district?: string;
      division?: string;
    },
    authorId: string,
  ) {
    const entry = await this.prisma.contentEntry.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.authorId !== authorId) {
      throw new ForbiddenException('You are not authorized to edit this entry');
    }

    if (
      entry.status !== EntryStatus.DRAFT &&
      entry.status !== EntryStatus.REJECTED
    ) {
      throw new BadRequestException('Only draft or rejected entries can be edited');
    }

    const data = dto.data ?? (entry.data as Record<string, unknown>);

    this.validator.validate(entry.template.fields, data);

    const geo = this.extractGeoPoint(entry.template.fields, data);

    const updated = await this.prisma.contentEntry.update({
      where: { id },
      data: {
        data: data as Prisma.InputJsonValue,
        region: dto.region ?? entry.region,
        district: dto.district ?? entry.district,
        division: dto.division ?? entry.division,
        lat: geo?.lat,
        lng: geo?.lng,
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (geo && this.spatial) {
      await this.spatial.setEntryLocation(updated.id, geo.lat, geo.lng).catch(() => {});
    }

    await this.audit(id, AuditAction.UPDATED, authorId);

    return updated;
  }

  async submit(id: string, authorId: string) {
    const entry = await this.prisma.contentEntry.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.authorId !== authorId) {
      throw new ForbiddenException('You are not authorized to submit this entry');
    }

    if (
      entry.status !== EntryStatus.DRAFT &&
      entry.status !== EntryStatus.REJECTED
    ) {
      throw new BadRequestException('Entry cannot be submitted');
    }

    this.validator.validate(
      entry.template.fields,
      entry.data as Record<string, unknown>,
    );

    const updated = await this.prisma.contentEntry.update({
      where: { id },
      data: {
        status: EntryStatus.PENDING_REVIEW,
        reviewNote: null,
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    await this.audit(id, AuditAction.SUBMITTED, authorId);

    return updated;
  }

  async review(
    id: string,
    reviewerId: string,
    approved: boolean,
    note?: string,
  ) {
    const entry = await this.prisma.contentEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.status !== EntryStatus.PENDING_REVIEW) {
      throw new BadRequestException('Entry is not awaiting review');
    }

    const status = approved ? EntryStatus.PUBLISHED : EntryStatus.REJECTED;

    const updated = await this.prisma.contentEntry.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewNote: note ?? null,
        publishedAt: approved ? new Date() : null,
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    await this.audit(
      id,
      approved ? AuditAction.APPROVED : AuditAction.REJECTED,
      reviewerId,
      note ? { note } : undefined,
    );

    if (approved) {
      await this.audit(id, AuditAction.PUBLISHED, reviewerId);
    }

    return updated;
  }

  async findPublic(
    templateId?: string,
    region?: string,
    district?: string,
    status?: EntryStatus,
  ) {
    return this.prisma.contentEntry.findMany({
      where: {
        status: status ?? EntryStatus.PUBLISHED,
        ...(templateId ? { templateId } : {}),
        ...(region ? { region } : {}),
        ...(district ? { district } : {}),
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  async findPublicBySlug(templateSlug: string, entrySlug: string) {
    const entry = await this.prisma.contentEntry.findFirst({
      where: {
        slug: entrySlug,
        status: EntryStatus.PUBLISHED,
        template: {
          slug: templateSlug,
          status: 'PUBLISHED',
        },
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Published content not found');
    }

    return entry;
  }

  async findInBounds(
    north: number,
    south: number,
    east: number,
    west: number,
  ) {
    return this.prisma.contentEntry.findMany({
      where: {
        status: EntryStatus.PUBLISHED,
        lat: {
          gte: south,
          lte: north,
        },
        lng: {
          gte: west,
          lte: east,
        },
      },
      include: {
        template: true,
      },
    });
  }

  async findById(id: string) {
    const entry = await this.prisma.contentEntry.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        auditLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    return entry;
  }

  private extractTitle(
    fields: any[],
    data: Record<string, unknown>,
  ): string {
    const titleField = fields.find(
      (field) =>
        field.key === 'title' ||
        field.key === 'name' ||
        field.fieldType === 'TEXT',
    );

    const value = titleField ? data[titleField.key] : undefined;

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException('A title field is required for an entry');
    }

    return value;
  }

  private extractGeoPoint(
    fields: any[],
    data: Record<string, unknown>,
  ): { lat: number; lng: number } | null {
    const geoField = fields.find((field) => field.fieldType === 'GEO_POINT');

    if (!geoField) {
      return null;
    }

    const value = data[geoField.key];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const point = value as {
      lat?: unknown;
      lng?: unknown;
    };

    if (typeof point.lat !== 'number' || typeof point.lng !== 'number') {
      return null;
    }

    return {
      lat: point.lat,
      lng: point.lng,
    };
  }

  private async uniqueSlug(
    templateId: string,
    baseSlug: string,
  ): Promise<string> {
    let slug = baseSlug || 'entry';
    let counter = 1;

    while (
      await this.prisma.contentEntry.findFirst({
        where: {
          templateId,
          slug,
        },
      })
    ) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }

  private async audit(
    entryId: string,
    action: AuditAction,
    actorId: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.prisma.contentAuditLog.create({
      data: {
        entryId,
        action,
        actorId,
        metadata,
      },
    });
  }
}
