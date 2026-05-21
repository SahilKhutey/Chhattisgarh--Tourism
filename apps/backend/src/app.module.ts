import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PlacesModule } from './modules/places/places.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { UsersModule } from './modules/users/users.module';
import { FolkloreModule } from './modules/folklore/folklore.module';
import { StorageModule } from './modules/storage/storage.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { PrismaService } from './database/prisma.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    PlacesModule,
    EmergencyModule,
    BookmarksModule,
    ReviewsModule,
    ModerationModule,
    UsersModule,
    FolkloreModule,
    StorageModule,
    ItineraryModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
  exports: [PrismaService],
})
export class AppModule {}
