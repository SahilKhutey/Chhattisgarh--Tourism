import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ContentTemplateService } from './content-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Controller('templates')
export class ContentTemplateController {
  constructor(private readonly service: ContentTemplateService) {}

  @Get()
  async listPublished() {
    return this.service.listPublished();
  }

  @Get(':slug')
  async getPublished(@Param('slug') slug: string) {
    return this.service.findPublished(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  async create(@Body() dto: CreateTemplateDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
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
  @Get('admin/:id')
  async getAdmin(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/publish')
  async publish(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.publish(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/rollback')
  async rollback(
    @Param('id') id: string,
    @Body('targetVersion') targetVersion: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId || 'system';
    return this.service.rollback(id, targetVersion, userId);
  }
}
