import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { Throttle } from '@nestjs/throttler';

import {
  EmergencyService,
  RescueStation,
} from './emergency.service';

import { SosAlertDto } from './dto/sos-alert.dto';
import { CreateEmergencyStationDto } from './dto/create-emergency-station.dto';
import { UpdateEmergencyStationDto } from './dto/update-emergency-station.dto';
import { UpdateEmergencyStationStatusDto } from './dto/update-emergency-station-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Emergency Operations')
@Controller('emergency')
export class EmergencyController {
  constructor(
    private readonly emergencyService: EmergencyService,
  ) {}

  // ===========================================================================
  // PUBLIC / TOURIST
  // ===========================================================================

  @Post('sos')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({
    summary: 'Broadcast urgent tourist SOS alert',
  })
  @ApiBody({
    type: SosAlertDto,
    description: 'Tourist location and emergency information',
  })
  async triggerSos(
    @Body(new ValidationPipe()) dto: SosAlertDto,
  ) {
    return this.emergencyService.triggerSos(dto);
  }

  @Get('helplines')
  @ApiOperation({
    summary: 'Retrieve active emergency responder contacts',
  })
  @ApiQuery({
    name: 'district',
    type: String,
    required: false,
  })
  async getHelplines(
    @Query('district') district?: string,
  ): Promise<RescueStation[]> {
    return this.emergencyService.getHelplines(district);
  }

  // ===========================================================================
  // ADMIN
  // ===========================================================================

  @Get('stations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'List emergency stations',
  })
  @ApiQuery({
    name: 'district',
    required: false,
  })
  @ApiQuery({
    name: 'type',
    required: false,
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
  })
  async getStations(
    @Query('district') district?: string,
    @Query('type') type?: string,
    @Query('active') active?: string,
  ) {
    let activeFilter: boolean | undefined;

    if (active === 'true') {
      activeFilter = true;
    }

    if (active === 'false') {
      activeFilter = false;
    }

    return this.emergencyService.getStations({
      district,
      type,
      active: activeFilter,
    });
  }

  @Post('stations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Create emergency station',
  })
  async createStation(
    @Body(new ValidationPipe()) dto: CreateEmergencyStationDto,
  ) {
    return this.emergencyService.createStation(dto);
  }

  @Patch('stations/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Update emergency station',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  async updateStation(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateEmergencyStationDto,
  ) {
    return this.emergencyService.updateStation(id, dto);
  }

  @Patch('stations/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Activate or deactivate emergency station',
  })
  async updateStationStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe())
    dto: UpdateEmergencyStationStatusDto,
  ) {
    return this.emergencyService.updateStationStatus(
      id,
      dto.active,
    );
  }

  @Delete('stations/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Delete emergency station without alert history',
  })
  async deleteStation(@Param('id') id: string) {
    return this.emergencyService.deleteStation(id);
  }
}
