import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { PublicContentController } from './public-content.controller';
import { ContentService } from './content.service';
import { EntryValidatorService } from './validators/entry-validator.service';
import { SlugService } from './slug/slug.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { DiscoveryModule } from '../discovery/discovery.module';

@Module({
  imports: [DatabaseModule, DiscoveryModule],
  controllers: [ContentController, PublicContentController],
  providers: [
    ContentService,
    EntryValidatorService,
    SlugService,
  ],
  exports: [
    ContentService,
    EntryValidatorService,
    SlugService,
  ],
})
export class ContentModule {}
