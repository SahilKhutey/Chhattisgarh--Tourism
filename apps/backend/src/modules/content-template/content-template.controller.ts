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
import { ContentTemplateService } from './content-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

/**
 * Canonical template controller — serves both:
 *  • /admin/templates (admin CRUD and lifecycle management)
 *  • /templates       (public read-only listing and lookup)
 *
 * This is the ONLY controller that should manage ContentTemplate entities.
 * The legacy modules `content-templates/` has been decommissioned.
 */
@Controller()
export class ContentTemplateController {
  constructor(private readonly service: ContentTemplateService) {}

  // ─────────────────────────────────────────────
  // Public read-only routes: /templates
  // ─────────────────────────────────────────────

  @Get('templates')
  async listPublished() {
    return this.service.listPublished();
  }

  @Get('templates/:id')
  async getPublished(@Param('id') id: string) {
    return this.service.findPublished(id);
  }

  // ─────────────────────────────────────────────
  // Admin routes: /admin/templates
  // ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/templates')
  async findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/templates/:id')
  async getAdmin(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('admin/templates')
  async create(@Body() dto: CreateTemplateDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('admin/templates/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.update(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('admin/templates/:id/publish')
  async publish(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.publish(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('admin/templates/:id/rollback')
  async rollback(
    @Param('id') id: string,
    @Body('targetVersion') targetVersion: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.rollback(id, targetVersion, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('admin/templates/:id/archive')
  async archive(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.archive(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('admin/templates/:id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.archive(id, userId);
  }
}
