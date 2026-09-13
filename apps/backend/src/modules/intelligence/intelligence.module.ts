import { Module } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { RecommendationService } from './recommendation.service';
import { DailyMetricsJob } from './jobs/daily-metrics.job';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService, RecommendationService, DailyMetricsJob, PrismaService],
  exports: [IntelligenceService, RecommendationService],
})
export class IntelligenceModule {}

