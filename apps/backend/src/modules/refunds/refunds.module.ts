import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [RefundsController],
  providers: [RefundsService, PrismaService],
  exports: [RefundsService],
})
export class RefundsModule {}
