# CG Tourism Platform — Final Branch Reconciliation Matrix (FI-01)

This document establishes the authoritative reconciliation of all branches in the CG Tourism repository into the unified release baseline for **v1.0.0**.

---

## 1. Executive Summary

Development across earlier phases established specialized capability prototypes and feature branches. Through Phases 1–6 and Final Integration, all capabilities have been consolidated into a single authoritative architecture. No redundant or divergent branches remain outside this release candidate.

```
P1 (develop: governance, db foundation, security)
        ↓
P2 (feature/phase-2-tourism-data-kernel: canonical places, geo hierarchy)
        ↓
P3 (feature/phase-3-discovery-geo-search: search indexer, geo ranking)
        ↓
P4 (feature/phase-4-trip-planning: deterministic planning engine, builder UI)
        ↓
P5 (feature/phase-5-community-commerce-safety: atomic booking, creator lifecycle, SOS)
        ↓
P6 (feature/phase-6-intelligence-mobile-scale: 6-factor recommender, velocity, offline PWA)
        ↓
release/final-integration  ──▶  develop  ──▶  main (v1.0.0)
```

---

## 2. Branch Reconciliation Matrix

| Branch | Original Scope | Architectural Area | Reconciliation Status | Decision |
| :--- | :--- | :--- | :--- | :--- |
| `main` | Production release baseline | Release channel | Fast-forward to v1.0.0 once verified | **Retain as Release Channel** |
| `develop` | Integration branch | Monorepo trunk | Direct ancestor of Phase 2–6 chain (`ed9f268`) | **Retain as Integration Target** |
| `feature/p1-repository-governance` | Repository governance, scripts | Devops & Governance | Incorporated in `develop` via `scripts/repository` | **Merged into develop** |
| `feature/p2-environment-configuration` | Environment variables, `.env` | Config & Platform | Incorporated in `develop` via `src/config/` | **Merged into develop** |
| `feature/p3-database-infrastructure` | PostgreSQL, PostGIS schema | Database | Incorporated in `develop` & Phase 2 schema | **Merged into develop** |
| `feature/p4-security-hardening` | JWT, RBAC, Helmet, Throttling | Security | Incorporated in `develop` via `src/modules/auth/` | **Merged into develop** |
| `feature/p5-content-data-layer` | Content schemas, templates | Content Governance | Consolidated into Phase 2 Tourism Data Kernel | **Integrated in Phase 2** |
| `feature/p5-tourism-data-content` | Place metadata & content | Content Governance | Consolidated into Phase 2 Tourism Data Kernel | **Integrated in Phase 2** |
| `feature/p6-frontend-core` | Consumer web pages & design | Web Frontend | Consolidated into `apps/web/` | **Integrated in Phase 3** |
| `feature/p7-geospatial-system` | PostGIS spatial queries, routes | Geospatial Core | Incorporated via `src/geo/` and `src/modules/geography/` | **Integrated in Phase 2 & 3** |
| `feature/p8-real-itinerary-engine` | Planning heuristics & scoring | Trip Planner | Superseded by deterministic Phase 4 planning engine | **Integrated in Phase 4** |
| `feature/p9-social-community` | Creators, video comments, polls | Community | Hardened & verified in Phase 5 community suite | **Integrated in Phase 5** |
| `feature/p10-bookings-reviews-monetization` | Booking models & reviews | Commerce | Hardened with atomic concurrency in Phase 5 | **Integrated in Phase 5** |
| `feature/phase-11-emergency-sos` | Emergency stations & alerts | Safety | Hardened with incident lifecycle state machine | **Integrated in Phase 5** |
| `feature/p12-multilingual-accessibility-voice` | i18n, accessibility, voice | Accessibility | Preserved in `src/modules/translation/` & `apps/web` | **Integrated in develop** |
| `feature/p13-testing-ci-repair` | Test infrastructure & outbox | Testing & Reliable Outbox | Incorporated in `develop` via `22214c4` | **Merged into develop** |
| `feature/p14-offline-pwa` | PWA manifest, service worker | Offline UX | Hardened in Phase 6 with conflict sync & network-only | **Integrated in Phase 6** |
| `feature/p15-production-hardening` | Redis, observability, health | Infrastructure | Verified in Phase 6 structured logging & health probes | **Integrated in Phase 6** |
| `feature/p16-mobile` | Capacitor mobile config | Mobile Native | Reconciled in Phase 6 with cross-platform push registry | **Integrated in Phase 6** |
| `feature/p17-regional-intelligence` | Regional dashboards & metrics | Analytics | Hardened in Phase 6 with demand velocity & 6-factor ML | **Integrated in Phase 6** |
| `feature/p18-commerce-platform` | Partners, cancellations | Marketplace | Reconciled in Phase 5 with webhook idempotency | **Integrated in Phase 5** |
| `feature/phase-2-tourism-data-kernel` | Authoritative tourism data | Data Kernel | Fully integrated (`84035ed`, `e111d4c`) | **Integrated in Release** |
| `feature/phase-3-discovery-geo-search` | Search, filters, map discovery | Discovery | Fully integrated (`7ef7763`, `ca50909`, `0f3f528`) | **Integrated in Release** |
| `feature/phase-4-trip-planning` | Deterministic itinerary engine | Itinerary Engine | Fully integrated (`dbbadca`, `156ddac`, `552bb5e`) | **Integrated in Release** |
| `feature/phase-5-community-commerce-safety` | Creator, booking, SOS | Community/Safety | Fully integrated (`11ad9e2`, `faf00fe`, `9010878`, `3651289`) | **Integrated in Release** |
| `feature/phase-6-intelligence-mobile-scale` | Recommender, PWA, mobile | Intelligence/Scale | Fully integrated (`a88ba11`, `4f4cb3e`, `18c9fa3`, `79a7558`, `070f42e`) | **Integrated in Release** |

---

## 3. Duplicate Implementation Resolution

1. **Database & Schema Authority**:
   - `packages/database` was consolidated into authoritative `apps/backend/prisma/schema.prisma`.
   - SQLite configurations are removed; PostgreSQL + PostGIS is the sole database dialect.
2. **Provider Single-Ownership**:
   - `PrismaService` is provided only by `DatabaseModule`.
   - `RedisService` is provided only by `RedisModule`.
   - All other domain modules import `DatabaseModule` / `RedisModule` rather than re-instantiating.
3. **Planning & Recommendation Engines**:
   - Earlier prototype heuristics were superseded by the deterministic 6-factor recommendation engine (`recommendation.service.ts`) and deterministic constraint solver (`planning-engine.service.ts`).
4. **PWA & Offline Boundaries**:
   - Caching rules strictly bypass `/api/v1/bookings`, `/api/v1/payments`, and `/api/v1/emergency/sos` to protect transactional safety, while caching itineraries and emergency helplines in IndexedDB `v2`.
