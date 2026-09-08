import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { MobileService } from './mobile.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [MobileController],
  providers: [MobileService, PrismaService],
  exports: [MobileService],
})
export class MobileModule {}
