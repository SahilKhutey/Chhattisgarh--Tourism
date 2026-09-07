import { Module } from '@nestjs/common';

import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';
import { EmergencyDispatcher } from './emergency.dispatcher';

import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [
    EmergencyController,
  ],

  providers: [
    EmergencyService,
    EmergencyDispatcher,
    PrismaService,
  ],

  exports: [
    EmergencyService,
  ],
})
export class EmergencyModule {}
