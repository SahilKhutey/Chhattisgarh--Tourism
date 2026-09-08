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

import { ContentTemplatesService } from './content-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class ContentTemplatesController {
  constructor(
    private readonly service: ContentTemplatesService,
  ) {}

  @Post('admin/templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(
    @Body() dto: CreateTemplateDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.service.create(
      dto,
      userId,
    );
  }

  @Get('templates')
  findPublished() {
    return this.service.findPublished();
  }

  @Get('templates/:id')
  findById(
    @Param('id') id: string,
  ) {
    return this.service.findById(id);
  }

  @Post('admin/templates/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  publish(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.service.publish(
      id,
      userId,
    );
  }

  @Patch('admin/templates/:id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  archive(
    @Param('id') id: string,
  ) {
    return this.service.archive(id);
  }
}
