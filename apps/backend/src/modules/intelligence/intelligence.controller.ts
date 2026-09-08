import { Controller, Get, Query } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';

@Controller('api/v1/intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get('summary')
  async summary(@Query('from') from?: string, @Query('to') to?: string) {
    const start = from
      ? new Date(from)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const end = to ? new Date(to) : new Date();

    return this.intelligenceService.getSummary(start, end);
  }

  @Get('destinations/leaderboard')
  async leaderboard(@Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 5;
    return this.intelligenceService.getDestinationLeaderboard(take);
  }
}
