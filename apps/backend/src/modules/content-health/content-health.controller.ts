import { Controller, Get, Param } from '@nestjs/common';
import { ContentHealthService } from './content-health.service';

@Controller('api/v1/content-health')
export class ContentHealthController {
  constructor(private readonly contentHealthService: ContentHealthService) {}

  @Get('summary')
  async summary() {
    return this.contentHealthService.getOverallSummary();
  }

  @Get('places/:id')
  async getPlaceHealth(@Param('id') id: string) {
    return this.contentHealthService.getPlaceHealth(id);
  }
}
