-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'UPDATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'UNPUBLISHED', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "ContentEntry" ADD COLUMN IF NOT EXISTS "templateVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ContentEntry" ADD COLUMN IF NOT EXISTS "slug" TEXT NOT NULL DEFAULT 'entry';
ALTER TABLE "ContentEntry" ADD COLUMN IF NOT EXISTS "district" TEXT;
ALTER TABLE "ContentEntry" ADD COLUMN IF NOT EXISTS "division" TEXT;
ALTER TABLE "ContentEntry" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ContentAuditLog" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ContentAuditLog" ADD CONSTRAINT "ContentAuditLog_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ContentAuditLog_entryId_createdAt_idx" ON "ContentAuditLog"("entryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ContentEntry_templateId_slug_key" ON "ContentEntry"("templateId", "slug");
CREATE INDEX IF NOT EXISTS "ContentEntry_templateId_status_idx" ON "ContentEntry"("templateId", "status");
CREATE INDEX IF NOT EXISTS "ContentEntry_region_status_idx" ON "ContentEntry"("region", "status");
CREATE INDEX IF NOT EXISTS "ContentEntry_district_status_idx" ON "ContentEntry"("district", "status");
