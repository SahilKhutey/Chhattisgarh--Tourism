import { Controller, Get, Param, Query } from '@nestjs/common';
import { RoutesService } from './routes.service';

@Controller('api/v1/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  async list(@Query('zone') zoneSlug?: string) {
    const data = await this.routesService.list(zoneSlug);
    return { data };
  }

  @Get(':slug')
  async get(@Param('slug') slug: string) {
    const data = await this.routesService.getBySlug(slug);
    return { data };
  }
}
