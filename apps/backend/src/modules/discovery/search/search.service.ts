import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { RankingService } from '../ranking/ranking.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { DiscoveryQueryDto } from '../dto/discovery-query.dto';
import { RankedCandidate } from '../ranking/ranking.types';

@Injectable()
export class SearchService {
  constructor(
    private readonly repository: SearchRepository,
    private readonly ranking: RankingService,
    private readonly redis: RedisService,
    private readonly analytics: AnalyticsService,
  ) {}

  async search(params: DiscoveryQueryDto): Promise<{
    data: RankedCandidate[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const cacheKey = `discovery:search:${JSON.stringify(params)}`;

    // Try Redis cache
    const cached = await this.redis.get<{
      data: RankedCandidate[];
      total: number;
      limit: number;
      offset: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const candidates = await this.repository.search({
      query: params.q,
      district: params.district,
      zone: params.zone,
      category: params.category,
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      limit: params.limit,
      offset: params.offset,
    });

    const ranked = this.ranking.rank(candidates, params.q);

    const result = {
      data: ranked,
      total: ranked.length,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    };

    // Cache in Redis for 5 minutes (300 seconds)
    await this.redis.set(cacheKey, result, 300);

    // Track analytics event asynchronously
    if (params.q?.trim()) {
      this.analytics.track({
        type: 'SEARCH' as any,
        name: 'search_performed',
        metadata: {
          query: params.q,
          district: params.district,
          category: params.category,
          resultCount: ranked.length,
        },
      }).catch(() => {
        // Analytics failure should never block user response
      });
    }

    return result;
  }
}
