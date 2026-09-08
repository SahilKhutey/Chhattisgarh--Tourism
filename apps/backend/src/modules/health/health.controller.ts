import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'System Liveness Probe' })
  @ApiResponse({ status: 200, description: 'Service is healthy and responding' })
  getLiveness() {
    return this.healthService.checkLiveness();
  }

  @Get('live')
  @ApiOperation({ summary: 'Kubernetes/Container Liveness Probe' })
  @ApiResponse({ status: 200, description: 'Container process is active' })
  getLive() {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'System Readiness Probe' })
  @ApiResponse({ status: 200, description: 'All core dependencies are operational' })
  @ApiResponse({ status: 503, description: 'Critical dependency failure' })
  async getReadiness(@Res({ passthrough: true }) res: Response) {
    const readiness = await this.healthService.checkReadiness();
    if (readiness.status !== 'ok') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return readiness;
  }
}
