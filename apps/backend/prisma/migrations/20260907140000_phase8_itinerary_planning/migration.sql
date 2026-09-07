-- CreateTable
CREATE TABLE "PlacePlanningProfile" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "visitorCapacity" INTEGER,
    "estimatedVisitMinutes" INTEGER NOT NULL DEFAULT 90,
    "planningEnabled" BOOLEAN NOT NULL DEFAULT true,
    "seasonalAvailability" TEXT,
    "planningNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacePlanningProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlacePlanningProfile_placeId_key" ON "PlacePlanningProfile"("placeId");

-- AddForeignKey
ALTER TABLE "PlacePlanningProfile" ADD CONSTRAINT "PlacePlanningProfile_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
