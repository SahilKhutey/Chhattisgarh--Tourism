import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { GeographyService } from './geography.service';

@Controller('api/v1/geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('audit')
  async auditHierarchy() {
    return this.geographyService.auditAllPlaces();
  }

  @Get('validate/:placeId')
  async validatePlace(@Param('placeId') placeId: string) {
    const result = await this.geographyService.validatePlaceCoordinates(placeId);
    if (!result) {
      throw new NotFoundException(`Place with ID ${placeId} not found`);
    }
    return result;
  }
}
