-- CG Tourism OS — PostGIS & Database Extensions Initializer
-- Mounted into /docker-entrypoint-initdb.d/ to run on container initialization

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
