import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { PlaceContentController } from './place-content.controller';
import { PlaceContentService } from './place-content.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [PlacesController, PlaceContentController],
  providers: [PlacesService, PlaceContentService, PrismaService],
  exports: [PlacesService, PlaceContentService],
})
export class PlacesModule {}
