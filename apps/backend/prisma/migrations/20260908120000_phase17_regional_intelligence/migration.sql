-- Phase 17 Regional Intelligence Migration

-- CreateEnum AnalyticsEventType
DO $$ BEGIN
    CREATE TYPE "AnalyticsEventType" AS ENUM (
        'PAGE_VIEW',
        'SEARCH',
        'PLACE_VIEW',
        'DISTRICT_VIEW',
        'CATEGORY_VIEW',
        'MAP_VIEW',
        'ROUTE_REQUEST',
        'ITINERARY_CREATED',
        'ITINERARY_COMPLETED',
        'SAVE_PLACE',
        'UNSAVE_PLACE',
        'SHARE_PLACE',
        'BOOKING_STARTED',
        'BOOKING_COMPLETED',
        'REVIEW_CREATED',
        'CREATOR_VIEW',
        'FOLKLORE_VIEW',
        'SOS_TRIGGERED',
        'LANGUAGE_CHANGED',
        'OFFLINE_SESSION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum AlertSeverity
DO $$ BEGIN
    CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable AnalyticsEvent
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "type" "AnalyticsEventType" NOT NULL DEFAULT 'PAGE_VIEW';
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "districtId" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "language" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "platform" TEXT;

-- Convert metadata to jsonb if it is currently text
DO $$ BEGIN
    ALTER TABLE "AnalyticsEvent" ALTER COLUMN "metadata" TYPE JSONB USING "metadata"::jsonb;
EXCEPTION
    WHEN others THEN null;
END $$;

-- AnalyticsEvent Indexes
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_districtId_idx" ON "AnalyticsEvent"("districtId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateTable TourismMetric
CREATE TABLE IF NOT EXISTS "TourismMetric" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "districtId" TEXT,
    "placeId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourismMetric_pkey" PRIMARY KEY ("id")
);

-- TourismMetric Indexes
CREATE INDEX IF NOT EXISTS "TourismMetric_metric_idx" ON "TourismMetric"("metric");
CREATE INDEX IF NOT EXISTS "TourismMetric_districtId_idx" ON "TourismMetric"("districtId");
CREATE INDEX IF NOT EXISTS "TourismMetric_placeId_idx" ON "TourismMetric"("placeId");
CREATE INDEX IF NOT EXISTS "TourismMetric_periodStart_idx" ON "TourismMetric"("periodStart");

-- CreateTable SystemAlert
CREATE TABLE IF NOT EXISTS "SystemAlert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "districtId" TEXT,
    "placeId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SystemAlert_pkey" PRIMARY KEY ("id")
);

-- SystemAlert Indexes
CREATE INDEX IF NOT EXISTS "SystemAlert_type_idx" ON "SystemAlert"("type");
CREATE INDEX IF NOT EXISTS "SystemAlert_severity_idx" ON "SystemAlert"("severity");
CREATE INDEX IF NOT EXISTS "SystemAlert_resolved_idx" ON "SystemAlert"("resolved");
CREATE INDEX IF NOT EXISTS "SystemAlert_createdAt_idx" ON "SystemAlert"("createdAt");

-- CreateTable RecommendationFeedback
CREATE TABLE IF NOT EXISTS "RecommendationFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "placeId" TEXT NOT NULL,
    "recommendationSource" TEXT NOT NULL,
    "shownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickedAt" TIMESTAMP(3),
    "savedAt" TIMESTAMP(3),
    "itineraryAddedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rating" DOUBLE PRECISION,
    "metadata" JSONB,

    CONSTRAINT "RecommendationFeedback_pkey" PRIMARY KEY ("id")
);

-- RecommendationFeedback Indexes
CREATE INDEX IF NOT EXISTS "RecommendationFeedback_placeId_idx" ON "RecommendationFeedback"("placeId");
CREATE INDEX IF NOT EXISTS "RecommendationFeedback_userId_idx" ON "RecommendationFeedback"("userId");
CREATE INDEX IF NOT EXISTS "RecommendationFeedback_recommendationSource_idx" ON "RecommendationFeedback"("recommendationSource");
