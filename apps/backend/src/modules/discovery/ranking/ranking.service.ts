import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingService {
  score(
    query: string,
    item: {
      title?: string | null;
      searchableText: string;
      tags?: unknown;
      publishedAt?: Date | null;
    },
  ): number {
    if (!query || !query.trim()) {
      return 0;
    }

    const normalized = query.trim().toLowerCase();
    const title = item.title?.toLowerCase() ?? '';

    let score = 0;

    if (title === normalized) {
      score += 100;
    } else if (title.startsWith(normalized)) {
      score += 75;
    } else if (title.includes(normalized)) {
      score += 50;
    }

    if (item.searchableText?.toLowerCase().includes(normalized)) {
      score += 25;
    }

    if (Array.isArray(item.tags)) {
      const matched = item.tags.some(
        (tag) => typeof tag === 'string' && tag.toLowerCase().includes(normalized),
      );

      if (matched) {
        score += 40;
      }
    }

    return score;
  }
}
