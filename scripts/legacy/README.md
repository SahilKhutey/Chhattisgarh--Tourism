# Archived Legacy Scripts & Historical Patches

This directory archives historical data repair, manual patching, and legacy counting scripts used during early developmental iterations of the Chhattisgarh Tourism platform.

---

## 1. Context & Purpose of Archival

Prior to the rollout of the **Generic Tourism Content Template Engine**, tourism categories (`Place`, `Folklore`) were represented as rigid tables and seeded through static JSON files with ad-hoc JavaScript patching scripts.

With the completion of:
1. Canonical schema definitions in `@cg-tourism/template-engine`
2. Dual-mode JSON/String content entry serialization in `ContentEntry`
3. The zero-downtime migration pipeline in `apps/backend/prisma/migrate-legacy-content.ts`
4. PostGIS spatial indexing and schema drift detection schedulers

these manual patching scripts are deprecated and preserved solely for historical auditability and data provenance verification.

---

## 2. Inventory of Archived Scripts

| File | Historical Purpose | Modern Replacement |
| :--- | :--- | :--- |
| `patch-seed.js` | Direct mutation of seed JSON coordinates | `prisma/seed.ts` & `migrate-legacy-content.ts` |
| `patch-seed-categories.js` | Manual assignment of category strings to legacy places | Dynamic template configuration (`ContentTemplate`) |
| `update_seed.js` | Static dataset merge and formatting script | Production schema migrations and template versioning |
| `count-db.js` | Primitive row counter for legacy database tables | Prisma client aggregation and telemetry health endpoints |
| `verify_data.js` | Sanity checks on legacy place and folklore records | `apps/backend/prisma/migrate-legacy-content.ts` parity audit |

---

## 3. Active Production Tooling

For active development, maintenance, and database migration tasks, refer to:
- `apps/backend/prisma/migrate-legacy-content.ts`: Safe migration of legacy `Place` and `Folklore` records to `ContentEntry`.
- `apps/backend/prisma/data/templates/`: Production seed definitions for Destination and Folklore templates.
- `tests/performance/template-engine/`: Performance benchmarking suite.
