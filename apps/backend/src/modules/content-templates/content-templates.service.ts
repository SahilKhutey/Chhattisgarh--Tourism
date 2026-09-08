import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { CacheKeys } from '../../infrastructure/redis/cache.keys';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplateDefinitionValidator } from './template-definition.validator';

@Injectable()
export class ContentTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateTemplateDto, userId: string) {
    const existing = await this.prisma.contentTemplate.findUnique({
      where: {
        slug: dto.slug,
      },
    });

    if (existing) {
      throw new ConflictException('Template slug already exists');
    }

    if (dto.fields && dto.fields.length > 0) {
      TemplateDefinitionValidator.validateOrThrow(dto as any);
    }

    const created = await this.prisma.contentTemplate.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        createdBy: userId,

        fields: {
          create: dto.fields.map((field) => ({
            key: field.key,
            label: field.label,
            fieldType: field.fieldType,
            required: field.required ?? false,
            order: field.order,
            options: (field.options ?? null) as any,
            translatable: field.translatable ?? true,
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

    await this.invalidatePublishedTemplatesCache();
    return created;
  }

  async findAll(status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    return this.prisma.contentTemplate.findMany({
      where: status ? { status } : undefined,
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, dto: Partial<CreateTemplateDto>, userId: string) {
    const existing = await this.findById(id);

    if (dto.fields && dto.fields.length > 0) {
      TemplateDefinitionValidator.validateOrThrow({
        name: dto.name || existing.name,
        slug: dto.slug || existing.slug,
        description: dto.description ?? existing.description ?? undefined,
        icon: dto.icon ?? existing.icon ?? undefined,
        fields: dto.fields as any,
      });

      return await this.prisma.$transaction(async (tx) => {
        await tx.templateField.deleteMany({
          where: { templateId: id },
        });

        const updated = await tx.contentTemplate.update({
          where: { id },
          data: {
            name: dto.name ?? existing.name,
            description: dto.description ?? existing.description,
            icon: dto.icon ?? existing.icon,
            fields: {
              create: dto.fields!.map((field) => ({
                key: field.key,
                label: field.label,
                fieldType: field.fieldType,
                required: field.required ?? false,
                order: field.order,
                options: (field.options ?? null) as any,
                translatable: field.translatable ?? true,
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

        await this.invalidatePublishedTemplatesCache();
        return updated;
      });
    }

    const updated = await this.prisma.contentTemplate.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        description: dto.description ?? existing.description,
        icon: dto.icon ?? existing.icon,
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    await this.invalidatePublishedTemplatesCache();
    return updated;
  }

  async findPublished() {
    const key = CacheKeys.publishedTemplates;
    const cached = await this.redis.get<any[]>(key);
    if (cached) {
      return cached;
    }

    const templates = await this.prisma.contentTemplate.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    await this.redis.set(key, templates, 300);
    return templates;
  }

  async findById(id: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { id },

      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async publish(id: string, userId: string) {
    const template = await this.findById(id);
    const version = template.version;

    await this.prisma.$transaction([
      this.prisma.templateVersion.create({
        data: {
          templateId: id,
          version,
          createdBy: userId,
          snapshot: {
            name: template.name,
            slug: template.slug,
            description: template.description,
            fields: template.fields,
          },
        },
      }),

      this.prisma.contentTemplate.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
        },
      }),
    ]);

    await this.invalidatePublishedTemplatesCache();
    return this.findById(id);
  }

  async archive(id: string) {
    await this.findById(id);

    const updated = await this.prisma.contentTemplate.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
    });

    await this.invalidatePublishedTemplatesCache();
    return updated;
  }

  async invalidatePublishedTemplatesCache(): Promise<void> {
    await this.redis.delete(CacheKeys.publishedTemplates);
  }
}
