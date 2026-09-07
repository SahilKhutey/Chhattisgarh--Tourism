-- Enable PostGIS and PostGIS Topology extensions if not present
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- CreateEnum
CREATE TYPE "GeoStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameHi" TEXT,
    "code" TEXT NOT NULL,
    "status" "GeoStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameHi" TEXT,
    "code" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "status" "GeoStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TouristZone" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "status" "GeoStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TouristZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistrictBoundary" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceVersion" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictBoundary_pkey" PRIMARY KEY ("id")
);

-- Add PostGIS MultiPolygon geometry column to DistrictBoundary
ALTER TABLE "DistrictBoundary" ADD COLUMN IF NOT EXISTS "geometry" geometry(MultiPolygon, 4326);

-- CreateTable
CREATE TABLE "GeoPlace" (
    "id" TEXT NOT NULL,
    "touristZoneId" TEXT NOT NULL,
    "externalPlaceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "elevationM" DECIMAL(8,2),
    "status" "GeoStatus" NOT NULL DEFAULT 'ACTIVE',
    "coordinateValidated" BOOLEAN NOT NULL DEFAULT false,
    "boundaryValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoPlace_pkey" PRIMARY KEY ("id")
);

-- AlterTable Place
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "districtRelId" TEXT;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "touristZoneId" TEXT;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "coordinateValidated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "boundaryValidated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Division_slug_key" ON "Division"("slug");
CREATE UNIQUE INDEX "Division_code_key" ON "Division"("code");
CREATE INDEX "Division_status_idx" ON "Division"("status");
CREATE INDEX "Division_slug_idx" ON "Division"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "District_slug_key" ON "District"("slug");
CREATE UNIQUE INDEX "District_code_key" ON "District"("code");
CREATE INDEX "District_divisionId_idx" ON "District"("divisionId");
CREATE INDEX "District_status_idx" ON "District"("status");
CREATE INDEX "District_slug_idx" ON "District"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TouristZone_slug_key" ON "TouristZone"("slug");
CREATE INDEX "TouristZone_districtId_idx" ON "TouristZone"("districtId");
CREATE INDEX "TouristZone_status_idx" ON "TouristZone"("status");
CREATE INDEX "TouristZone_slug_idx" ON "TouristZone"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DistrictBoundary_districtId_key" ON "DistrictBoundary"("districtId");
CREATE INDEX "DistrictBoundary_districtId_idx" ON "DistrictBoundary"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "GeoPlace_externalPlaceId_key" ON "GeoPlace"("externalPlaceId");
CREATE UNIQUE INDEX "GeoPlace_slug_key" ON "GeoPlace"("slug");
CREATE INDEX "GeoPlace_touristZoneId_idx" ON "GeoPlace"("touristZoneId");
CREATE INDEX "GeoPlace_latitude_longitude_idx" ON "GeoPlace"("latitude", "longitude");
CREATE INDEX "GeoPlace_status_idx" ON "GeoPlace"("status");

-- CreateIndex on Place for relational geospatial queries
CREATE INDEX "Place_districtRelId_idx" ON "Place"("districtRelId");
CREATE INDEX "Place_touristZoneId_idx" ON "Place"("touristZoneId");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TouristZone" ADD CONSTRAINT "TouristZone_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistrictBoundary" ADD CONSTRAINT "DistrictBoundary_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoPlace" ADD CONSTRAINT "GeoPlace_touristZoneId_fkey" FOREIGN KEY ("touristZoneId") REFERENCES "TouristZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_districtRelId_fkey" FOREIGN KEY ("districtRelId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_touristZoneId_fkey" FOREIGN KEY ("touristZoneId") REFERENCES "TouristZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
