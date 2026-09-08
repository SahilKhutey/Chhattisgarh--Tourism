import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { SuspendPartnerDto, VerifyPartnerDto } from './dto/verify-partner.dto';
import { QueryPartnerDto } from './dto/query-partner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new regional tourism partner' })
  createPartner(@Request() req: any, @Body() dto: CreatePartnerDto) {
    const actorId = req.user?.id || req.user?.userId;
    return this.partnersService.create(dto, actorId);
  }

  @Get()
  @ApiOperation({ summary: 'List and search verified or all partners' })
  findAll(@Query() query: QueryPartnerDto) {
    return this.partnersService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get public partner profile by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.partnersService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner details by ID' })
  findById(@Param('id') id: string) {
    return this.partnersService.findById(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get partner marketplace performance statistics' })
  getStats(@Param('id') id: string) {
    return this.partnersService.getStats(id);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify or reject a partner application (Admin only)' })
  verifyPartner(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: VerifyPartnerDto,
  ) {
    const actorId = req.user?.id || req.user?.userId || 'ADMIN';
    return this.partnersService.verify(id, dto, actorId);
  }

  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend a partner (Admin only)' })
  suspendPartner(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SuspendPartnerDto,
  ) {
    const actorId = req.user?.id || req.user?.userId || 'ADMIN';
    return this.partnersService.suspend(id, dto, actorId);
  }
}
