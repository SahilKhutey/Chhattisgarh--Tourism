import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';

@Controller('api/v1/experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get()
  async list(@Query('place') placeSlug?: string) {
    const data = await this.experiencesService.list(placeSlug);
    return { data };
  }

  @Get(':slug')
  async get(@Param('slug') slug: string) {
    const data = await this.experiencesService.getBySlug(slug);
    return { data };
  }
}
