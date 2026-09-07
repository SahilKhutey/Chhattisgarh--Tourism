# CG Tourism OS — Database & Core Infrastructure Guide

This document defines the official database architecture, PostGIS geospatial configuration, migration baseline, seed pipelines, and operational commands for **CG Tourism OS (`Unseen36Garh`)**.

---

## 1. System Architecture

The database subsystem uses **PostgreSQL 16** with the **PostGIS 3.4** spatial extension as the permanent system of record.

```
                  CG TOURISM API KERNEL
                           │
                           ▼
                      Prisma ORM
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    Relational Tables             Spatial PostGIS
    (Users, Bookings,             (Geocoordinates,
     Places, Creators)             Radius queries, SOS)
```

- **ORM:** Prisma Client (`v5.22.0`).
- **Engine:** PostgreSQL 16 with PostGIS spatial indexing.
- **Cache & Message Broker:** Redis 7 (configured for BullMQ background queues and API rate-limiting).
- **Spatial Features:** Geocoded coordinates (`latitude`, `longitude`), radius queries for nearby attractions, and emergency dispatch corridors.

---

## 2. Environment Contract

Database connection parameters are strictly managed via validated environment variables:

| Variable | Required | Default | Security | Description |
| :--- | :---: | :---: | :---: | :--- |
| `DATABASE_URL` | Yes | — | **Confidential** | PostgreSQL connection URI (`postgresql://user:pass@host:5432/cgtourism`). |
| `POSTGRES_USER` | Yes | `postgres` | Public | Superuser / application user name. |
| `POSTGRES_PASSWORD` | Yes | — | **Critical Secret** | Password for database user. |
| `POSTGRES_DB` | Yes | `cgtourism` | Public | Logical database name. |

---

## 3. PostGIS Extension Initialization

When spinning up PostgreSQL via Docker, PostGIS extensions are automatically registered on first boot via:
[`docker/postgres/init/001-extensions.sql`](../../docker/postgres/init/001-extensions.sql):

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

To verify PostGIS inside the container:
```bash
docker compose exec postgres psql -U postgres -d cgtourism -c "SELECT PostGIS_Version();"
```

---

## 4. Migration Architecture & Baseline

### A. Provider Migration
The project migrated from legacy development SQLite to PostgreSQL in Phase P3:
- SQLite migrations were safely archived in:
  `apps/backend/prisma/migrations.sqlite.backup/`
- PostgreSQL baseline migration is located at:
  `apps/backend/prisma/migrations/0_init_postgresql/migration.sql`

### B. Development Migration
When modifying `apps/backend/prisma/schema.prisma` in local development:
```bash
cd apps/backend
pnpm prisma migrate dev --name <description>
pnpm prisma generate
```

### C. Production / Staging Deployment
In automated CI/CD and production environments:
```bash
# NEVER run migrate dev in production
cd apps/backend
pnpm prisma migrate deploy
pnpm prisma generate
```

---

## 5. Seed Pipeline & Data Ingestion

The master seed pipeline is defined in [`apps/backend/prisma/seed.ts`](../../apps/backend/prisma/seed.ts).

### Features:
- Ingests foundational travel categories, 11 landmark destinations (Chitrakote Falls, Tirathgarh, Kutumsar Caves, etc.), and multi-language translations (English, Hindi, Chhattisgarhi) from [`data/destinations/master_destinations.json`](../../apps/backend/prisma/data/destinations).
- Automatically provisions foundational Administrator and verified Creator accounts.
- **Idempotency Guarantee:** Automatically clears dependent relational records in reverse dependency order before recreation, ensuring repeat runs do not throw unique constraint or foreign-key violations.

### Running Seed:
```bash
# From repository root
pnpm db:seed

# Or directly from backend
cd apps/backend
pnpm prisma db seed
```

---

## 6. Verification & Health Diagnostic

A standalone diagnostic script verifies database connectivity, PostgreSQL engine version, and PostGIS availability:

```bash
pnpm db:verify
```

Expected output:
```
Checking PostgreSQL database connectivity...
PostgreSQL basic connection: PASS
PostgreSQL engine version: 16.x
PostGIS extension version: 3.4.x
PostGIS verification: PASS

Database verification: PASS
```

---

## 7. Production Backup & Recovery Protocols

Before applying any production schema migration, execute a binary dump of the running database:

### Backup
```bash
pg_dump "$DATABASE_URL" --format=custom --file=cgtourism-pre-migration.dump
```

### Validate Backup
```bash
pg_restore --list cgtourism-pre-migration.dump
```

### Restore (Rollback)
```bash
pg_restore -d "$DATABASE_URL" --clean --if-exists cgtourism-pre-migration.dump
```
