import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TemplateField } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class DiscoveryIndexerService {
  private readonly logger = new Logger(DiscoveryIndexerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async indexEntry(entryId: string): Promise<void> {
    try {
      const entry = await this.prisma.contentEntry.findUnique({
        where: { id: entryId },
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
        this.logger.warn(`Entry ${entryId} not found for indexing`);
        return;
      }

      if (entry.status !== 'PUBLISHED') {
        await this.removeEntry(entryId);
        return;
      }

      const data = (entry.data as Record<string, unknown>) || {};
      const fields = entry.template?.fields || [];

      const title = this.extractTitle(fields, data);
      const searchableText = this.buildSearchText(fields, data);
      const tags = this.extractTags(fields, data);

      await this.prisma.contentSearchIndex.upsert({
        where: { entryId },
        create: {
          entryId,
          templateId: entry.templateId,
          title,
          searchableText,
          region: entry.region,
          division: entry.division,
          district: entry.district,
          lat: entry.lat,
          lng: entry.lng,
          tags: tags as Prisma.InputJsonValue,
          publishedAt: entry.publishedAt,
        },
        update: {
          templateId: entry.templateId,
          title,
          searchableText,
          region: entry.region,
          division: entry.division,
          district: entry.district,
          lat: entry.lat,
          lng: entry.lng,
          tags: tags as Prisma.InputJsonValue,
          publishedAt: entry.publishedAt,
        },
      });

      this.logger.debug(`Indexed entry ${entryId} (${title})`);
    } catch (err) {
      this.logger.error(`Failed to index entry ${entryId}`, err instanceof Error ? err.stack : err);
      throw err;
    }
  }

  async removeEntry(entryId: string): Promise<void> {
    try {
      await this.prisma.contentSearchIndex.deleteMany({
        where: { entryId },
      });
      this.logger.debug(`Removed entry ${entryId} from search index`);
    } catch (err) {
      this.logger.error(`Failed to remove entry ${entryId} from index`, err instanceof Error ? err.stack : err);
      throw err;
    }
  }

  async rebuild(): Promise<{ processed: number; indexed: number; failed: number }> {
    this.logger.log('Starting full discovery search index rebuild...');

    const entries = await this.prisma.contentEntry.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, templateId: true },
    });

    let indexed = 0;
    let failed = 0;

    for (const entry of entries) {
      try {
        await this.indexEntry(entry.id);
        indexed++;
      } catch (err) {
        failed++;
        this.logger.error(`Rebuild failed to index entry ${entry.id} (template ${entry.templateId}): ${err}`);
      }
    }

    this.logger.log(
      `Discovery index rebuild completed: ${entries.length} processed, ${indexed} indexed, ${failed} failed`,
    );

    return {
      processed: entries.length,
      indexed,
      failed,
    };
  }

  private extractTitle(fields: TemplateField[], data: Record<string, unknown>): string {
    const titleField = fields.find(
      (field) => field.key === 'title' || field.key === 'name' || field.fieldType === 'TEXT',
    );

    if (titleField && typeof data[titleField.key] === 'string') {
      const val = (data[titleField.key] as string).trim();
      if (val) return val;
    }

    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title.trim();
    }

    if (typeof data.name === 'string' && data.name.trim()) {
      return data.name.trim();
    }

    return '';
  }

  private buildSearchText(fields: TemplateField[], data: Record<string, unknown>): string {
    const values: string[] = [];

    if (fields.length > 0) {
      for (const field of fields) {
        const value = data[field.key];
        if (typeof value === 'string') {
          values.push(value);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string') {
              values.push(item);
            }
          }
        }
      }
    } else {
      // Fallback if template fields array is empty
      for (const val of Object.values(data)) {
        if (typeof val === 'string') {
          values.push(val);
        } else if (Array.isArray(val)) {
          for (const item of val) {
            if (typeof item === 'string') values.push(item);
          }
        }
      }
    }

    return values.join(' ').trim();
  }

  private extractTags(fields: TemplateField[], data: Record<string, unknown>): string[] {
    const tags: string[] = [];

    for (const field of fields) {
      if (field.fieldType !== 'TAGS') continue;
      const value = data[field.key];
      if (!Array.isArray(value)) continue;

      for (const item of value) {
        if (typeof item === 'string') {
          tags.push(item.trim());
        }
      }
    }

    if (tags.length === 0 && Array.isArray(data.tags)) {
      for (const item of data.tags) {
        if (typeof item === 'string') tags.push(item.trim());
      }
    }

    return [...new Set(tags.filter(Boolean))];
  }
}
