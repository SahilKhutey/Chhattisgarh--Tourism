import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TemplateValidatorService } from '../content-templates/template-validator.service';
import { SpatialService } from '../../infrastructure/database/spatial.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { ReviewEntryDto } from './dto/review-entry.dto';
import { QueryEntriesDto } from './dto/query-entries.dto';
import { EntryStatus } from '@prisma/client';

@Injectable()
export class ContentEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: TemplateValidatorService,
    private readonly spatial: SpatialService,
  ) {}

  async create(dto: CreateEntryDto, authorId: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { id: dto.templateId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Cannot create entry against an unpublished template',
      );
    }

    // Validate content against template fields
    this.validator.validate(template.fields, dto.data);

    // Extract lat, lng, region if not provided in DTO
    let lat = dto.lat;
    let lng = dto.lng;
    let region = dto.region;

    if (lat === undefined || lng === undefined) {
      for (const field of template.fields) {
        if (field.fieldType === 'GEO_POINT') {
          const val = dto.data[field.key] as any;
          if (
            val &&
            typeof val === 'object' &&
            typeof val.lat === 'number' &&
            typeof val.lng === 'number'
          ) {
            lat = val.lat;
            lng = val.lng;
            break;
          }
        }
      }
    }

    if (!region) {
      if (typeof dto.data['region'] === 'string') {
        region = dto.data['region'] as string;
      } else if (typeof dto.data['district'] === 'string') {
        region = dto.data['district'] as string;
      }
    }

    const entry = await this.prisma.contentEntry.create({
      data: {
        templateId: dto.templateId,
        data: dto.data as any,
        status: dto.status ?? EntryStatus.PENDING_REVIEW,
        authorId,
        lat,
        lng,
        region,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    });

    // Synchronize PostGIS spatial geometry
    if (lat !== undefined && lng !== undefined) {
      await this.spatial.setEntryLocation(entry.id, lat, lng);
    }

    return entry;
  }

  async findAll(query: QueryEntriesDto) {
    const where: any = {};

    if (query.templateId) {
      where.templateId = query.templateId;
    } else if (query.templateSlug) {
      where.template = { slug: query.templateSlug };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.region) {
      where.region = query.region;
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [total, entries] = await Promise.all([
      this.prisma.contentEntry.count({ where }),
      this.prisma.contentEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
        },
      }),
    ]);

    return {
      data: entries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const entry = await this.prisma.contentEntry.findUnique({
      where: { id },
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

    if (!entry) {
      throw new NotFoundException('Content entry not found');
    }

    return entry;
  }

  async update(
    id: string,
    dto: UpdateEntryDto,
    userId: string,
    userRole?: string,
  ) {
    const entry = await this.findById(id);
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    if (!isAdmin && entry.authorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to edit this entry',
      );
    }

    if (dto.data) {
      const template = await this.prisma.contentTemplate.findUnique({
        where: { id: entry.templateId },
        include: { fields: true },
      });

      if (template) {
        this.validator.validate(template.fields, dto.data);
      }
    }

    const updated = await this.prisma.contentEntry.update({
      where: { id },
      data: {
        ...(dto.data ? { data: dto.data as any } : {}),
        ...(dto.status
          ? { status: dto.status }
          : !isAdmin && entry.status === EntryStatus.PUBLISHED
            ? { status: EntryStatus.PENDING_REVIEW }
            : {}),
        ...(dto.lat !== undefined ? { lat: dto.lat } : {}),
        ...(dto.lng !== undefined ? { lng: dto.lng } : {}),
        ...(dto.region !== undefined ? { region: dto.region } : {}),
      },
      include: {
        template: true,
      },
    });

    // Synchronize PostGIS location if coordinates were updated
    if (dto.lat !== undefined && dto.lng !== undefined) {
      await this.spatial.setEntryLocation(id, dto.lat, dto.lng);
    }

    return updated;
  }

  async review(id: string, dto: ReviewEntryDto, reviewerId: string) {
    await this.findById(id);

    return this.prisma.contentEntry.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedBy: reviewerId,
        reviewNote: dto.reviewNote,
      },
      include: {
        template: true,
      },
    });
  }

  async delete(id: string, userId: string, userRole?: string) {
    const entry = await this.findById(id);
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    if (!isAdmin && entry.authorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this entry',
      );
    }

    return this.prisma.contentEntry.delete({
      where: { id },
    });
  }
}
