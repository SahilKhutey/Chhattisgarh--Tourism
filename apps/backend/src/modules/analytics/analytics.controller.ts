import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  async track(@Body() dto: TrackEventDto) {
    return this.analyticsService.track(dto);
  }

  @Get('metrics/bookings')
  async bookingMetrics() {
    return this.analyticsService.bookingMetrics();
  }

  @Get('trends/districts')
  async districtTrends(@Query('days') days?: string) {
    const parsed = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getDistrictTrends(parsed);
  }

  @Get('places/:id/engagement')
  async placeEngagement(@Param('id') id: string, @Query('days') days?: string) {
    const parsed = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getPlaceEngagement(id, parsed);
  }
}

