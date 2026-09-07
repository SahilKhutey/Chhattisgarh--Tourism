-- AlterTable Place: add content governance columns
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "contentStatus" TEXT NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL DEFAULT 'INTERNAL';
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "sourceName" TEXT;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "contentOwnerId" TEXT;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- AlterTable Media: add asset storage columns and set default status
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "objectKey" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "width" INTEGER;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "height" INTEGER;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "checksumSha256" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "sourceName" TEXT;
ALTER TABLE "Media" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable PlaceVerification
CREATE TABLE IF NOT EXISTS "PlaceVerification" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "fromLevel" TEXT NOT NULL,
    "toLevel" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes on Place
CREATE INDEX IF NOT EXISTS "Place_contentStatus_idx" ON "Place"("contentStatus");
CREATE INDEX IF NOT EXISTS "Place_verificationLevel_idx" ON "Place"("verificationLevel");
CREATE INDEX IF NOT EXISTS "Place_contentOwnerId_idx" ON "Place"("contentOwnerId");
CREATE INDEX IF NOT EXISTS "Place_verified_idx" ON "Place"("verified");
CREATE INDEX IF NOT EXISTS "Place_district_idx" ON "Place"("district");
CREATE INDEX IF NOT EXISTS "Place_categoryId_idx" ON "Place"("categoryId");

-- CreateIndexes on PlaceVerification
CREATE INDEX IF NOT EXISTS "PlaceVerification_placeId_idx" ON "PlaceVerification"("placeId");
CREATE INDEX IF NOT EXISTS "PlaceVerification_reviewerId_idx" ON "PlaceVerification"("reviewerId");
CREATE INDEX IF NOT EXISTS "PlaceVerification_decision_idx" ON "PlaceVerification"("decision");
CREATE INDEX IF NOT EXISTS "PlaceVerification_createdAt_idx" ON "PlaceVerification"("createdAt");

-- CreateIndexes on Media
CREATE INDEX IF NOT EXISTS "Media_placeId_idx" ON "Media"("placeId");
CREATE INDEX IF NOT EXISTS "Media_type_idx" ON "Media"("type");
CREATE INDEX IF NOT EXISTS "Media_status_idx" ON "Media"("status");
CREATE INDEX IF NOT EXISTS "Media_checksumSha256_idx" ON "Media"("checksumSha256");

-- AddForeignKey Place -> User (contentOwner)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Place_contentOwnerId_fkey'
    ) THEN
        ALTER TABLE "Place" ADD CONSTRAINT "Place_contentOwnerId_fkey" FOREIGN KEY ("contentOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey PlaceVerification -> Place
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PlaceVerification_placeId_fkey'
    ) THEN
        ALTER TABLE "PlaceVerification" ADD CONSTRAINT "PlaceVerification_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey PlaceVerification -> User (reviewer)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PlaceVerification_reviewerId_fkey'
    ) THEN
        ALTER TABLE "PlaceVerification" ADD CONSTRAINT "PlaceVerification_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
