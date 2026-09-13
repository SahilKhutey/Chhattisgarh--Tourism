import { Controller, Get, Query } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { RecommendationService } from './recommendation.service';

@Controller('api/v1/intelligence')
export class IntelligenceController {
  constructor(
    private readonly intelligenceService: IntelligenceService,
    private readonly recommendationService: RecommendationService,
  ) {}

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

  @Get('regional-demand')
  async regionalDemand(@Query('days') days?: string) {
    const parsedDays = days ? parseInt(days, 10) : 14;
    return this.intelligenceService.getRegionalDemand(parsedDays);
  }

  @Get('emerging')
  async emerging(@Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 5;
    return this.intelligenceService.getEmergingDestinations(take);
  }

  @Get('recommendations')
  async recommendations(
    @Query('category') category?: string,
    @Query('district') district?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('accessibility') accessibility?: string,
    @Query('travelMonth') travelMonth?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 8;
    return this.recommendationService.getRecommendations(
      {
        categories: category ? [category] : undefined,
        districts: district ? [district] : undefined,
        userLat: lat ? parseFloat(lat) : undefined,
        userLng: lng ? parseFloat(lng) : undefined,
        accessibilityRequired: accessibility === 'true',
        travelMonth: travelMonth ? parseInt(travelMonth, 10) : undefined,
      },
      parsedLimit,
    );
  }
}

