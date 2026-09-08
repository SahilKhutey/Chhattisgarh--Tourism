import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SuggestionService {
  constructor(private readonly prisma: PrismaService) {}

  async suggest(query: string, limit = 8): Promise<string[]> {
    const normalized = query?.trim() || '';

    if (normalized.length < 2) {
      return [];
    }

    const results = await this.prisma.contentSearchIndex.findMany({
      where: {
        entry: {
          status: 'PUBLISHED',
        },
        title: {
          contains: normalized,
          mode: 'insensitive',
        },
      },
      select: {
        title: true,
      },
      take: limit * 2,
    });

    const suggestions = results
      .map((item) => item.title?.trim())
      .filter((title): title is string => Boolean(title) && title.length > 0);

    return [...new Set(suggestions)].slice(0, limit);
  }
}
