-- PostGIS Extension & Spatial Column Migration
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add spatial location column to ContentEntry
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'ContentEntry' AND column_name = 'location'
  ) THEN
    ALTER TABLE "ContentEntry" ADD COLUMN "location" geography(Point, 4326);
  END IF;
END $$;

-- Create GIST spatial index for high-performance geographic queries
CREATE INDEX IF NOT EXISTS "ContentEntry_location_gist_idx"
ON "ContentEntry"
USING GIST ("location");
