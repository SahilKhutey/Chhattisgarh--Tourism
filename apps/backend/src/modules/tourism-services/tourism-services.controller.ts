import { Controller, Get, Param, Query } from '@nestjs/common';
import { TourismServicesService } from './tourism-services.service';

@Controller('api/v1/tourism-services')
export class TourismServicesController {
  constructor(private readonly tourismServicesService: TourismServicesService) {}

  @Get()
  async list(@Query('place') placeSlug?: string) {
    const data = await this.tourismServicesService.list(placeSlug);
    return { data };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.tourismServicesService.getById(id);
    return { data };
  }
}
