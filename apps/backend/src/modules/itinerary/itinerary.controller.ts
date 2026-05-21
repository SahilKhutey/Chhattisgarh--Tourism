import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ItineraryService } from './itinerary.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';

@ApiTags('Itinerary')
@Controller('itinerary')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a customized eco-itinerary based on district, duration, and pacing' })
  @ApiBody({ type: GenerateItineraryDto })
  async generate(@Body(new ValidationPipe()) dto: GenerateItineraryDto) {
    return this.itineraryService.generateItinerary(
      dto.district,
      dto.durationDays,
      dto.pace,
    );
  }
}
