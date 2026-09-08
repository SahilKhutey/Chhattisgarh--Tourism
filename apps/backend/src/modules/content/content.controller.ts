import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { ReviewEntryDto } from './dto/review-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('entries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async create(
    @Body() dto: CreateEntryDto,
    @Req() req: any,
  ) {
    const authorId = req.user?.id || 'system';
    return this.contentService.create(dto, authorId);
  }

  @Patch('entries/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
    @Req() req: any,
  ) {
    const authorId = req.user?.id || 'system';
    return this.contentService.update(id, dto, authorId);
  }

  @Post('entries/:id/submit')
  @UseGuards(JwtAuthGuard)
  async submit(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const authorId = req.user?.id || 'system';
    return this.contentService.submit(id, authorId);
  }

  @Patch('entries/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewEntryDto,
    @Req() req: any,
  ) {
    const reviewerId = req.user?.id || 'system';
    return this.contentService.review(
      id,
      reviewerId,
      dto.approved,
      dto.note,
    );
  }

  @Get('entries/map')
  async mapEntries(
    @Query('north') north: string,
    @Query('south') south: string,
    @Query('east') east: string,
    @Query('west') west: string,
  ) {
    const n = parseFloat(north);
    const s = parseFloat(south);
    const e = parseFloat(east);
    const w = parseFloat(west);

    if (isNaN(n) || isNaN(s) || isNaN(e) || isNaN(w)) {
      // Default to Chhattisgarh state bounding box if not provided
      return this.contentService.findInBounds(24.1, 17.7, 84.4, 80.2);
    }

    return this.contentService.findInBounds(n, s, e, w);
  }

  @Get('entries')
  async publicEntries(
    @Query('templateId') templateId?: string,
    @Query('region') region?: string,
    @Query('district') district?: string,
    @Query('status') status?: string,
  ) {
    return this.contentService.findPublic(
      templateId,
      region,
      district,
      status as any,
    );
  }

  @Get('entries/:id')
  async getById(@Param('id') id: string) {
    return this.contentService.findById(id);
  }

  @Get('content/:templateSlug/:entrySlug')
  async publicEntry(
    @Param('templateSlug') templateSlug: string,
    @Param('entrySlug') entrySlug: string,
  ) {
    return this.contentService.findPublicBySlug(
      templateSlug,
      entrySlug,
    );
  }
}
