import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { DiscoveryRepository } from './discovery.repository';
import { DiscoveryIndexerService } from './indexer/discovery-indexer.service';
import { SearchService } from './search/search.service';
import { SearchRepository } from './search/search.repository';
import { GeoService } from './geo/geo.service';
import { RankingService } from './ranking/ranking.service';
import { SuggestionService } from './suggestions/suggestion.service';

@Module({
  imports: [DatabaseModule, AnalyticsModule, RedisModule],
  controllers: [DiscoveryController],
  providers: [
    DiscoveryService,
    DiscoveryRepository,
    DiscoveryIndexerService,
    SearchService,
    SearchRepository,
    GeoService,
    RankingService,
    SuggestionService,
  ],
  exports: [
    DiscoveryService,
    DiscoveryIndexerService,
    SearchService,
    GeoService,
  ],
})
export class DiscoveryModule {}
