import { Module } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { DailyMetricsJob } from './jobs/daily-metrics.job';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService, DailyMetricsJob, PrismaService],
  exports: [IntelligenceService],
})
export class IntelligenceModule {}
