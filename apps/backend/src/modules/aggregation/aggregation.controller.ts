import { Controller, Post, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AggregationService } from './aggregation.service';

@Controller('aggregation')
export class AggregationController {
  private readonly logger = new Logger(AggregationController.name);

  constructor(private readonly aggregationService: AggregationService) {}

  /**
   * Manual trigger to run the background sync worker.
   * In a real production environment, this would be triggered by a CronJob (e.g. @Cron('0 * * * *'))
   * or a queue processor.
   */
  @Post('sync-all')
  @HttpCode(HttpStatus.OK)
  async runSync() {
    this.logger.log('Manual sync trigger received via API');
    const result = await this.aggregationService.runGlobalSync();
    return {
      success: true,
      message: 'Global aggregation sync completed successfully',
      result
    };
  }
}
