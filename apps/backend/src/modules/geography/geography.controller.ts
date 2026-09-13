import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { GeographyService } from './geography.service';

@Controller('api/v1/geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('divisions')
  async listDivisions() {
    const data = await this.geographyService.listDivisions();
    return { data };
  }

  @Get('districts')
  async listDistricts() {
    const data = await this.geographyService.listDistricts();
    return { data };
  }

  @Get('districts/:slug')
  async getDistrict(@Param('slug') slug: string) {
    const data = await this.geographyService.getDistrict(slug);
    return { data };
  }

  @Get('zones/:slug')
  async getZone(@Param('slug') slug: string) {
    const data = await this.geographyService.getZone(slug);
    return { data };
  }

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
