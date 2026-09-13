-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('DRAFT', 'PLANNING', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TripPace" AS ENUM ('RELAXED', 'BALANCED', 'FAST');

-- CreateEnum
CREATE TYPE "ItineraryStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ItineraryGenerator" AS ENUM ('MANUAL', 'RULE_ENGINE', 'AI_ASSISTED');

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "originLatitude" DECIMAL(10,7),
    "originLongitude" DECIMAL(10,7),
    "travelers" INTEGER NOT NULL DEFAULT 1,
    "status" "TripStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPreference" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "categories" JSONB,
    "pace" "TripPace" NOT NULL DEFAULT 'BALANCED',
    "accessibility" BOOLEAN NOT NULL DEFAULT false,
    "preferredStart" TEXT,
    "preferredEnd" TEXT,

    CONSTRAINT "TripPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripConstraint" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "maxDailyDistanceKm" DECIMAL(10,2),
    "maxDailyTravelMin" INTEGER,
    "budgetAmount" DECIMAL(12,2),
    "requiredPlaceIds" JSONB,
    "excludedPlaceIds" JSONB,

    CONSTRAINT "TripConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ItineraryStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedBy" "ItineraryGenerator" NOT NULL DEFAULT 'MANUAL',
    "totalDistanceKm" DECIMAL(12,2),
    "totalDurationMin" INTEGER,
    "estimatedCost" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryDay" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sequence" INTEGER NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,

    CONSTRAINT "ItineraryDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryStop" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "experienceId" TEXT,
    "sequence" INTEGER NOT NULL,
    "arrivalTime" TEXT,
    "departureTime" TEXT,
    "travelFromPreviousMin" INTEGER,
    "visitDurationMin" INTEGER,
    "estimatedCost" DECIMAL(12,2),
    "reason" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ItineraryStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trip_userId_idx" ON "Trip"("userId");
CREATE INDEX "Trip_startDate_endDate_idx" ON "Trip"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "TripPreference_tripId_key" ON "TripPreference"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripConstraint_tripId_key" ON "TripConstraint"("tripId");

-- CreateIndex
CREATE INDEX "Itinerary_tripId_idx" ON "Itinerary"("tripId");
CREATE INDEX "Itinerary_status_idx" ON "Itinerary"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryDay_itineraryId_sequence_key" ON "ItineraryDay"("itineraryId", "sequence");
CREATE UNIQUE INDEX "ItineraryDay_itineraryId_date_key" ON "ItineraryDay"("itineraryId", "date");

-- CreateIndex
CREATE INDEX "ItineraryStop_placeId_idx" ON "ItineraryStop"("placeId");
CREATE UNIQUE INDEX "ItineraryStop_dayId_sequence_key" ON "ItineraryStop"("dayId", "sequence");

-- AddForeignKey
ALTER TABLE "TripPreference" ADD CONSTRAINT "TripPreference_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripConstraint" ADD CONSTRAINT "TripConstraint_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryDay" ADD CONSTRAINT "ItineraryDay_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryStop" ADD CONSTRAINT "ItineraryStop_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "ItineraryDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryStop" ADD CONSTRAINT "ItineraryStop_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryStop" ADD CONSTRAINT "ItineraryStop_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE SET NULL ON UPDATE CASCADE;
