import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [TransportService, PrismaService],
  exports: [TransportService],
})
export class TransportModule {}
