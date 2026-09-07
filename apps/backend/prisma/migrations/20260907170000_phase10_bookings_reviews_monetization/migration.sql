-- AlterTable Place
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "bookingEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "bookingPricePaise" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "bookingMaxGuests" INTEGER NOT NULL DEFAULT 20;

-- AlterTable Booking
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "unitPricePaise" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "subtotalPaise" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "platformFeePaise" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "totalPricePaise" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status");

-- AlterTable Review
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "bookingId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Review_bookingId_key" ON "Review"("bookingId");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Review_bookingId_fkey'
  ) THEN
    ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable AnalyticsEvent
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "placeId" TEXT,
    "bookingId" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_placeId_idx" ON "AnalyticsEvent"("placeId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_bookingId_idx" ON "AnalyticsEvent"("bookingId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
