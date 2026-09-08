import { Module } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { CommerceController } from './commerce.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CommerceController],
  providers: [CommerceService, PrismaService],
  exports: [CommerceService],
})
export class CommerceModule {}
