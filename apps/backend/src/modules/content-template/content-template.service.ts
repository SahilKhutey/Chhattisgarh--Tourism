import {
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

  async findPublished(slug: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { slug },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template || template.status !== ContentTemplateStatus.PUBLISHED) {
      throw new NotFoundException('Template not found.');
    }

    return template;
  }

  async findById(id: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { id },
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
      throw new NotFoundException('Template not found.');
    }

    return template;
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
