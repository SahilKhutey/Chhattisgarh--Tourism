# CG Tourism — Final P13 Release Notes

## Release

**P13 — Final Complete Platform Integration & Production Readiness**
Version: `v1.0.0`
Date: `2026-09-12`

---

## Included Components

- **Complete Application Integration**: Connected admin template builder (P1–P7), content entry and moderation (P8–P9), public dynamic rendering (P10), lexical and geospatial discovery (P11), and semantic intelligence with Knowledge Graph (P12).
- **Transactional Outbox Engine**: Added `outbox_events` table and background polling worker (`jobs/outbox.py`) for guaranteed event dispatching.
- **Production QA & Reliability**:
  - Structured request logging with `X-Request-ID` microsecond latency tracing.
  - Multi-tier operational health checks (`/health/live`, `/health/ready`, `/api/admin/health`).
  - Standardized error schema `{ "error": { "code", "message", "details" } }`.
- **Database Index Optimization**: Added composite indexes for outbox queues, template versions, and entry status lookups.
- **Unified Tooling**: Root `Makefile`, cross-platform `verify.sh` and `verify.ps1`, `smoke.sh`, and `seed.py` data populator.
- **CI/CD Pipeline**: Added `.github/workflows/ci.yml` covering backend tests, compile checks, migrations, frontend typecheck, and production builds.

---

## Breaking Changes

**None**. All P1–P12 contracts and endpoints remain backward compatible. Dual routing (`/api/admin/content` and `/api/admin/content-entries`) ensures full compatibility with earlier admin workflows.

---

## Database Changes

- **Alembic Migration Identifier**: `p13_final_integration`
  - Created table: `outbox_events`
  - Created indexes:
    - `idx_outbox_unprocessed` on `outbox_events(processed, created_at)`
    - `idx_template_versions_template` on `template_versions(template_id, version_number)`
    - `idx_content_entries_template_status` on `content_entries(template_id, status)`
    - `idx_content_entries_version` on `content_entries(template_version_id)`
    - `idx_content_entries_status_slug` on `content_entries(status, slug)`

---

## Configuration Changes

The following environment variables are supported in `apps/api/.env` and documented in `apps/api/.env.example`:
- `DATABASE_URL`: PostgreSQL 16 + PostGIS connection string.
- `REDIS_URL`: Redis 7 instance for caching and pub/sub.
- `CACHE_TTL_SECONDS`: Public content cache TTL (default: `300`).
- `API_PREFIX`: Root API prefix (default: `/api`).
- `FRONTEND_URL`: Allowed frontend origin for CORS (default: `http://localhost:3000`).
- `SECRET_KEY` & `JWT_SECRET`: Cryptographic signing keys.
- `SEMANTIC_SEARCH_ENABLED`: Toggle for dense vector retrieval.

---

## Deployment Steps

1. **Apply Migrations**:
   ```bash
   cd apps/api
   python -m alembic upgrade head
   ```
2. **Seed Initial Platform Data (if new environment)**:
   ```bash
   python scripts/seed.py
   ```
3. **Deploy Backend Service**:
   ```bash
   cd apps/api
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```
4. **Start Outbox Worker Daemon**:
   ```bash
   python -m app.jobs.outbox
   ```
5. **Deploy Frontend Web Application**:
   ```bash
   cd apps/web
   npm run build
   npm run start
   ```
6. **Execute Smoke Tests**:
   ```bash
   bash scripts/smoke.sh
   ```
7. **Verify Health Probes**:
   - `curl http://localhost:8000/health/live`
   - `curl http://localhost:8000/health/ready`
   - `curl http://localhost:8000/api/admin/health`
