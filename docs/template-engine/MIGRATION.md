# Template & Render Engine — Legacy Content Migration Guide

This guide details the end-to-end data migration process transitioning legacy hardcoded tourism models (`Place`, `Folklore`) to the generic `ContentEntry` and `ContentTemplate` architecture.

---

## 1. Migration Strategy & Principles

1. **Non-Destructive Shadowing**: Legacy tables (`Place`, `Folklore`) remain untouched during initial migration runs. Data is read and transformed into `ContentEntry` records.
2. **Idempotency**: All migration scripts check for existing entries by unique composite key `(templateId, slug)`. Subsequent executions update rather than duplicate.
3. **Deterministic Slug Preservation**: Slugs are preserved exactly so legacy URL paths can be redirected with HTTP 301.
4. **Coordinate Normalization**: Coordinates are normalized to `latitude` and `longitude` fields, with automatic PostGIS `geography(Point, 4326)` conversion.

---

## 2. Pre-Migration Checklist

Before executing the migration in any environment (Staging, Pre-Prod, Production):

1. Take a full database snapshot:
   ```bash
   pg_dump -U postgres -d cg_tourism -F c -b -v -f /backups/cg_tourism_pre_template_migration_$(date +%Y%m%d%H%M%S).dump
   ```
2. Verify Redis connectivity and clear stale cache tags:
   ```bash
   redis-cli -h $REDIS_HOST -p $REDIS_PORT KEYS "content:*" | xargs redis-cli DEL
   ```
3. Run Prisma validation to guarantee schema integrity:
   ```bash
   pnpm --filter backend exec prisma validate
   ```

---

## 3. Mapping Specifications

### 3.1 Place $\rightarrow$ Destination (`template: destination`)

| Legacy `Place` Field | Generic `ContentEntry` Target | Transformation Rule |
| :--- | :--- | :--- |
| `id` | `data.legacyPlaceId` | Stored in JSON data for reference traceability |
| `title` | `title` | Direct copy |
| `slug` | `slug` | Direct copy |
| `description` | `summary` & `data.description` | First 240 chars to summary; full text to rich-text data field |
| `category` | `data.category` | String enum mapping |
| `district` | `data.district` | Direct copy |
| `latitude` / `lat` | `latitude` | Float normalized |
| `longitude` / `lng` | `longitude` | Float normalized |
| `images` (array) | `data.gallery` | Transformed to array of `{ url, caption }` |
| `isPublished` | `status` | `true` $\rightarrow$ `PUBLISHED`, `false` $\rightarrow$ `DRAFT` |

### 3.2 Folklore $\rightarrow$ Folklore Story (`template: folklore`)

| Legacy `Folklore` Field | Generic `ContentEntry` Target | Transformation Rule |
| :--- | :--- | :--- |
| `id` | `data.legacyFolkloreId` | Stored in JSON data |
| `title` | `title` | Direct copy |
| `slug` | `slug` | Direct copy |
| `story` | `data.storyContent` | Full markdown/rich-text content |
| `region` | `data.region` | Direct copy |
| `tribe` / `community` | `data.community` | Direct copy |
| `moral` / `significance`| `data.significance` | Direct copy |
| `audioUrl` | `data.audioGuide` | Transformed to audio guide object `{ url, language: "hi" }` |
| `isPublished` | `status` | `true` $\rightarrow$ `PUBLISHED`, `false` $\rightarrow$ `DRAFT` |

---

## 4. Migration Execution

The migration script is located at:
[`apps/backend/prisma/migrate-legacy-content.ts`](file:///c:/Users/ASUS/Documents/Unseen36Garh/Chhattisgarh--Tourism/apps/backend/prisma/migrate-legacy-content.ts)

Execute the script via:
```bash
pnpm --filter backend exec ts-node prisma/migrate-legacy-content.ts
```

### Expected Output
```
[INFO] Ensuring system templates exist...
[INFO] Template 'destination' (v1.0.0) verified with 11 fields.
[INFO] Template 'folklore' (v1.0.0) verified with 9 fields.
[INFO] Migrating Places...
[INFO] Migrated 14 Places to 'destination' entries (0 errors).
[INFO] Migrating Folklore...
[INFO] Migrated 8 Folklore to 'folklore' entries (0 errors).
[INFO] Migration completed successfully. Total entries processed: 22.
```

---

## 5. Verification & Health Audit

After running the migration script, run the automated verification:
```bash
# 1. Verify all entries are populated and readable via API
curl -s http://localhost:4000/api/v1/content-entries?status=PUBLISHED | jq '.data | length'

# 2. Check 301 redirects for legacy URLs
curl -I http://localhost:3000/places/chitrakote-falls
# Should return HTTP/1.1 301 Moved Permanently -> /content/destination/chitrakote-falls
```

---

## 6. Rollback Plan

If unexpected anomalies arise post-migration:
1. Revert traffic to legacy endpoints by flipping feature flag:
   `NEXT_PUBLIC_DYNAMIC_PUBLIC_RENDERER=false`
2. Restore database from pre-migration backup if table corruption occurred:
   ```bash
   pg_restore -U postgres -d cg_tourism -c /backups/cg_tourism_pre_template_migration_*.dump
   ```
