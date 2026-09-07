import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ItineraryService } from './itinerary.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';

@ApiTags('Itinerary')
@Controller('itinerary')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate a data-driven tourism itinerary',
  })
  @ApiBody({
    type: GenerateItineraryDto,
  })
  async generate(
    @Body(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    )
    dto: GenerateItineraryDto,
  ) {
    return this.itineraryService.generateItinerary(
      dto.district,
      dto.durationDays,
      dto.pace,
      dto.interests ?? [],
      dto.travelers ?? 1,
    );
  }
}
