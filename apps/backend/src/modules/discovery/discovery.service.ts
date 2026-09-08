import { Injectable } from '@nestjs/common';
import { DiscoveryRepository } from './discovery.repository';
import { DiscoveryIndexerService } from './indexer/discovery-indexer.service';
import { RankingService } from './ranking/ranking.service';
import { SuggestionService } from './suggestions/suggestion.service';
import { DiscoveryResponse, DiscoveryResult } from './types/discovery.types';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly repository: DiscoveryRepository,
    private readonly indexer: DiscoveryIndexerService,
    private readonly ranking: RankingService,
    private readonly suggestions: SuggestionService,
  ) {}

  async search(params: {
    q?: string;
    templateId?: string;
    region?: string;
    division?: string;
    district?: string;
    page: number;
    limit: number;
  }): Promise<DiscoveryResponse> {
    const { items, total } = await this.repository.search(params);

    const totalPages = Math.ceil(total / params.limit) || 0;

    let mappedResults: DiscoveryResult[] = items.map((item) => {
      const score = params.q
        ? this.ranking.score(params.q, {
            title: item.title,
            searchableText: item.searchableText,
            tags: item.tags,
            publishedAt: item.publishedAt,
          })
        : undefined;

      return {
        id: item.entry.id,
        templateId: item.templateId,
        templateName: item.entry.template?.name || '',
        templateSlug: item.entry.template?.slug || '',
        slug: item.entry.slug,
        title: item.title ?? '',
        data: (item.entry.data as Record<string, unknown>) || {},
        region: item.region,
        division: item.division,
        district: item.district,
        lat: item.lat,
        lng: item.lng,
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : null,
        score,
        publishedAt: item.publishedAt,
      };
    });

    if (params.q && params.q.trim()) {
      mappedResults = mappedResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }

    return {
      items: mappedResults,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
      filters: {
        query: params.q,
        templateId: params.templateId,
        region: params.region,
        division: params.division,
        district: params.district,
      },
    };
  }

  async nearby(
    lat: number,
    lng: number,
    radiusKm = 25,
    limit = 50,
  ): Promise<DiscoveryResult[]> {
    const results = await this.repository.findNearby(lat, lng, radiusKm, limit);

    return results.map((item) => ({
      id: item.entry.id,
      templateId: item.templateId,
      templateName: item.entry.template?.name || '',
      templateSlug: item.entry.template?.slug || '',
      slug: item.entry.slug,
      title: item.title ?? '',
      data: (item.entry.data as Record<string, unknown>) || {},
      region: item.region,
      division: item.division,
      district: item.district,
      lat: item.lat,
      lng: item.lng,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : null,
      publishedAt: item.publishedAt,
    }));
  }

  async bounds(
    north: number,
    south: number,
    east: number,
    west: number,
    limit = 100,
  ): Promise<DiscoveryResult[]> {
    const results = await this.repository.findInBounds(north, south, east, west, limit);

    return results.map((item) => ({
      id: item.entry.id,
      templateId: item.templateId,
      templateName: item.entry.template?.name || '',
      templateSlug: item.entry.template?.slug || '',
      slug: item.entry.slug,
      title: item.title ?? '',
      data: (item.entry.data as Record<string, unknown>) || {},
      region: item.region,
      division: item.division,
      district: item.district,
      lat: item.lat,
      lng: item.lng,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : null,
      publishedAt: item.publishedAt,
    }));
  }

  async suggest(query: string, limit = 8): Promise<string[]> {
    return this.suggestions.suggest(query, limit);
  }

  async index(entryId: string): Promise<void> {
    return this.indexer.indexEntry(entryId);
  }

  async rebuild(): Promise<{ processed: number; indexed: number; failed: number }> {
    return this.indexer.rebuild();
  }
}
