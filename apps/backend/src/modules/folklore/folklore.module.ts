import { Module } from '@nestjs/common';
import { FolkloreController } from './folklore.controller';
import { FolkloreService } from './folklore.service';

@Module({
  controllers: [FolkloreController],
  providers: [FolkloreService],
})
export class FolkloreModule {}
