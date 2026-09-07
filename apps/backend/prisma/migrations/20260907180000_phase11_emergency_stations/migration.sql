-- CreateTable EmergencyStation
CREATE TABLE IF NOT EXISTS "EmergencyStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "division" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "capabilities" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyStation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmergencyStation_name_key" ON "EmergencyStation"("name");
CREATE INDEX IF NOT EXISTS "EmergencyStation_district_idx" ON "EmergencyStation"("district");
CREATE INDEX IF NOT EXISTS "EmergencyStation_division_idx" ON "EmergencyStation"("division");
CREATE INDEX IF NOT EXISTS "EmergencyStation_type_idx" ON "EmergencyStation"("type");
CREATE INDEX IF NOT EXISTS "EmergencyStation_active_idx" ON "EmergencyStation"("active");
CREATE INDEX IF NOT EXISTS "EmergencyStation_latitude_longitude_idx" ON "EmergencyStation"("latitude", "longitude");

-- AlterTable EmergencyAlert
ALTER TABLE "EmergencyAlert" ADD COLUMN IF NOT EXISTS "primaryResponderId" TEXT;
ALTER TABLE "EmergencyAlert" ADD COLUMN IF NOT EXISTS "backupResponders" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "EmergencyAlert" ADD COLUMN IF NOT EXISTS "dispatchMetadata" TEXT NOT NULL DEFAULT '{}';

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'EmergencyAlert_primaryResponderId_fkey'
  ) THEN
    ALTER TABLE "EmergencyAlert" ADD CONSTRAINT "EmergencyAlert_primaryResponderId_fkey" FOREIGN KEY ("primaryResponderId") REFERENCES "EmergencyStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmergencyAlert_status_idx" ON "EmergencyAlert"("status");
CREATE INDEX IF NOT EXISTS "EmergencyAlert_createdAt_idx" ON "EmergencyAlert"("createdAt");
CREATE INDEX IF NOT EXISTS "EmergencyAlert_primaryResponderId_idx" ON "EmergencyAlert"("primaryResponderId");
