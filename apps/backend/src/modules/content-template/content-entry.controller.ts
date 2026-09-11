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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ContentEntryService } from './content-entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { ReviewEntryDto } from './dto/review-entry.dto';
import { QueryEntriesDto } from './dto/query-entries.dto';

/**
 * Canonical entry controller — serves both:
 *  • /content-entries  (creator portal API)
 *  • /entries          (public and moderation API)
 *
 * This is the ONLY controller that manages ContentEntry entities.
 * The legacy modules `content-entries/` and `content/` have been decommissioned.
 */
@Controller()
export class ContentEntryController {
  constructor(private readonly service: ContentEntryService) {}

  // ─────────────────────────────────────────────
  // Shared public listing route (both /entries and /content-entries)
  // ─────────────────────────────────────────────

  @Get('entries')
  async listEntries(
    @Query('templateId') templateId?: string,
    @Query('region') region?: string,
    @Query('district') district?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listPublic(templateId, region);
  }

  @Get('content-entries')
  async listContentEntries(
    @Query('templateId') templateId?: string,
    @Query('region') region?: string,
    @Query('district') district?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listPublic(templateId, region);
  }

  @Get('entries/:templateSlug/:entrySlug')
  async getEntry(
    @Param('templateSlug') templateSlug: string,
    @Param('entrySlug') entrySlug: string,
  ) {
    return this.service.getPublic(templateSlug, entrySlug);
  }

  @Get('content-entries/:id')
  async getEntryById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  // ─────────────────────────────────────────────
  // Creator routes (authenticated)
  // ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('entries')
  async createEntry(@Body() dto: CreateEntryDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('content-entries')
  async createContentEntry(@Body() dto: CreateEntryDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('entries/:id/submit')
  async submitEntry(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.submit(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('entries/:id')
  async updateEntry(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.update(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('content-entries/:id')
  async updateContentEntry(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.update(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('entries/:id')
  async deleteEntry(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.delete(id, userId);
  }

  // ─────────────────────────────────────────────
  // Moderation routes
  // ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @Get('entries/moderation/pending')
  async pending() {
    return this.service.pending();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @Patch('entries/:id/review')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewEntryDto,
    @Req() req: any,
  ) {
    const reviewerId = req.user?.id || req.user?.userId || 'moderator';
    return this.service.review(id, reviewerId, dto.action, dto.note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @Patch('content-entries/:id/review')
  async reviewContentEntry(
    @Param('id') id: string,
    @Body() dto: ReviewEntryDto,
    @Req() req: any,
  ) {
    const reviewerId = req.user?.id || req.user?.userId || 'moderator';
    return this.service.review(id, reviewerId, dto.action, dto.note);
  }

  // ─────────────────────────────────────────────
  // Geo / map endpoint
  // ─────────────────────────────────────────────

  @Get('entries/map')
  async mapEntries(
    @Query('north') north: string,
    @Query('south') south: string,
    @Query('east') east: string,
    @Query('west') west: string,
    @Query('templateId') templateId?: string,
  ) {
    const n = parseFloat(north);
    const s = parseFloat(south);
    const e = parseFloat(east);
    const w = parseFloat(west);

    if (isNaN(n) || isNaN(s) || isNaN(e) || isNaN(w)) {
      // Default to Chhattisgarh state bounding box
      return this.service.findInBounds(24.1, 17.7, 84.4, 80.2, templateId);
    }

    return this.service.findInBounds(n, s, e, w, templateId);
  }

  // ─────────────────────────────────────────────
  // Slug-based public entry route: /content/:templateSlug/:entrySlug
  // ─────────────────────────────────────────────

  @Get('content/:templateSlug/:entrySlug')
  async publicEntry(
    @Param('templateSlug') templateSlug: string,
    @Param('entrySlug') entrySlug: string,
  ) {
    return this.service.getPublic(templateSlug, entrySlug);
  }

  @Get('public/content/:templateSlug/:entrySlug')
  async publicContentEntry(
    @Param('templateSlug') templateSlug: string,
    @Param('entrySlug') entrySlug: string,
  ) {
    return this.service.getPublic(templateSlug, entrySlug);
  }
}
