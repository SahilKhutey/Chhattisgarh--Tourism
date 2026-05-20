import { Module } from '@nestjs/common';
import { FolkloreController } from './folklore.controller';
import { FolkloreService } from './folklore.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [FolkloreController],
  providers: [FolkloreService, PrismaService],
})
export class FolkloreModule {}
