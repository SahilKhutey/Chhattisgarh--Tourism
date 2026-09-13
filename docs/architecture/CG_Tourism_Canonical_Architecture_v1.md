# CG Tourism OS — Canonical Architecture Specification v1
**Status**: Authoritative Architectural Baseline  
**Target Platform**: Monorepo Modular Monolith (NestJS + Next.js App Router + FastAPI Intelligence Service + PostgreSQL/PostGIS + Redis)

---

## 1. Executive Summary & Evolutionary History

The **CG Tourism OS (Unseen36Garh)** platform has evolved across 17 sequential feature and infrastructure tracks:

```
v2-creators-and-performance
  └── P3 (PostgreSQL / PostGIS Infrastructure)
       └── P6 (Frontend Core / UI System)
            └── P7 (Geospatial / Regional Intelligence)
                 └── P8 (Deterministic Itinerary Planner)
                      └── P9 (Community / Creator Platform)
                           └── P10 (Bookings / Verified Reviews)
                                └── P11 (Emergency SOS Dispatch)
                                     └── P12 (Multilingual / Voice / A11y)
                                          └── P13 (Testing / CI / QA Suite)
                                               └── P14 (Offline PWA / IndexedDB)
                                                    └── P15 (Production Hardening)
                                                         └── P16 (Mobile Native Capacitor)
                                                              └── P17 (ATIS Regional Intelligence)
                                                                   └── P18 (Commerce & Template Engine)
                                                                        └── develop & main (Commit 11febad)
```

The platform is no longer merely a tourism catalog; it is an integrated **Regional Tourism Operating System** uniting:
* **Regional Tourism Data & Geospatial Intelligence**
* **Consumer Discovery, Voice UI & Offline Navigation**
* **Deterministic Trip Planning & Eco Constraints**
* **Creator Community & Governed Folklore Ingestion**
* **Regional Commerce & Marketplace Transactions**
* **Safety, Emergency SOS & Operational Dispatch**
* **Continuous Regional Telemetry & Closed-Loop Intelligence**

---

## 2. The 16 Logical Platform Services

Rather than premature distributed microservices, these 16 logical services reside within the **Modular Monolith** architecture:

```
┌──────────────────────────────────────────────────────────────┐
│                        CG TOURISM OS                         │
├──────────────────────────────┬───────────────────────────────┤
│ 01. Identity & Access        │ 09. Planning & Itinerary      │
│ 02. Regional Geography       │ 10. Community & Creator       │
│ 03. Content Kernel           │ 11. Commerce & Marketplace    │
│ 04. Template Engine          │ 12. Booking & Reviews         │
│ 05. Media & Assets           │ 13. Safety & Emergency        │
│ 06. Governance & Trust       │ 14. Language & Accessibility  │
│ 07. Discovery & Search       │ 15. Notifications & Alerts    │
│ 08. Tourism Intelligence     │ 16. Analytics & Operations    │
└──────────────────────────────┴───────────────────────────────┘
```

### Service Breakdown & Monolith Mapping

| ID | Logical Service | Backend Module / Package | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **S01** | **Identity & Access** | `apps/backend/src/modules/auth`, `users` | Registration, JWT, Refresh Tokens, fine-grained RBAC/ABAC (User $\rightarrow$ Role $\rightarrow$ Permission $\rightarrow$ Resource $\rightarrow$ Action). |
| **S02** | **Regional Geography** | `apps/backend/src/modules/geography`, `geo` | Spatial PostGIS hierarchy: `State` $\rightarrow$ `Division` $\rightarrow$ `District` $\rightarrow$ `TouristZone` $\rightarrow$ `GeoPlace` $\rightarrow$ `Route`. |
| **S03** | **Content Kernel** | `apps/backend/src/modules/content-template`, `content-health` | The single content storage engine. Schema validation, version snapshots, immutable revisions, content lifecycle. |
| **S04** | **Template Engine** | `packages/template-engine`, `packages/content-schema` | Schema abstraction layer defining fields, validation rules, UI widgets, and translation requirements for tourism entities. |
| **S05** | **Media & Assets** | `apps/backend/src/modules/storage` | Asset ingestion, SHA256 checksums, automated image/video optimization, CDN delivery, and ownership provenance. |
| **S06** | **Governance & Trust** | `apps/backend/src/modules/moderation`, `content-health` | Enforcing the 4-Axis Trust Matrix: Publication State, Verification Level, Source Provenance, Safety Status. |
| **S07** | **Discovery & Search** | `apps/backend/src/modules/discovery`, `apps/api/app/modules/search` | Spatial radius queries, eligibility filtering, multi-factor ranking, and semantic vector embeddings (pgvector). |
| **S08** | **Tourism Intelligence (ATIS)** | `apps/backend/src/modules/atis`, `intelligence` | Automated scoring: `DestinationScore` (Popularity, Safety, Accessibility, Media Quality, Eco Sensitivity, Demand). |
| **S09** | **Planning & Itinerary** | `apps/backend/src/modules/itinerary` | Deterministic itinerary solver. Spatial clustering, visit duration, opening windows, eco carrying limits. AI explains only. |
| **S10** | **Community & Creator** | `apps/backend/src/modules/community`, `folklore`, `aggregation` | Creator profiles, short-form video feed, comments, follower graphs, and community folklore submissions. |
| **S11** | **Commerce & Marketplace** | `apps/backend/src/modules/commerce`, `marketplace`, `partners` | Partner registry (homestays, guides, artisans), bookable products, slot availability, commission models, payment abstractions. |
| **S12** | **Booking & Reviews** | `apps/backend/src/modules/bookings`, `reviews` | Transactional reservation lifecycle, cancellation policies, idempotency keys, and verified-booking reviews. |
| **S13** | **Safety & Emergency** | `apps/backend/src/modules/emergency` | Geofenced SOS alerts, nearest responder dispatch, station selection, operational status badges (`REAL`/`SIMULATED`). |
| **S14** | **Language & Accessibility**| `apps/backend/src/modules/translation`, `apps/web/.../accessibility` | 3-tier translation cache (Memory $\rightarrow$ DB $\rightarrow$ Cloud API), Chhattisgarhi dialect glossary fallback, Web Speech STT/TTS, WCAG 2.1 AA. |
| **S15** | **Notifications & Alerts** | `apps/backend/src/modules/alerts`, `mobile` | Weather alerts, safety advisories, booking notifications, emergency broadcasts via Web, Push (FCM), SMS. |
| **S16** | **Analytics & Operations** | `apps/backend/src/modules/analytics`, `infrastructure` | Raw telemetry event ingestion (`AnalyticsEvent`), nightly rollups (`TourismMetric`), Prometheus health metrics, structured logging. |

---

## 3. Authoritative Domain Graph & Data Ownership

To eliminate cross-module data duplication, every entity in the database is assigned a **single authoritative owner**:

```
                    REGION (S02 Geography)
                      │
                    PLACE (S03 Content Kernel)
                      │
          ┌───────────┼────────────┐
          │           │            │
       CONTENT      ROUTE       EXPERIENCE
       (S03)        (S02)        (S11 Commerce)
          │           │            │
       MEDIA       PLANNING     BOOKING
       (S05)        (S09)        (S12 Booking)
          │           │            │
      CREATOR      ITINERARY     REVIEWS
       (S10)        (S09)        (S12 Booking)
          │           │            │
          └───────────┼────────────┘
                      │
                 INTELLIGENCE (S08 ATIS)
```

### Ownership Matrix

| Entity / Data Domain | Authoritative Owning Service | Secondary Consumers | Storage Mechanism |
| :--- | :--- | :--- | :--- |
| `User`, `Role`, `Permission` | **S01 Identity & Access** | All Services | Relational Table (Prisma) |
| `Division`, `District`, `TouristZone`, `Boundary` | **S02 Regional Geography** | S03, S07, S09, S13 | PostGIS Spatial Tables |
| `ContentTemplate`, `TemplateVersion` | **S04 Template Engine** | S03, S06, Admin UI | Relational + JSON Schema |
| `ContentEntry`, `ContentAuditLog` | **S03 Content Kernel** | S07, S09, S10, Web UI | Relational + Typed JSONB |
| `Media`, `AssetVariant` | **S05 Media & Assets** | S03, S10, Web UI | Relational + Object Storage (S3) |
| `ContentReport`, `VerificationLog` | **S06 Governance & Trust** | S03, S10, Admin UI | Relational Audit Tables |
| `SearchIndex`, `VectorEmbedding` | **S07 Discovery & Search** | Consumer UI | PostgreSQL `pgvector` / Index |
| `TourismMetric`, `DestinationScore` | **S08 Tourism Intelligence** | S07, Admin UI | Aggregated Time-Series / Relational |
| `PlacePlanningProfile`, `SavedTrip` | **S09 Planning & Itinerary**| Consumer UI | Relational Tables |
| `CreatorProfile`, `CreatorVideo` | **S10 Community & Creator** | S07, Consumer UI | Relational Tables |
| `Partner`, `TourismProduct`, `Availability`| **S11 Commerce & Marketplace**| Consumer UI, Partner Portal | Relational Tables |
| `Booking`, `Review`, `Commission` | **S12 Booking & Reviews** | S11, S08, S14 | Relational + Idempotency Keys |
| `EmergencyStation`, `EmergencyAlert` | **S13 Safety & Emergency** | Consumer UI, Admin Dispatch | Relational + Spatial PostGIS |
| `Translation`, `GlossaryTerm` | **S14 Language & A11y** | All Frontend Interfaces | Redis + DB Cache |
| `SystemAlert`, `MobileDevice` | **S15 Notifications & Alerts**| Mobile App, Web UI | Relational + FCM Push Queue |
| `AnalyticsEvent` | **S16 Analytics & Operations**| S08 Intelligence | Append-Only Event Log |

---

## 4. The 4-Axis Content Trust & Safety Matrix

Status flags are strictly decoupled into four orthogonal axes:

```typescript
// 1. Lifecycle State
export enum PublicationState {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED'
}

// 2. Truth & Verification Level
export enum VerificationLevel {
  UNVERIFIED = 'UNVERIFIED',
  COMMUNITY_VERIFIED = 'COMMUNITY_VERIFIED',
  FIELD_RESEARCHER_VERIFIED = 'FIELD_RESEARCHER_VERIFIED',
  OFFICIAL_GOVERNMENT_VERIFIED = 'OFFICIAL_GOVERNMENT_VERIFIED'
}

// 3. Source Origin & Provenance
export enum SourceProvenance {
  OFFICIAL_PORTAL = 'OFFICIAL_PORTAL',
  TRIBAL_ELDER_FOLKLORE = 'TRIBAL_ELDER_FOLKLORE',
  REGISTERED_GUIDE = 'REGISTERED_GUIDE',
  INDEPENDENT_CREATOR = 'INDEPENDENT_CREATOR',
  AGGREGATED_EXTERNAL = 'AGGREGATED_EXTERNAL'
}

// 4. Operational Safety Status
export enum SafetyStatus {
  SAFE_OPEN = 'SAFE_OPEN',
  SEASONAL_ADVISORY = 'SEASONAL_ADVISORY',
  RESTRICTED_PERMIT_REQUIRED = 'RESTRICTED_PERMIT_REQUIRED',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED',
  CRITICAL_HAZARD = 'CRITICAL_HAZARD'
}
```

---

## 5. Operational Reality Tagging

To eliminate misrepresentation of unintegrated real-world systems, all operational services expose an explicit capability tag:

```typescript
export enum OperationalCapability {
  REAL = 'REAL',               // Active, verified digital/physical operational integration
  EXTERNAL = 'EXTERNAL',       // Handed off to verified external third party (e.g. Police 112)
  SIMULATED = 'SIMULATED',     // Test harness / sandbox environment
  UNAVAILABLE = 'UNAVAILABLE'  // Planned, but not operational in this geographic zone
}
```

---

## 6. Closed-Loop System Workflows

### A. Governed Regional Content Ingestion Workflow
```
[Gov / Creator / Partner] 
       │
       ▼
CONTENT INGESTION (S03)
       │
       ▼
TEMPLATE VALIDATION (S04)
       │
       ▼
GEO VALIDATION (S02 PostGIS)
       │
       ▼
MEDIA PROCESSING (S05 Optimization & Checksum)
       │
       ▼
CONTENT GOVERNANCE & VERIFICATION (S06 4-Axis Matrix)
       │
       ▼
PUBLICATION (S03)
       │
       ▼
DISCOVERY & VECTOR INDEXING (S07 Outbox Event)
       │
       ▼
CONSUMER EXPERIENCE (Web & Mobile)
```

### B. Deterministic Trip Planning Workflow
```
TRAVELER INTENT (Duration, Pace, Group Type)
       │
       ▼
GEOGRAPHIC RESOLVER (S02: District / Tourism Zone Coordinates)
       │
       ▼
CANDIDATE RETRIEVAL (S03 & S07: Verified Published Places)
       │
       ▼
FEASIBILITY FILTER (Seasonality, Weather, Road Travel Times, Opening Hours)
       │
       ▼
ECO & CAPACITY CONSTRAINTS (Daily visitor carrying limits)
       │
       ▼
ROUTE OPTIMIZATION (Clustering & Traveling Salesperson minimization)
       │
       ▼
AI NARRATIVE EXPLANATION (Explains schedule; does not invent places)
       │
       ▼
ITINERARY PRESENTATION (Interactive timeline with offline cache)
```

### C. Closed-Loop Tourism Intelligence Feedback Loop
```
       ┌──────────────────────────────┐
       │   CANONICAL TOURISM DATA     │
       └──────────────┬───────────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │     CONSUMER DISCOVERY       │
       └──────────────┬───────────────┘
                      │ (Searches, views, clicks)
                      ▼
       ┌──────────────────────────────┐
       │      FIELD EXPERIENCES       │
       └──────────────┬───────────────┘
                      │ (Bookings, visits, reviews, SOS alerts)
                      ▼
       ┌──────────────────────────────┐
       │    TELEMETRY INGESTION       │
       │    (S16 Analytics Events)    │
       └──────────────┬───────────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │   ATIS REGIONAL ROLLUP       │
       │   (S08 Intelligence Cron)    │
       └──────────────┬───────────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │  RECALCULATE SCORES & RANKS  │
       └──────────────┬───────────────┘
                      │
                      └──────────────► Feeds back into Discovery Ranking
```

---

## 7. Resolution of Architectural Red Flags (P0, P1, P2)

1. **P0: Two Database Architectures**:
   * *Resolution*: Prisma (`apps/backend/prisma/schema.prisma`) is the master schema manager. SQLAlchemy / Alembic in `apps/api` is strictly restricted to vector embeddings and knowledge graph tables (`pgvector`).
2. **P0: Overlapping Content Systems**:
   * *Resolution*: `ContentEntry` is the sole transactional content model. Legacy `Place` and `Folklore` records are projected as read-only views and marked `@deprecated`.
3. **P0: Geographic Duplication**:
   * *Resolution*: Legacy `Place.district` (String) is marked `@deprecated`. All spatial queries must execute via PostGIS boundary relations (`ST_Contains`, `ST_DWithin`) against `TouristZone` and `District`.
4. **P1: JSON-String Data Overload**:
   * *Resolution*: Frequently queried attributes (`experienceTypes`, `highlights`) are normalized or stored as PostgreSQL native `jsonb` with GIN indexes.
5. **P1: AI Overreach**:
   * *Resolution*: AI is strictly an explanation and translation interface. It is forbidden from inventing geographical coordinates, emergency phone numbers, or opening hours.
6. **P1: Commerce Contaminating Discovery**:
   * *Resolution*: Discovery ranking is governed by organic relevance, user distance, and verified `DestinationScore`. Commercial/partner listings must carry an explicit `SPONSORED` disclosure badge.
7. **P1: Offline Consistency**:
   * *Resolution*: Every endpoint and UI view declares its capability: `OFFLINE_CAPABLE`, `OFFLINE_DEGRADED`, or `ONLINE_REQUIRED`. Offline mutations queue in IndexedDB with idempotent UUID keys and chronological replay.
8. **P2: Contract Drift**:
   * *Resolution*: All domain types, validation schemas, and API request/response contracts are published from the `@cg-tourism/content-schema` and `@cg-tourism/template-contract` packages.

---

## 8. The Six-Phase Execution Roadmap

| Phase | Title | Primary Focus | Exit Criteria |
| :---: | :--- | :--- | :--- |
| **Phase 1** | **Architecture Consolidation** | Enforce 16 service boundaries, data ownership, contract packages, and eliminate SQLite/mock relics. | `pnpm build`, `pnpm lint`, and unit tests pass with zero warnings across the entire monorepo. |
| **Phase 2** | **Regional Data & Content Kernel** | Migrate all content ingestion to `ContentEntry` backed by `ContentTemplate` and PostGIS hierarchy. | A new destination can be published via Admin UI without code modifications. |
| **Phase 3** | **Consumer Discovery & Planning** | Wire high-performance PostGIS search, vector embeddings, and deterministic multi-day planner. | User query ("waterfalls near Jagdalpur") produces valid map markers, routes, and itineraries. |
| **Phase 4** | **Community, Language & Offline** | Harden 3-tier translation, Chhattisgarhi glossary, PWA offline sync, and UGC creator moderation. | Full offline travel mode operational with zero connectivity; voice search functioning in Chhattisgarhi. |
| **Phase 5** | **Commerce, Safety & Operations** | Connect partner inventory, transactional bookings, payment idempotency, and SOS dispatch badges. | End-to-end booking flow completes with inventory lock and real-world operational status tags. |
| **Phase 6** | **Regional Intelligence & Scale** | Activate ATIS nightly rollups, dynamic discovery re-ranking, content health alerts, and executive dashboards. | System autonomously surfaces emerging tourism trends and flags broken content listings. |

---

## 9. The Engineering Discipline Standard

From this point forward, every development task must strictly follow the canonical development chain:

$$\text{DOMAIN} \rightarrow \text{DATA OWNER} \rightarrow \text{SERVICE} \rightarrow \text{WORKFLOW} \rightarrow \text{DATABASE} \rightarrow \text{API CONTRACT} \rightarrow \text{ADMIN} \rightarrow \text{CONSUMER UX} \rightarrow \text{ANALYTICS} \rightarrow \text{TEST} \rightarrow \text{GIT COMMIT}$$

And every pull request must provide documented answers to the **6 Constitutional Questions**:
1. **Who uses it?** (Tourist, Creator, Guide, Partner, Moderator, Regional Manager, Admin)
2. **What data does it consume?** (Inputs, schemas, external signals)
3. **What system owns that data?** (One of the 16 defined services)
4. **What workflow changes it?** (State machine, transitions, triggers)
5. **What other systems depend on it?** (Downstream subscribers, search index, cache)
6. **How do we verify it works?** (Unit test, integration test, spatial assertion, E2E test)
