import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DiscoveryQueryDto } from './dto/discovery-query.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { MapQueryDto } from './dto/map-query.dto';
import { BoundsDto } from './dto/bounds.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly service: DiscoveryService) {}

  @Get('search')
  async search(@Query() query: DiscoveryQueryDto) {
    return this.service.search(query);
  }

  @Get('nearby')
  async nearby(@Query() query: NearbyQueryDto) {
    if (query.lat !== undefined && query.lng !== undefined) {
      return this.service.nearby(
        query.lat,
        query.lng,
        query.radiusKm ?? 25,
        query.limit ?? 50,
      );
    }
    return this.service.nearby(
      query.latitude ?? 0,
      query.longitude ?? 0,
      query.radius ? query.radius / 1000 : 10,
      query.limit ?? 50,
    );
  }

  @Get('map')
  async map(@Query() query: MapQueryDto) {
    return this.service.map(query);
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
    return this.service.suggest(
      q || '',
      isNaN(parsedLimit) ? 8 : Math.min(parsedLimit, 8),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GEOGRAPHIC EXPLORATION ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────

  @Get('divisions')
  async divisions() {
    return this.service.getDivisions();
  }

  @Get('districts')
  async districts() {
    return this.service.getDistricts();
  }

  @Get('districts/:slug')
  async district(@Param('slug') slug: string) {
    return this.service.getDistrict(slug);
  }

  @Get('zones/:slug')
  async zone(@Param('slug') slug: string) {
    return this.service.getZone(slug);
  }

  @Get('categories/:slug')
  async category(@Param('slug') slug: string) {
    return this.service.getCategory(slug);
  }

  @Get('routes/:slug')
  async route(@Param('slug') slug: string) {
    return this.service.getRoute(slug);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INDEXER OPERATIONS (ADMIN)
  // ─────────────────────────────────────────────────────────────────────────

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
