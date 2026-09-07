import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AtisModule } from './modules/atis/atis.module';
import { PlacesModule } from './modules/places/places.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { UsersModule } from './modules/users/users.module';
import { FolkloreModule } from './modules/folklore/folklore.module';
import { StorageModule } from './modules/storage/storage.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { TranslationModule } from './modules/translation/translation.module';
import { CommunityModule } from './modules/community/community.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { PrismaService } from './database/prisma.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WeatherModule } from './modules/weather/weather.module';
import { TransportModule } from './modules/transport/transport.module';
import { GeoModule } from './geo/geo.module';
import configuration from './config/configuration';
import { envSchema } from './config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema: envSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/cdn',
    }),
    AuthModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AtisModule,
    PlacesModule,
    EmergencyModule,
    BookmarksModule,
    ReviewsModule,
    ModerationModule,
    UsersModule,
    FolkloreModule,
    StorageModule,
    ItineraryModule,
    TranslationModule,
    BookingsModule,
    CommunityModule,
    AggregationModule,
    WeatherModule,
    TransportModule,
    GeoModule,
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
