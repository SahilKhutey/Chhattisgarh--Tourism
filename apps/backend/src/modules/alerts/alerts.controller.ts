import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Controller('api/v1/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async getActiveAlerts() {
    return this.alertsService.getActiveAlerts();
  }

  @Get('all')
  async getAllAlerts() {
    return this.alertsService.getAllAlerts();
  }

  @Post()
  async createAlert(@Body() dto: CreateAlertDto) {
    return this.alertsService.create(dto);
  }

  @Patch(':id/resolve')
  async resolveAlert(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }
}
