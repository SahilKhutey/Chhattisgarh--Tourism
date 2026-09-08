import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IntelligenceService } from '../intelligence.service';

@Injectable()
export class DailyMetricsJob {
  private readonly logger = new Logger(DailyMetricsJob.name);

  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAggregation() {
    this.logger.log('Executing daily regional tourism metrics aggregation...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    try {
      const results = await this.intelligenceService.generateDailyMetrics(yesterday);
      this.logger.log(`Successfully aggregated ${results.length} regional metrics.`);
    } catch (err: any) {
      this.logger.error(`Failed to aggregate daily metrics: ${err.message}`, err.stack);
    }
  }
}
