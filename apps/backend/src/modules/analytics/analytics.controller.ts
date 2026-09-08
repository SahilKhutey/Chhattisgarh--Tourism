import { Body, Controller, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  async track(@Body() dto: TrackEventDto) {
    return this.analyticsService.track(dto);
  }
}
