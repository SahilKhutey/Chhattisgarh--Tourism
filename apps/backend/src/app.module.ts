import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { PrismaService } from './database/prisma.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { WeatherModule } from './modules/weather/weather.module';
import { TransportModule } from './modules/transport/transport.module';
import { GeoModule } from './geo/geo.module';
import { HealthModule } from './infrastructure/health/health.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { GeographyModule } from './modules/geography/geography.module';
import { ContentHealthModule } from './modules/content-health/content-health.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { PartnersModule } from './modules/partners/partners.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { ContentTemplatesModule } from './modules/content-templates/content-templates.module';
import { ContentEntriesModule } from './modules/content-entries/content-entries.module';
import { ContentModule } from './modules/content/content.module';
import { StructuredLoggerService } from './common/logger/structured-logger.service';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
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
    AnalyticsModule,
    CommunityModule,
    AggregationModule,
    WeatherModule,
    TransportModule,
    GeoModule,
    HealthModule,
    MobileModule,
    GeographyModule,
    ContentHealthModule,
    IntelligenceModule,
    AlertsModule,
    PartnersModule,
    MarketplaceModule,
    PaymentsModule,
    CommerceModule,
    RefundsModule,
    ContentTemplatesModule,
    ContentEntriesModule,
    ContentModule,
    DatabaseModule,
    RedisModule,
  ],
  providers: [
    PrismaService,
    StructuredLoggerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
  exports: [PrismaService, StructuredLoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
