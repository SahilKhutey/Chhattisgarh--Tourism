import { Module } from '@nestjs/common';
import { ContentEntriesController } from './content-entries.controller';
import { ContentEntriesService } from './content-entries.service';
import { ContentTemplatesModule } from '../content-templates/content-templates.module';
import { PrismaService } from '../../database/prisma.service';
import { SpatialService } from '../../infrastructure/database/spatial.service';

@Module({
  imports: [ContentTemplatesModule],
  controllers: [ContentEntriesController],
  providers: [ContentEntriesService, PrismaService, SpatialService],
  exports: [ContentEntriesService],
})
export class ContentEntriesModule {}
