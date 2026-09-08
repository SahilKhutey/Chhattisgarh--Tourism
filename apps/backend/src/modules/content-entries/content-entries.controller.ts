import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContentEntriesService } from './content-entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { ReviewEntryDto } from './dto/review-entry.dto';
import { QueryEntriesDto } from './dto/query-entries.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EntryStatus } from '@prisma/client';

@Controller('entries')
export class ContentEntriesController {
  constructor(private readonly service: ContentEntriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  create(@Body() dto: CreateEntryDto, @Req() req: any) {
    const authorId = req.user?.id || 'system';
    return this.service.create(dto, authorId);
  }

  @Get()
  findAll(@Query() query: QueryEntriesDto) {
    // If status is not explicitly queried, default to PUBLISHED for public consumers
    const queryParams: QueryEntriesDto = {
      ...query,
      status: query.status ?? EntryStatus.PUBLISHED,
    };
    return this.service.findAll(queryParams);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system';
    const userRole = req.user?.role;
    return this.service.update(id, dto, userId, userRole);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewEntryDto,
    @Req() req: any,
  ) {
    const reviewerId = req.user?.id || 'moderator';
    return this.service.review(id, dto, reviewerId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system';
    const userRole = req.user?.role;
    return this.service.delete(id, userId, userRole);
  }
}
