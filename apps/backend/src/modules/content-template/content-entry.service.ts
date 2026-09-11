import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DiscoveryIndexerService } from '../discovery/indexer/discovery-indexer.service';
import {
  ContentEntryStatus,
  ContentTemplateStatus,
} from './template-types';
import { CreateEntryDto } from './dto/create-entry.dto';

@Injectable()
export class ContentEntryService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly indexer?: DiscoveryIndexerService,
  ) {}

  private parseData(data: unknown): Record<string, unknown> {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return {};
      }
    }
    if (data && typeof data === 'object') {
      return data as Record<string, unknown>;
    }
    return {};
  }

  private async getTemplate(templateId: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { id: templateId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    return template;
  }

  private validateData(
    template: Awaited<ReturnType<typeof this.getTemplate>>,
    data: Record<string, unknown>,
  ) {
    const errors: Array<{ field: string; message: string }> = [];

    for (const field of template.fields) {
      const value = data[field.key];

      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors.push({
          field: field.key,
          message: `${field.label} is required.`,
        });
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      const fieldType = String(field.fieldType).toUpperCase();
      if (fieldType === 'TEXT' && typeof value !== 'string') {
        errors.push({
          field: field.key,
          message: `${field.label} must be text.`,
        });
      }

      if (fieldType === 'NUMBER' && typeof value !== 'number') {
        errors.push({
          field: field.key,
          message: `${field.label} must be a number.`,
        });
      }

      if (fieldType === 'BOOLEAN' && typeof value !== 'boolean') {
        errors.push({
          field: field.key,
          message: `${field.label} must be true or false.`,
        });
      }
    }

    return errors;
  }

  async create(dto: CreateEntryDto, authorId: string) {
    const template = await this.getTemplate(dto.templateId);

    if (template.status !== ContentTemplateStatus.PUBLISHED) {
      throw new BadRequestException('The selected template is not published.');
    }

    const errors = this.validateData(template, dto.data);
    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Entry validation failed.',
        errors,
      });
    }

    const existing = await this.prisma.contentEntry.findUnique({
      where: {
        templateId_slug: {
          templateId: dto.templateId,
          slug: dto.slug,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('An entry with this slug already exists.');
    }

    const lat = dto.latitude ?? null;
    const lng = dto.longitude ?? null;

    return this.prisma.contentEntry.create({
      data: {
        templateId: dto.templateId,
        templateVersion: template.publishedVersion ?? template.version,
        slug: dto.slug,
        data: dto.data as any,
        status: ContentEntryStatus.PENDING_REVIEW,
        authorId,
        region: dto.region,
        latitude: lat,
        longitude: lng,
      },
    });
  }

  async listPublic(templateId?: string, region?: string) {
    const rows = await this.prisma.contentEntry.findMany({
      where: {
        status: ContentEntryStatus.PUBLISHED,
        ...(templateId ? { templateId } : {}),
        ...(region ? { region } : {}),
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((row) => ({
      ...row,
      data: this.parseData(row.data),
    }));
  }

  async getPublic(templateSlug: string, entrySlug: string) {
    const row = await this.prisma.contentEntry.findFirst({
      where: {
        slug: entrySlug,
        status: ContentEntryStatus.PUBLISHED,
        template: {
          slug: templateSlug,
          status: ContentTemplateStatus.PUBLISHED,
        },
      },
      include: {
        template: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!row) {
      throw new NotFoundException('Content entry not found.');
    }

    return {
      ...row,
      data: this.parseData(row.data),
    };
  }

  async pending() {
    const rows = await this.prisma.contentEntry.findMany({
      where: {
        status: ContentEntryStatus.PENDING_REVIEW,
      },
      include: {
        template: true,
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return rows.map((row) => ({
      ...row,
      data: this.parseData(row.data),
    }));
  }

  async review(
    entryId: string,
    reviewerId: string,
    action: 'PUBLISH' | 'REJECT',
    note?: string,
  ) {
    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { role: true },
    });

    if (
      !reviewer ||
      !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(reviewer.role)
    ) {
      throw new ForbiddenException('You cannot review content.');
    }

    const entry = await this.prisma.contentEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found.');
    }

    const status =
      action === 'PUBLISH'
        ? ContentEntryStatus.PUBLISHED
        : ContentEntryStatus.REJECTED;

    const updated = await this.prisma.contentEntry.update({
      where: { id: entryId },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewNote: note ?? null,
        publishedAt: action === 'PUBLISH' ? new Date() : null,
      },
    });

    if (action === 'PUBLISH' && this.indexer) {
      await this.indexer.indexEntry(entryId).catch(() => {});
    } else if (action === 'REJECT' && this.indexer) {
      await this.indexer.removeEntry(entryId).catch(() => {});
    }

    return updated;
  }

  async getById(id: string) {
    const row = await this.prisma.contentEntry.findUnique({
      where: { id },
      include: {
        template: {
          include: { fields: { orderBy: { order: 'asc' } } },
        },
        author: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!row) {
      throw new NotFoundException('Entry not found.');
    }

    return { ...row, data: this.parseData(row.data) };
  }

  async submit(entryId: string, authorId: string) {
    const entry = await this.prisma.contentEntry.findUnique({ where: { id: entryId } });

    if (!entry) throw new NotFoundException('Entry not found.');
    if (entry.authorId !== authorId) throw new ForbiddenException('You cannot submit this entry.');
    if (entry.status !== ContentEntryStatus.DRAFT) {
      throw new BadRequestException('Only draft entries can be submitted for review.');
    }

    return this.prisma.contentEntry.update({
      where: { id: entryId },
      data: { status: ContentEntryStatus.PENDING_REVIEW },
    });
  }

  async update(entryId: string, dto: Record<string, unknown>, userId: string) {
    const entry = await this.prisma.contentEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Entry not found.');

    if (entry.authorId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role)) {
        throw new ForbiddenException('You cannot update this entry.');
      }
    }

    const lat = (dto.latitude as number) ?? (dto.lat as number) ?? undefined;
    const lng = (dto.longitude as number) ?? (dto.lng as number) ?? undefined;

    return this.prisma.contentEntry.update({
      where: { id: entryId },
      data: {
        ...(dto.data ? { data: dto.data as any } : {}),
        ...(dto.region !== undefined ? { region: dto.region as string } : {}),
        ...(dto.district !== undefined ? { district: dto.district as string } : {}),
        ...(dto.division !== undefined ? { division: dto.division as string } : {}),
        ...(lat !== undefined ? { latitude: lat } : {}),
        ...(lng !== undefined ? { longitude: lng } : {}),
      },
    });
  }

  async delete(entryId: string, userId: string) {
    const entry = await this.prisma.contentEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Entry not found.');

    if (entry.authorId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        throw new ForbiddenException('You cannot delete this entry.');
      }
    }

    return this.prisma.contentEntry.delete({ where: { id: entryId } });
  }

  async findInBounds(
    north: number,
    south: number,
    east: number,
    west: number,
    templateId?: string,
  ) {
    const rows = await this.prisma.contentEntry.findMany({
      where: {
        status: ContentEntryStatus.PUBLISHED,
        latitude: { gte: south, lte: north },
        longitude: { gte: west, lte: east },
        ...(templateId ? { templateId } : {}),
      },
      include: { template: { select: { id: true, name: true, slug: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    });

    return rows.map((row) => ({ ...row, data: this.parseData(row.data) }));
  }
}
