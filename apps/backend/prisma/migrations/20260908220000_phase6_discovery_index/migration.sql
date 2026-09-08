-- CreateTable
CREATE TABLE "ContentSearchIndex" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT,
    "searchableText" TEXT NOT NULL,
    "region" TEXT,
    "division" TEXT,
    "district" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "tags" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSearchIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentSearchIndex_entryId_key" ON "ContentSearchIndex"("entryId");

-- CreateIndex
CREATE INDEX "ContentSearchIndex_templateId_idx" ON "ContentSearchIndex"("templateId");

-- CreateIndex
CREATE INDEX "ContentSearchIndex_region_idx" ON "ContentSearchIndex"("region");

-- CreateIndex
CREATE INDEX "ContentSearchIndex_division_idx" ON "ContentSearchIndex"("division");

-- CreateIndex
CREATE INDEX "ContentSearchIndex_district_idx" ON "ContentSearchIndex"("district");

-- CreateIndex
CREATE INDEX "ContentSearchIndex_publishedAt_idx" ON "ContentSearchIndex"("publishedAt");

-- CreateIndex
CREATE INDEX "ContentSearchIndex_lat_lng_idx" ON "ContentSearchIndex"("lat", "lng");

-- AddForeignKey
ALTER TABLE "ContentSearchIndex" ADD CONSTRAINT "ContentSearchIndex_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
