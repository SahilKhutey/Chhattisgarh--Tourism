import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import { ItineraryRepository } from './itinerary.repository';
import { PlanningEngineService } from './engine/planning-engine.service';
import { FeasibilityService } from './engine/feasibility.service';
import { PlanningScoringService } from './engine/scoring.service';
import { SequencingService } from './engine/sequencing.service';
import { TravelTimeService } from './engine/time.service';
import { ExplanationService } from './engine/explanation.service';
import { DefaultAiPlannerService } from './ai/ai-planner.service';
import { ItineraryCacheService } from './cache/itinerary-cache.service';

@Module({
  imports: [RedisModule, AnalyticsModule],
  controllers: [ItineraryController],
  providers: [
    PrismaService,
    ItineraryService,
    ItineraryRepository,
    PlanningEngineService,
    FeasibilityService,
    PlanningScoringService,
    SequencingService,
    TravelTimeService,
    ExplanationService,
    DefaultAiPlannerService,
    ItineraryCacheService,
  ],
  exports: [
    ItineraryService,
    PlanningEngineService,
    FeasibilityService,
    SequencingService,
    TravelTimeService,
  ],
})
export class ItineraryModule {}
