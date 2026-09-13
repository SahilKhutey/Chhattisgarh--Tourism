import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ItineraryService } from './itinerary.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { PlanItineraryDto } from './dto/plan-itinerary.dto';
import { ReorderStopDto } from './dto/reorder-stop.dto';
import { RegenerateDayDto } from './dto/regenerate-day.dto';

@ApiTags('Itinerary')
@Controller()
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 4: CANONICAL ITINERARY & TRIP ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('itineraries')
  @ApiOperation({ summary: 'Create a new trip planning container' })
  async createTrip(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreateTripDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.itineraryService.createTrip(dto, userId);
  }

  @Get('itineraries/:id')
  @ApiOperation({ summary: 'Get trip with active versioned itinerary' })
  async getTrip(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.itineraryService.getTrip(id, userId);
  }

  @Post('itineraries/:id/generate')
  @ApiOperation({ summary: 'Generate a deterministic itinerary for trip' })
  async generateForTrip(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: PlanItineraryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.itineraryService.generateForTrip(id, dto, userId);
  }

  @Post('itineraries/:id/reorder')
  @ApiOperation({ summary: 'Reorder stops in an itinerary' })
  async reorderStop(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: ReorderStopDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.itineraryService.reorderStop(id, dto, userId);
  }

  @Post('itineraries/:id/regenerate')
  @ApiOperation({ summary: 'Regenerate specific day with locked stops' })
  async regenerateDay(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: RegenerateDayDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.itineraryService.regenerateDay(id, dto, userId);
  }

  @Get('itineraries/:id/explain')
  @ApiOperation({ summary: 'Get natural-language explainable breakdown' })
  async explain(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return {
      narrative: await this.itineraryService.explainItinerary(id, userId),
    };
  }

  @Delete('itineraries/:id')
  @ApiOperation({ summary: 'Archive or delete a trip' })
  async deleteTrip(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.itineraryService.deleteTrip(id, userId);
  }

  @Get('me/itineraries')
  @ApiOperation({ summary: 'Get current authenticated user trips' })
  async getUserTrips(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.itineraryService.getUserTrips(userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LEGACY BACKWARD COMPATIBILITY ENDPOINT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('itinerary/generate')
  @ApiOperation({ summary: 'Generate legacy in-memory tourism itinerary' })
  async generate(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: GenerateItineraryDto,
  ) {
    return this.itineraryService.generateItinerary(
      dto.district,
      dto.durationDays,
      dto.pace as any,
      dto.interests ?? [],
      dto.travelers ?? 1,
    );
  }
}
