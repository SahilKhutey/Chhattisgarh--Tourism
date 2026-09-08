import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { CacheKeys } from '../../infrastructure/redis/cache.keys';
import { CreateTemplateDto } from './dto/create-template.dto';

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
