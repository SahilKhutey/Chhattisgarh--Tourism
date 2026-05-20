import { Controller, Post, Get, Body, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { EmergencyService, RescueStation } from './emergency.service';
import { SosAlertDto } from './dto/sos-alert.dto';

@ApiTags('Emergency Operations')
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('sos')
  @ApiOperation({ summary: 'Broadcast urgent tourist SOS alerts' })
  @ApiBody({ type: SosAlertDto, description: 'Tourist location parameters' })
  async triggerSos(@Body(new ValidationPipe()) dto: SosAlertDto) {
    return this.emergencyService.triggerSos(dto);
  }

  @Get('helplines')
  @ApiOperation({ summary: 'Retrieve nearest emergency medical and police contacts' })
  @ApiQuery({ name: 'district', type: String, required: false, description: 'Filter contacts by district' })
  async getHelplines(@Query('district') district?: string): Promise<RescueStation[]> {
    return this.emergencyService.getHelplines(district);
  }
}
