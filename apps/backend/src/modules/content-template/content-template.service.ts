import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  ContentTemplateStatus,
  TemplateFieldType,
} from './template-types';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { QueryTemplatesDto } from './dto/query-templates.dto';
import { diffTemplateSnapshots, summarizeUpgradeRisk } from './template-diff.util';

@Injectable()
export class ContentTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTemplateDto, userId: string) {
    const existing = await this.prisma.contentTemplate.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('A template with this slug already exists.');
    }

    return this.prisma.contentTemplate.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        createdBy: userId,
        createdById: userId,
        fields: {
          create: dto.fields.map((field) => ({
            key: field.key,
            label: field.label,
            fieldType: field.fieldType as TemplateFieldType,
            required: field.required ?? false,
            order: field.order,
            translatable: field.translatable ?? true,
            helpText: field.helpText,
            options: (field.options as any) ?? null,
          })),
        },
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateTemplateDto, userId: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.fields) {
        await tx.templateField.deleteMany({
          where: { templateId: id },
        });

        await tx.templateField.createMany({
          data: dto.fields.map((field) => ({
            templateId: id,
            key: field.key,
            label: field.label,
            fieldType: field.fieldType as TemplateFieldType,
            required: field.required ?? false,
            order: field.order,
            translatable: field.translatable ?? true,
            helpText: field.helpText,
            options: (field.options as any) ?? null,
          })),
        });
      }

      return tx.contentTemplate.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          icon: dto.icon,
          updatedById: userId,
        },
        include: {
          fields: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });
  }

  async findAll(queryOrStatus?: string | QueryTemplatesDto) {
    if (typeof queryOrStatus === 'string' || !queryOrStatus) {
      const statusFilter = queryOrStatus
        ? { status: queryOrStatus as ContentTemplateStatus }
        : undefined;
      const list = await this.prisma.contentTemplate.findMany({
        where: statusFilter,
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
          },
          _count: {
            select: { entries: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return list.map((item: any) => ({
        ...item,
        entryCount: item._count?.entries ?? 0,
      }));
    }

    const {
      search,
      status,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 25,
    } = queryOrStatus;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status as ContentTemplateStatus;
    }
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.updatedAt = sortOrder;
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [total, rawItems] = await Promise.all([
      this.prisma.contentTemplate.count({ where }),
      this.prisma.contentTemplate.findMany({
        where,
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
          },
          _count: {
            select: { entries: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
    ]);

    let items = rawItems.map((item: any) => ({
      ...item,
      entryCount: item._count?.entries ?? 0,
    }));

    if (sortBy === 'entryCount') {
      items = items.sort((a, b) =>
        sortOrder === 'asc' ? a.entryCount - b.entryCount : b.entryCount - a.entryCount,
      );
    }

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async findPublished(idOrSlug: string) {
    let template = await this.prisma.contentTemplate.findUnique({
      where: { slug: idOrSlug },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      template = await this.prisma.contentTemplate.findUnique({
        where: { id: idOrSlug },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    }

    if (!template || template.status !== ContentTemplateStatus.PUBLISHED) {
      throw new NotFoundException('Template not found.');
    }

    return template;
  }

  async findById(idOrSlug: string) {
    let template = await this.prisma.contentTemplate.findUnique({
      where: { id: idOrSlug },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!template) {
      template = await this.prisma.contentTemplate.findUnique({
        where: { slug: idOrSlug },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
          versions: {
            orderBy: { version: 'desc' },
          },
        },
      });
    }

    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    return template;
  }

  async duplicate(id: string, userId: string) {
    const template = await this.findById(id);
    const baseSlug = `${template.slug}-copy`;
    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.contentTemplate.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return this.prisma.contentTemplate.create({
      data: {
        name: `${template.name} (Copy)`,
        slug,
        description: template.description,
        icon: template.icon,
        status: ContentTemplateStatus.DRAFT,
        version: 1,
        createdBy: userId,
        createdById: userId,
        fields: {
          create: template.fields.map((field) => ({
            key: field.key,
            label: field.label,
            fieldType: field.fieldType,
            required: field.required,
            order: field.order,
            translatable: field.translatable,
            helpText: field.helpText,
            options: (field.options as any) ?? null,
          })),
        },
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateFields(id: string, fields: any[], userId: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.templateField.deleteMany({
        where: { templateId: id },
      });

      await tx.templateField.createMany({
        data: fields.map((field, idx) => ({
          templateId: id,
          key: field.key,
          label: field.label,
          fieldType: field.fieldType as TemplateFieldType,
          required: field.required ?? false,
          order: field.order ?? idx,
          translatable: field.translatable ?? true,
          helpText: field.helpText,
          options: (field.options as any) ?? null,
        })),
      });

      return tx.contentTemplate.update({
        where: { id },
        data: {
          updatedById: userId,
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  async archive(id: string, userId?: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    const activeEntriesCount = await this.prisma.contentEntry.count({
      where: { templateId: id, status: 'PUBLISHED' },
    });

    if (activeEntriesCount > 0) {
      throw new BadRequestException(
        'Cannot archive template with active published entries. Archive or reassign entries first.',
      );
    }

    return this.prisma.contentTemplate.update({
      where: { id },
      data: {
        status: ContentTemplateStatus.ARCHIVED,
        ...(userId ? { updatedById: userId } : {}),
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async publish(templateId: string, userId: string) {
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

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Only an administrator can publish templates.');
    }

    if (!template.fields || template.fields.length === 0) {
      throw new BadRequestException('Cannot publish a template with zero fields.');
    }

    const nextVersion = template.version + 1;
    const snapshot = {
      id: template.id,
      name: template.name,
      slug: template.slug,
      version: nextVersion,
      fields: template.fields.map((field) => ({
        key: field.key,
        label: field.label,
        fieldType: field.fieldType,
        required: field.required,
        order: field.order,
        translatable: field.translatable,
        helpText: field.helpText,
        options: field.options,
      })),
    };

    return this.prisma.$transaction(async (tx) => {
      await tx.templateVersion.create({
        data: {
          templateId: template.id,
          version: nextVersion,
          snapshot: snapshot as any,
          createdBy: userId,
          createdById: userId,
          publishedAt: new Date(),
        },
      });

      return tx.contentTemplate.update({
        where: { id: template.id },
        data: {
          status: ContentTemplateStatus.PUBLISHED,
          version: nextVersion,
          publishedVersion: nextVersion,
          updatedById: userId,
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  async rollback(templateId: string, targetVersion: number, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Only an administrator can rollback templates.');
    }

    const target = await this.prisma.templateVersion.findUnique({
      where: {
        templateId_version: {
          templateId,
          version: targetVersion,
        },
      },
    });

    if (!target) {
      throw new NotFoundException(`Version ${targetVersion} not found for rollback.`);
    }

    return this.prisma.contentTemplate.update({
      where: { id: templateId },
      data: {
        publishedVersion: targetVersion,
        updatedById: userId,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getVersions(id: string) {
    const versions = await this.prisma.templateVersion.findMany({
      where: { templateId: id },
      orderBy: { version: 'desc' },
      include: {
        createdByRel: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return versions.map((v: any) => {
      const snapshot =
        typeof v.snapshot === 'string' ? JSON.parse(v.snapshot) : v.snapshot;
      return {
        id: v.id,
        templateId: v.templateId,
        version: v.version,
        publishedAt: v.publishedAt || v.createdAt,
        createdBy: v.createdByRel?.fullName || v.createdBy || 'Administrator',
        createdById: v.createdById,
        fieldCount: snapshot?.fields?.length || 0,
        snapshot,
      };
    });
  }

  async getVersionDiff(id: string, version: number) {
    const currentRecord = await this.prisma.templateVersion.findUnique({
      where: {
        templateId_version: {
          templateId: id,
          version,
        },
      },
    });

    if (!currentRecord) {
      throw new NotFoundException(`Version ${version} not found for template.`);
    }

    const prevRecord = await this.prisma.templateVersion.findFirst({
      where: {
        templateId: id,
        version: { lt: version },
      },
      orderBy: { version: 'desc' },
    });

    const currentSnapshot =
      typeof currentRecord.snapshot === 'string'
        ? JSON.parse(currentRecord.snapshot)
        : currentRecord.snapshot;

    if (!prevRecord) {
      return {
        fromVersion: 0,
        toVersion: version,
        changes: [],
        riskLevel: 'SAFE' as const,
        breakingChanges: [],
        safeChanges: [],
        summary: `Initial version v${version} snapshot.`,
      };
    }

    const prevSnapshot =
      typeof prevRecord.snapshot === 'string'
        ? JSON.parse(prevRecord.snapshot)
        : prevRecord.snapshot;

    const diff = diffTemplateSnapshots(prevSnapshot as any, currentSnapshot as any);
    const risk = summarizeUpgradeRisk(diff);

    return {
      ...diff,
      ...risk,
    };
  }

  async listPublished() {
    return this.prisma.contentTemplate.findMany({
      where: {
        status: ContentTemplateStatus.PUBLISHED,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
