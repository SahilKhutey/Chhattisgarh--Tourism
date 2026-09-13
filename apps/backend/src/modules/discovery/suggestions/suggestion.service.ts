import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface SuggestionItem {
  type: 'place' | 'district' | 'category';
  name: string;
  slug: string;
}

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

  async suggestStructured(query: string, limit = 8): Promise<SuggestionItem[]> {
    const normalized = query?.trim() || '';

    if (normalized.length < 2) {
      return [];
    }

    const [places, districts, categories] = await Promise.all([
      this.prisma.place.findMany({
        where: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          name: { contains: normalized, mode: 'insensitive' },
        },
        select: { name: true, slug: true },
        take: limit,
      }),
      this.prisma.district.findMany({
        where: {
          name: { contains: normalized, mode: 'insensitive' },
        },
        select: { name: true, slug: true },
        take: 3,
      }),
      this.prisma.category.findMany({
        where: {
          name: { contains: normalized, mode: 'insensitive' },
        },
        select: { name: true, slug: true },
        take: 3,
      }),
    ]);

    const suggestions: SuggestionItem[] = [
      ...places.map((p) => ({ type: 'place' as const, name: p.name, slug: p.slug })),
      ...districts.map((d) => ({ type: 'district' as const, name: d.name, slug: d.slug })),
      ...categories.map((c) => ({ type: 'category' as const, name: c.name, slug: c.slug })),
    ];

    return suggestions.slice(0, limit);
  }
}
