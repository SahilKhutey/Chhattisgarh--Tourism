import { Injectable } from '@nestjs/common';
import { DiscoveryCandidate, RankedCandidate } from './ranking.types';

@Injectable()
export class RankingService {
  /**
   * Deterministically rank candidates based on query relevance, category match,
   * geographic proximity, and exact identifier matches.
   */
  rank(
    candidates: DiscoveryCandidate[],
    query?: string,
  ): RankedCandidate[] {
    const normalized = query?.trim().toLowerCase() ?? '';

    return candidates
      .map((candidate) => {
        let score = 0;
        const name = (candidate.name || '').toLowerCase();
        const slug = (candidate.slug || '').toLowerCase();

        if (normalized && name === normalized) {
          score += 100;
        } else if (normalized && slug === normalized) {
          score += 100;
        } else if (normalized && name.startsWith(normalized)) {
          score += 80;
        } else if (normalized && name.includes(normalized)) {
          score += 60;
        }

        score += candidate.categoryScore ?? 0;
        score += candidate.geographicScore ?? 0;

        if (candidate.distanceMeters !== undefined) {
          score += Math.max(0, 30 - candidate.distanceMeters / 1000);
        }

        return {
          ...candidate,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Compatibility scoring method for legacy entry indexing
   */
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
