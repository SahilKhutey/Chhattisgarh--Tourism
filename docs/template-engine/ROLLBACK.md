# Template & Render Engine — Rollback & Disaster Recovery Runbook

This document defines disaster recovery procedures, pointer-based rollbacks, and incident runbooks for the Generic Tourism Template & Render Engine.

---

## 1. Rollback Taxonomy

The system supports three tiers of rollback depending on the severity of the incident:

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1: Pointer-Based Rollback (Zero Downtime, < 1 min)    │
│   Revert template active version pointer to previous snapshot│
├─────────────────────────────────────────────────────────────┤
│ Level 2: Traffic Rollback (Zero Downtime, < 2 min)          │
│   Toggle feature flags to route traffic away from failure   │
├─────────────────────────────────────────────────────────────┤
│ Level 3: Database Point-In-Time Recovery (Downtime required)│
│   Restore PostgreSQL cluster from physical/logical snapshot │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Level 1: Pointer-Based Template Version Rollback

When a newly published template version causes validation or display issues:

### Procedure
1. Navigate to Admin CMS: `/admin/templates/:id/versions` or use the Admin API:
   ```bash
   POST /api/v1/admin/templates/:id/rollback
   Content-Type: application/json
   Authorization: Bearer <ADMIN_TOKEN>

   {
     "targetVersionId": "ver_destination_v1_0_0",
     "reason": "Regressed validation rule on district selection"
   }
   ```
2. The `ContentTemplateService.rollbackVersion()` method executes the following atomic operations:
   - Updates `ContentTemplate.currentVersionId` to point to the target version snapshot.
   - Re-syncs `TemplateField` records to mirror the snapshot schema.
   - Clears Redis template cache tags: `CACHE:TEMPLATE:<id>`.
3. Existing entries authored under the rolled-back version remain intact and pinned to their historical version snapshot.

---

## 3. Level 2: Traffic Rollback (Feature Flags)

If the dynamic rendering layer experiences an unhandled exception or critical security vulnerability:

### Procedure
1. Revert public traffic to legacy renderer or maintenance fallback by setting:
   ```env
   FEATURE_DYNAMIC_PUBLIC_RENDERER=false
   FEATURE_LEGACY_REDIRECTS=false
   ```
2. Redeploy frontend or update edge environment variables (Vercel / Cloudflare / Docker):
   ```bash
   # If using Docker / Kubernetes
   kubectl set env deployment/web FEATURE_DYNAMIC_PUBLIC_RENDERER=false
   ```
3. Purge edge CDN cache:
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"purge_everything": true}'
   ```

---

## 4. Level 3: Database Point-In-Time Recovery (PITR)

For catastrophic data corruption:

1. Put backend in read-only maintenance mode:
   ```env
   MAINTENANCE_MODE=true
   ```
2. Identify the target recovery timestamp (e.g., `2026-09-09 09:30:00 UTC`):
3. Stop backend services:
   ```bash
   docker-compose stop backend
   ```
4. Restore PostgreSQL database from latest physical backup and replay WAL logs up to the recovery timestamp:
   ```bash
   pg_restore -U postgres -d cg_tourism -c /backups/cg_tourism_pre_template_migration.dump
   ```
5. Run Prisma consistency check:
   ```bash
   pnpm --filter backend exec prisma db pull
   ```
6. Restart backend services and disable maintenance mode.

---

## 5. Incident Runbooks

### Incident A: Schema Drift Detected in Published Entries
- **Symptom**: Alert fired by `TemplateDriftScheduler`: Entries exist with fields missing from current template version.
- **Triage**: Run drift inspection query:
  ```bash
  GET /api/v1/admin/templates/:id/drift
  ```
- **Remediation**:
  1. If fields were accidentally deleted, rollback template version using Level 1 procedure.
  2. If intentional breaking change, trigger migration script to backfill default values for existing entries.

### Incident B: Malformed JSON Entry Failing Render
- **Symptom**: Sentry alert `RenderError: Cannot read properties of undefined (reading 'url')` on `/content/destination/:slug`.
- **Triage**: Inspect entry data payload via moderator console or database query:
  ```sql
  SELECT id, title, data FROM "ContentEntry" WHERE slug = 'bastar-falls';
  ```
- **Remediation**:
  1. `DynamicEntryPage` uses safe accessor fallbacks (`data?.gallery?.[0]?.url ?? '/placeholder.jpg'`) to prevent hard crashes.
  2. Moderator rejects or edits the entry data payload to correct malformed structures.

### Incident C: High Latency in PostGIS Geo-Queries
- **Symptom**: Radius queries taking $> 500\text{ms}$.
- **Triage**: Inspect query plan:
  ```sql
  EXPLAIN ANALYZE SELECT id, title FROM "ContentEntry"
  WHERE ST_DWithin(location, ST_MakePoint(81.6296, 21.2514)::geography, 50000);
  ```
- **Remediation**:
  1. Ensure GIST index exists:
     ```sql
     CREATE INDEX IF NOT EXISTS content_entry_location_gist ON "ContentEntry" USING GIST(location);
     ```
  2. Run `VACUUM ANALYZE "ContentEntry";` to update PostgreSQL query planner statistics.
