import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { DiscoveryRepository } from './discovery.repository';
import { DiscoveryIndexerService } from './indexer/discovery-indexer.service';
import { RankingService } from './ranking/ranking.service';
import { SuggestionService } from './suggestions/suggestion.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DiscoveryController],
  providers: [
    DiscoveryService,
    DiscoveryRepository,
    DiscoveryIndexerService,
    RankingService,
    SuggestionService,
  ],
  exports: [DiscoveryService, DiscoveryIndexerService],
})
export class DiscoveryModule {}
