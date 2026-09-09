import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ContentEntryStatus, ContentTemplateStatus } from './template-types';

@Injectable()
export class TemplateAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Scoped lookup for relation targets.
   * Only returns entries that:
   * 1. Belong to the allowed targetTemplateSlug
   * 2. Have status = PUBLISHED
   * 3. Belong to a template with status = PUBLISHED
   */
  async findPublishedRelationCandidates(targetTemplateSlug: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { slug: targetTemplateSlug },
      select: { id: true, status: true },
    });

    if (!template || template.status !== ContentTemplateStatus.PUBLISHED) {
      throw new NotFoundException(`Target template "${targetTemplateSlug}" not found or not published.`);
    }

    return this.prisma.contentEntry.findMany({
      where: {
        templateId: template.id,
        status: ContentEntryStatus.PUBLISHED,
      },
      select: {
        id: true,
        slug: true,
        data: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 100,
    });
  }
}
