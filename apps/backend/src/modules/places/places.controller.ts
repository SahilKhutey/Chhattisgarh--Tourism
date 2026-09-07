import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseFloatPipe,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a new tourism destination',
  })
  @ApiBody({
    type: CreatePlaceDto,
  })
  async create(
    @Body(new ValidationPipe({
      whitelist: true,
      transform: true,
    }))
    dto: CreatePlaceDto,
    @Req()
    req?: AuthenticatedRequest,
  ) {
    if (req?.user?.id) {
      return this.placesService.create(dto, req.user.id);
    }
    return this.placesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve verified tourism destinations',
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getAll(
    @Query('category') categorySlug?: string,
    @Query('district') district?: string,
    @Query('search') search?: string,
  ) {
    return this.placesService.findAll(categorySlug, district, search);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Retrieve distinct tourism categories with destination counts',
  })
  async getCategories() {
    return this.placesService.getCategories();
  }

  @Get('districts')
  @ApiOperation({
    summary: 'Retrieve distinct Chhattisgarh districts with destination counts',
  })
  async getDistricts() {
    return this.placesService.getDistricts();
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Retrieve destinations within radius',
  })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radiusKm', type: Number, required: false })
  async getNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radiusKm', new DefaultValuePipe(50), ParseFloatPipe) radiusKm: number,
  ) {
    return this.placesService.findNearby(lat, lng, radiusKm);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Retrieve a tourism destination',
  })
  @ApiParam({ name: 'slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.placesService.findBySlug(slug);
  }

  @Post('semantic-search')
  @ApiOperation({
    summary: 'Search verified tourism destinations',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { type: 'number', default: 5 },
      },
      required: ['query'],
    },
  })
  async semanticSearch(
    @Body('query') query: string,
    @Body('limit', new DefaultValuePipe(5), ParseFloatPipe) limit: number,
  ) {
    return this.placesService.semanticSearch(query, limit);
  }
}
