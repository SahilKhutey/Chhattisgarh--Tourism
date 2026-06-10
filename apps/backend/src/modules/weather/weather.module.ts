import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [WeatherService, PrismaService],
  exports: [WeatherService],
})
export class WeatherModule {}
