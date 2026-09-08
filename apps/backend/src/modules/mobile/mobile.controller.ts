import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MobileService } from './mobile.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UnregisterDeviceDto } from './dto/unregister-device.dto';

@ApiTags('Mobile Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('devices/register')
  @ApiOperation({ summary: 'Register or refresh native mobile device token for push notifications' })
  @ApiResponse({ status: 201, description: 'Device token registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async register(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: RegisterDeviceDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.mobileService.registerDevice(userId, dto);
  }

  @Delete('devices/register')
  @ApiOperation({ summary: 'Deactivate native mobile device token upon sign-out' })
  @ApiResponse({ status: 200, description: 'Device token unregistered successfully' })
  @ApiResponse({ status: 404, description: 'Device not found or not owned by user' })
  async unregister(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: UnregisterDeviceDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.mobileService.unregisterDevice(userId, dto.deviceToken);
  }
}
