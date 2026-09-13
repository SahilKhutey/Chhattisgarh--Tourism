-- Enable PostGIS & pg_trgm Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add spatial location column to Place
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Place' AND column_name = 'location'
  ) THEN
    ALTER TABLE "Place" ADD COLUMN "location" geography(Point, 4326);
  END IF;
END $$;

-- Populate spatial location from latitude and longitude if present
UPDATE "Place"
SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
WHERE "location" IS NULL AND "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

-- Create GIST spatial index on Place location
CREATE INDEX IF NOT EXISTS "place_location_gist_idx"
ON "Place"
USING GIST ("location");

-- Create GIN trigram index on Place name for fast fuzzy search
CREATE INDEX IF NOT EXISTS "place_name_trgm_idx"
ON "Place"
USING GIN ("name" gin_trgm_ops);
