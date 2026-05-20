import { Controller, Get, Post, Body, Param, Query, ParseFloatPipe, DefaultValuePipe, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new tourism destination (Contributor Upload)' })
  @ApiBody({ type: CreatePlaceDto, description: 'Required place parameters' })
  async create(@Body(new ValidationPipe()) dto: CreatePlaceDto) {
    return this.placesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all verified tourism destinations' })
  @ApiQuery({ name: 'category', type: String, required: false, description: 'Category slug (e.g. waterfalls)' })
  @ApiQuery({ name: 'district', type: String, required: false, description: 'District filtering (e.g. Bastar)' })
  async getAll(
    @Query('category') categorySlug?: string,
    @Query('district') district?: string,
  ) {
    return this.placesService.findAll(categorySlug, district);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Retrieve destinations within radius of coordinates' })
  @ApiQuery({ name: 'lat', type: Number, required: true })
  @ApiQuery({ name: 'lng', type: Number, required: true })
  @ApiQuery({ name: 'radiusKm', type: Number, required: false })
  async getNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radiusKm', new DefaultValuePipe(50), ParseFloatPipe) radiusKm: number,
  ) {
    return this.placesService.findNearby(lat, lng, radiusKm);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve a single place detailed description' })
  @ApiParam({ name: 'slug', type: String, description: 'Slug representation (e.g. chitrakote-falls)' })
  async getBySlug(@Param('slug') slug: string) {
    return this.placesService.findBySlug(slug);
  }
}
