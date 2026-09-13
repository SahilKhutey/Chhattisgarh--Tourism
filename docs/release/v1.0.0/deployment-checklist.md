# Production Deployment Checklist — CG Tourism OS v1.0.0

This checklist must be executed by the deployment engineer / SRE prior to directing production traffic to v1.0.0.

---

## 1. Pre-Deployment Infrastructure Verification

- [ ] **PostgreSQL + PostGIS**: Verify database is running PostgreSQL $\ge 15$ with `postgis` extension enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`).
- [ ] **Redis**: Verify Redis cluster / instance $\ge 7.0$ is reachable with authentication and eviction policy configured (`volatile-lru`).
- [ ] **Object Storage (S3 / MinIO / Supabase Storage)**: Verify media upload bucket exists and public CDN URL is configured.
- [ ] **SMS Gateway / Push Notification Provider**: Verify Twilio / Firebase Cloud Messaging credentials are active for emergency alerts.

---

## 2. Environment Variables Configuration

Verify the following production environment variables are configured in Secret Manager:

| Variable | Description | Requirement |
| :--- | :--- | :--- |
| `NODE_ENV` | Must be set to `production` | Mandatory |
| `DATABASE_URL` | PostgreSQL connection URI | Mandatory |
| `REDIS_URL` | Redis connection URI | Mandatory |
| `JWT_SECRET` | Secure 64-char high-entropy string | Mandatory |
| `PORT` | Backend HTTP listening port (default: 4000) | Mandatory |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | Mandatory |
| `NEXT_PUBLIC_API_URL` | Backend URL for Next.js frontend | Mandatory |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Map tile provider API key | Optional |

---

## 3. Database Migration Steps

1. Run Prisma database migration up:
   ```bash
   pnpm --filter backend exec prisma migrate deploy
   ```
2. Verify PostGIS spatial indexes:
   ```sql
   SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'Place';
   ```
3. Run baseline district seed data if provisioning a fresh environment:
   ```bash
   pnpm --filter backend exec ts-node prisma/seed.ts
   ```

---

## 4. Container / Process Launch

1. Start backend process or container:
   ```bash
   node apps/backend/dist/main.js
   ```
2. Check health endpoint:
   ```bash
   curl -i http://localhost:4000/api/v1/health
   # Expected: HTTP 200 {"status":"ok","info":{"database":{"status":"up"},"redis":{"status":"up"}}}
   ```
3. Start web Next.js standalone process:
   ```bash
   node apps/web/.next/standalone/apps/web/server.js
   ```

---

## 5. Post-Deployment Smoke Tests

- [ ] Public Discovery: Browse `/discover` and ensure published places load with correct coordinates.
- [ ] Multilingual Toggle: Switch between English, Hindi, and Chhattisgarhi and confirm UI labels render without flicker.
- [ ] Itinerary Generation: Run a 3-day Bastar itinerary generation and verify deterministic return payload.
- [ ] SOS Readiness: Trigger a test emergency alert in staging/test mode and confirm dispatcher SMS broadcast.
