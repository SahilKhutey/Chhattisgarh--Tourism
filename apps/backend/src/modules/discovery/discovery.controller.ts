import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { SearchDto } from './dto/search.dto';
import { NearbyDto } from './dto/nearby.dto';
import { BoundsDto } from './dto/bounds.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly service: DiscoveryService) {}

  @Get('search')
  async search(@Query() dto: SearchDto) {
    return this.service.search({
      q: dto.q,
      templateId: dto.templateId,
      region: dto.region,
      division: dto.division,
      district: dto.district,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
    });
  }

  @Get('nearby')
  async nearby(@Query() dto: NearbyDto) {
    return this.service.nearby(
      dto.lat,
      dto.lng,
      dto.radiusKm ?? 25,
      dto.limit ?? 50,
    );
  }

  @Get('bounds')
  async bounds(@Query() dto: BoundsDto) {
    return this.service.bounds(
      dto.north,
      dto.south,
      dto.east,
      dto.west,
    );
  }

  @Get('suggestions')
  async suggestions(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 8;
    return this.service.suggest(q || '', isNaN(parsedLimit) ? 8 : parsedLimit);
  }

  @Get('index/:entryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async indexGet(@Param('entryId') entryId: string) {
    await this.service.index(entryId);
    return { success: true, entryId };
  }

  @Post('index/:entryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async indexPost(@Param('entryId') entryId: string) {
    await this.service.index(entryId);
    return { success: true, entryId };
  }

  @Post('rebuild')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async rebuild() {
    return this.service.rebuild();
  }
}
