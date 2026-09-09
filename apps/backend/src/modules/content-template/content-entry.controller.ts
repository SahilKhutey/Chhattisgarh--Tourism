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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ContentEntryService } from './content-entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { ReviewEntryDto } from './dto/review-entry.dto';

@Controller('entries')
export class ContentEntryController {
  constructor(private readonly service: ContentEntryService) {}

  @Get()
  async list(
    @Query('templateId') templateId?: string,
    @Query('region') region?: string,
  ) {
    return this.service.listPublic(templateId, region);
  }

  @Get(':templateSlug/:entrySlug')
  async get(
    @Param('templateSlug') templateSlug: string,
    @Param('entrySlug') entrySlug: string,
  ) {
    return this.service.getPublic(templateSlug, entrySlug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateEntryDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @Get('moderation/pending')
  async pending() {
    return this.service.pending();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @Patch(':id/review')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewEntryDto,
    @Req() req: any,
  ) {
    const reviewerId = req.user?.id || req.user?.userId || 'moderator';
    return this.service.review(id, reviewerId, dto.action, dto.note);
  }
}
