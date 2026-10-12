# Chhattisgarh Tourism OS — Development Task Log & Commit Analysis

**System Version**: `v1.2.0-production-hardened`  
**Repository**: `SahilKhutey/Chhattisgarh--Tourism`  
**Active Baseline Branch**: `main` (Synchronized with `develop` and `origin` at `d74f7b6`)  
**Audit Timestamp**: `2026-10-11`  
**Quality Status**: **100% PASSING (182 Social Tests, 683 Backend API Tests, 0 Failures)**  

---

## 1. Executive Summary & Purpose

This Development Task Log provides a comprehensive, rigorous architectural audit and chronological analysis of all engineering deliverables, commits, and quality verifications executed across the **UI/UX Experience System**, with particular focus on:
1. **Geographic Experience Layer (Observer Style)**
2. **UI/UX System 6: Workflow, Breakdown, Errors, Timeouts & Non-Loading Screens**
3. **UI/UX System 7: Master System Integration, Verification & Production Hardening**

All development was executed under strict constraints:
- **Zero generic white screens or unhandled states**: Explicit transitions for every asynchronous lifecycle (`idle`, `loading`, `success`, `empty`, `error`, `timeout`, `offline`, `cancelled`).
- **Safe auto-retries**: Exponential backoff with randomized jitter; idempotent methods (`GET`, `HEAD`, `OPTIONS`) only; never auto-retry mutations.
- **Non-loading screen principle**: Pages remain structurally useful while individual sections (weather, reviews, map layers) load or recover.
- **Zero duplicate primitives**: Consolidated `@/ui`, `@/components/ui`, and `@/components/feedback` into canonical implementations.
- **Accessibility & Performance**: WCAG 2.2 AA compliance, keyboard navigation, `@media (prefers-reduced-motion: reduce)` overrides, and sub-100ms hydration budgets.

---

## 2. Chronological Commit History & Detailed Analysis

The following table and deep-dive break down the commits on `main` establishing this production baseline:

### 2.1 Commit Log Summary

| Commit Hash | Type / Scope | Description | Primary Files Touched |
| :--- | :--- | :--- | :--- |
| [`1f9e4a6`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/1f9e4a6) | `feat(map)` | Establish geographic visual contracts | `core/ui/map/` (`types.ts`, `entities.ts`, `viewport.ts`) |
| [`4a4b726`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/4a4b726) | `feat(map)` | Add canonical map canvas | `components/map/MapCanvas/MapCanvas.tsx` |
| [`682cc27`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/682cc27) | `feat(map)` | Add tourism marker system | `components/map/Markers/TourismMarker.tsx` |
| [`4da8fec`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/4da8fec) | `feat(map)` | Add map layer controls | `components/map/MapLayers/` (`LayerControl`, `LayerLegend`) |
| [`13e5f22`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/13e5f22) | `feat(map)` | Add observer overview HUD | `components/map/Overview/MapOverview.tsx` |
| [`bf229b5`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/bf229b5) | `feat(map)` | Add geographic details experience | `components/map/Details/MapDetailsPanel.tsx` |
| [`82af54b`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/82af54b) | `feat(map)` | Add tourism route visualization | `components/map/Routes/` (`RouteLayer`, `RouteDetails`) |
| [`43f702e`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/43f702e) | `feat(map)` | Add geographic guide experience | `components/map/Guides/` (`MapGuide`, `GuideStep`) |
| [`b7f1c26`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/b7f1c26) | `feat(map)` | Integrate observer map experience | `components/map/MapExperience/MapExperience.tsx` |
| [`f470e06`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/f470e06) | `test(map)` | Add geographic experience test coverage | `components/map/__tests__/`, `core/ui/map/__tests__/` |
| [`b1e5084`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/b1e5084) | `chore(map)` | Validate production geographic experience | `docs/ui-ux/ui-ux-map-experience-verification.md` |
| [`7c3ceac`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/7c3ceac) | `feat(ui)` | Establish workflow resilience state model | `core/ui/workflow/` (`state`, `transitions`, `timeout`, `retry`, `errors`) |
| [`b654e9b`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/b654e9b) | `feat(ui)` | Add canonical loading and recovery feedback | `components/feedback/` (`Skeleton`, `ErrorState`, `EmptyState`, `Retry`) |
| [`b5f3153`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/b5f3153) | `feat(ui)` | Add route-level loading and error boundaries | `app/error.tsx`, `app/not-found.tsx` |
| [`664268d`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/664268d) | `feat(map)` | Add partial layer failure handling | `components/map/MapCanvas/MapCanvas.tsx`, `MapExperience.tsx` |
| [`bc11bbb`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/bc11bbb) | `feat(content)` | Add resilient template section states | `components/content-renderer/ContentRenderer.tsx`, `app/content/` |
| [`4f8ad6d`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/4f8ad6d) | `test(ui)` | Add workflow resilience test coverage | `core/ui/workflow/__tests__/`, `components/feedback/__tests__/` |
| [`48b60f4`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/48b60f4) | `chore(ui)` | Validate production resilience build | `docs/ui-ux/ui-ux-6-workflow-resilience-verification.md` |
| [`550274b`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/550274b) | `chore(ui)` | Audit and consolidate canonical UI primitives | `ui/ErrorState`, `components/feedback/ErrorMessage`, `NativeImage` |
| [`3a7f2c3`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/3a7f2c3) | `test(ui)` | Add end-to-end final system integration test | `e2e/final-system-integration.spec.ts` |
| [`3a3cf96`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/3a3cf96) | `chore(ui)` | Validate production system integration | `docs/ui-ux/ui-ux-7-final-integration-verification.md` |
| [`32388ac`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/32388ac) | `feat(social)` | Implement Social Engine Phase 3 persistence layer | `apps/api/app/modules/social/` |
| [`bb65678`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/bb65678) | `feat(social)` | Implement Phase 4 YouTube sync & fetching | `apps/api/app/modules/social/` |
| [`0d90270`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/0d90270) | `fix(social)` | Enforce deterministic verification order | `models/social_account.py`, `verification/repository.py` |
| [`d74f7b6`](https://github.com/SahilKhutey/Chhattisgarh--Tourism/commit/d74f7b6) | `feat(social)` | Implement Phase 5 Instagram sync & fetching pipeline | `apps/api/app/modules/social/` |

---

## 3. Deep-Dive Subsystem Analysis

### 3.1 Geographic Experience Layer (Observer Style)
* **Design Philosophy**: Transformed the map from a generic static embed into an interactive spatial intelligence console:
  `Observe → Discover → Inspect → Understand → Navigate → Plan → Experience`.
* **Visual Hierarchy**:
  * Scale-dependent zoom thresholds (`WORLD_STATE: 6` to `DETAIL: 16`).
  * SVG Shape Symbology:
    * `◆ Destination` (Forest Emerald diamond)
    * `● Experience` (Tribal Terracotta circle)
    * `★ Event` (Bastar Gold star)
    * `⊙ Service` (River Teal double ring)
    * `▣ Safety` (Crimson shield)
    * `⚐ Guide` (Indigo flag)
* **Observer Components**:
  * `MapCanvas`: Pure Leaflet wrapper isolated from SSR with reduced-motion viewport panning.
  * `MapOverview`: Live telemetry HUD displaying counts of visible places, experiences, and corridors.
  * `MapDetailsPanel`: Observer inspection panel with highlights, best times to visit, cultural notes, and "Add to Trip" actions.
  * `RouteLayer` & `RouteDetails`: Corridors with Haversine distance computations and waypoint cards.
  * `MapResultList`: Synchronized accessible companion list satisfying WCAG 2.2 keyboard navigation without canvas dragging.

### 3.2 Workflow Resilience & State Machine (`core/ui/workflow/`)
* **State Machine Architecture**:
  * Formulated an 8-state model: `idle`, `loading`, `success`, `empty`, `error`, `timeout`, `offline`, `cancelled`.
  * Pure state transitions via `transitionWorkflowState` with automatic timestamping and retry count increments.
* **Safe Retries & Backoff**:
  * `executeWithRetry` implements exponential backoff ($T = \min(B \times 2^{\text{attempt}-1}, M)$) combined with randomized jitter factor ($0.8 - 1.2$) to eliminate server synchronization spikes.
  * Auto-retry filter strictly checks `isSafeToAutoRetry()`: only idempotent HTTP verbs (`GET`, `HEAD`, `OPTIONS`) can auto-retry; mutations (`POST`, `PUT`, `DELETE`, `PATCH`) must fail fast to user confirmation.
* **Race Condition Prevention & Timeouts**:
  * `createRequestTracker`: Tracks monotonically increasing request sequence IDs and immediately aborts (`AbortController.abort()`) superseded queries when the user triggers new inputs.
  * `withTimeout`: Enforces domain budgets (8s Search, 10s Geo, 20s Mutation, 15s Standard) and rejects with standard `AbortError`.

### 3.3 Feedback & Error Recovery Layer (`components/feedback/`)
* **Skeleton Shimmer**:
  * Canonical primitives (`Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonImage`, `SkeletonMap`) matching destination layouts.
  * Decorated with `aria-hidden="true"` so screen readers are not overloaded with decorative placeholder announcements.
  * Hardware-accelerated CSS shimmer in `styles/feedback.css` with full `@media (prefers-reduced-motion: reduce)` fallbacks.
* **Error Recovery**:
  * `ErrorState`: Alert container with error classification codes, request ID tracing, customizable retry callbacks, and base route redirection.
  * `NetworkError`: Explicit offline guidance when network drops or `navigator.onLine === false`.
  * `TimeoutError`: Elapsed duration notice with options to retry or browse cached content.
  * `NotFoundState`: Sector coordinate 404 with route recovery actions.

### 3.4 Route-Level & Partial Layer Fault Isolation
* **Route Error Handling**:
  * `src/app/error.tsx`: Re-initialization global boundary wrapping unexpected rendering exceptions with sandboxing.
  * `src/app/not-found.tsx`: Global 404 destination not found handler redirecting consumers to `/explore`.
* **Partial Map Layer Failure**:
  * `MapCanvas` and `MapExperience` listen to TileLayer `tileerror` events. If satellite or terrain tile services fail, the map automatically falls back to standard topography, displays a non-intrusive dismissible toast, and continues running without interruption.
* **Resilient Template Section Rendering**:
  * Dynamic template fields in `ContentRenderer.tsx` are wrapped with localized error boundaries so one corrupt field does not collapse the entire destination article.

### 3.5 Final Consolidation & Zero-Duplication Audit
* Audited `@/core/ui`, `@/components/ui`, and `@/ui`:
  * Consolidated legacy `src/components/states/ErrorState.tsx` and `EmptyState.tsx` to delegate directly to canonical feedback components.
  * Refactored `src/components/feedback/ErrorMessage/ErrorMessage.tsx` to delegate to `ErrorState`.
  * Pointed `src/ui/ErrorState` to canonical `components/feedback/ErrorState`.
  * Eliminated unused directives in `NativeImage.tsx`.

---

## 4. Quality Gate & Production Verification Matrix

| Verification Check | Target / Tool | Result | Status |
| :--- | :--- | :--- | :--- |
| **Unit & Integration Tests** | Jest (146 test suites across `apps/web`) | **581 / 581 tests passed** (100%) | ✅ **PASSED** |
| **Workflow State Tests** | `core/ui/workflow/__tests__/` (7 suites) | **34 / 34 tests passed** | ✅ **PASSED** |
| **Feedback Component Tests** | `components/feedback/__tests__/` (10 suites) | **28 / 28 tests passed** | ✅ **PASSED** |
| **Map Experience Tests** | `components/map/__tests__/` (9 suites) | **27 / 27 tests passed** | ✅ **PASSED** |
| **TypeScript Compilation** | `npx tsc --noEmit` | **0 errors** | ✅ **PASSED** |
| **ESLint Code Quality** | `npx eslint` across all UI packages | **0 errors, 0 warnings** | ✅ **PASSED** |
| **E2E Integration Specs** | Playwright (`final-system-integration.spec.ts`) | **All 6 user journey specs validated** | ✅ **PASSED** |
| **Next.js Production Build** | `next build --webpack` | **87 / 87 routes generated cleanly** | ✅ **PASSED** |

---

## 5. Branch Synchronization & Release State

* **Target Branch**: `main`
* **Development Branch**: `develop`
* **Feature Branches**:
  * `feature/uiux-6-workflow-resilience`: Merged into `develop` and `main`
  * `feature/uiux-7-final-integration`: Merged into `develop` and `main`
* **GitHub Remote Status**: All commits pushed to `https://github.com/SahilKhutey/Chhattisgarh--Tourism` (`origin/main` is up to date).

---

## 6. Sign-off & Production Readiness

The Chhattisgarh Tourism OS user experience platform is fully verified, production-hardened, and ready for deployment.

---

## 7. Phase 23: Social & Living Discovery Feed Subsystem (Domain & Data Architecture)

### 7.1 Strategic Objective
Build a living discovery and regional intelligence layer for Chhattisgarh Tourism OS (`Unseen36Garh`), avoiding generic social feed patterns. Connects local creators, stories, reels, cultural lore, and festival coverage directly to canonical Tourism entities (`place_slug`, `district_id`, `route_id`, `festival_name`) and the Trip Planner.

### 7.2 Architecture & Components Implemented
* **Domain Layer & Lifecycle State Machines (`apps/api/app/modules/social/domain/`)**:
  * `enums.py`: `ContentType` (`POST`, `VIDEO`, `REEL`, `STORY`, `JOURNAL`, `CULTURAL_STORY`), `CreatorStatus`, `ContentStatus`, `ModerationStatus`, `CulturalSensitivityLevel`, `LicenseType`, `FeedType`, `InteractionType`.
  * `state_machines.py`: Enforces transitions for Creators and Content, including cultural heritage guardrails (`validate_cultural_protection` requiring explicit community consent and attribution for sacred rituals) and ephemeral expiration (24h story TTL vs. evergreen conversion).
* **Database Models (`apps/api/app/modules/social/models/`)**:
  * `Creator`: Profile, regional district, local languages, verification level, engagement counters (`followers_count`, `posts_count`).
  * `SocialContent`: Canonical content entity linking directly to the Tourism Entity Graph (`place_slug`, `district_id`, `route_id`, `festival_name`, `coordinates`), sensitivity levels, and engagement metrics (`trip_adds_count`, `likes_count`, `shares_count`).
  * `SocialMedia`: Media attachments supporting `9:16` vertical reels/stories, `16:9` landscape videos, transcripts, and CDN storage paths.
  * `Interactions`: `SocialLike`, `SocialSave`, `SocialComment`, `SocialShare`, `SocialTripAdd`, and `CreatorFollow`.
  * `SocialModerationLog`: Audit tracking for regional and cultural moderation decisions.
* **Pydantic v2 Schemas (`apps/api/app/modules/social/schemas/`)**:
  * Strict typed schemas using `ConfigDict(from_attributes=True)` and payload validation.
* **Services & Repositories (`apps/api/app/modules/social/`)**:
  * `CreatorService` & `CreatorRepository`: Onboarding, verification, profile maintenance, follow/unfollow with ANSI SQL atomic counters.
  * `SocialContentService` & `SocialContentRepository`: Draft creation, unique slug generation, moderation submission, publication gating, evergreen conversion.
  * `ModerationService`: Queue retrieval, approve/reject/escalate workflows, and audit logging.
  * `InteractionService`: Atomic social interactions and `Add to Trip` event publishing.
  * `FeedService`: Multi-feed resolution (`Home`, `Explore`, `Regional`, `Culture`) with Anti-Monopoly Diversity Logic (caps per creator and district to ensure balanced regional representation across Bastar, Surguja, Bilaspur, Raipur, and Durg).
* **Transactional Outbox Events (`app/events/types.py`)**:
  * Added 8 domain events: `SOCIAL_CREATOR_REGISTERED`, `SOCIAL_CREATOR_VERIFIED`, `SOCIAL_CONTENT_SUBMITTED`, `SOCIAL_CONTENT_APPROVED`, `SOCIAL_CONTENT_REJECTED`, `SOCIAL_CONTENT_PUBLISHED`, `SOCIAL_CONTENT_EXPIRED`, and `SOCIAL_INTERACTION_TRIP_ADD`.
* **Database Migration**:
  * `apps/api/alembic/versions/p23_social_feed_subsystem.py` with multi-dialect support (PostgreSQL and SQLite).
* **Automated Verification**:
  * `apps/api/tests/social/` (12 / 12 tests passed, 100% success rate).

---

## 8. Phase 24: Living Discovery Feed & Next.js Experience (Social UI Layer)

### 8.1 Strategic Scope
Deliver the consumer and creator interface for Chhattisgarh Tourism OS (`Unseen36Garh`). Bridge multimedia storytelling directly into regional discovery and trip planning, ensuring authentic cultural representation and balanced district exposure.

### 8.2 UI Components & Systems Built (`apps/web/src/features/social/`)
* **Vertical 9:16 Reel Player (`ReelPlayer.tsx`)**:
  * Auto-play, mute/unmute, play/pause controls.
  * Tourism overlays: Destination entity badges (linking to `/destinations/[slug]`), district indicators (`Bastar`, `Surguja`, etc.), festival tags (e.g. `Bastar Dussehra`), and sacred ritual compliance indicators.
  * First-class **"Add to Trip" CTA button**: Directly increments trip interest, dispatches outbox interactions, and displays actionable toast feedback.
* **24h Ephemeral Stories Bar & Fullscreen Viewer (`StoryBar.tsx` & `StoryViewerModal.tsx`)**:
  * Glowing gradient district rings, creator identity pills, and festival indicators.
  * Auto-advancing fullscreen viewer (5s per story) with pause-on-hold, tap navigation, and direct destination explore & "Add to Trip" actions.
* **Cultural Narrative Cards (`CulturalNarrativeCard.tsx`)**:
  * Formatted for indigenous lore, oral traditions, and tribal craft heritage (e.g. Kondagaon Dhokra bell-metal casting, Sirpur terracotta bricks).
  * Enforces sacred ritual attribution headers and clan consent disclosures.
* **Master Living Feed Stream (`SocialFeedStream.tsx`)**:
  * Anti-Monopoly diversity banner certifying balanced regional exposure across all 33 districts.
  * Multi-feed tabs: `Living Feed`, `Reels`, `Lore & Heritage`, `Bastar`, and `Surguja` with instant client search filtering.
* **Creator Authoring Modal (`CreateContentModal.tsx`)**:
  * Creator studio modal supporting Reels, Stories, Photo Posts, and Cultural Narratives.
  * Enforces the **Cultural Protection Gate**: Mandates explicit clan consent confirmations and community attribution entries for sacred tribal rituals.
* **Destination Detail Living Showcase (`DestinationSocialShowcase.tsx`)**:
  * Plug-and-play widget embedded directly inside destination pages (`/destinations/[slug]`).
* **Living Feed Page (`/feed`)**:
  * Dedicated route (`apps/web/src/app/feed/page.tsx`) with hero discovery banner, story bar, and feed stream.
* **Navigation Integration (`Navbar.tsx` & Locales)**:
  * Mounted `/feed` into top desktop and mobile navigation across English (`Living Feed`), Hindi (`जीवंत फ़ीड`), and Chhattisgarhi (`जीवंत फ़ीड`).

### 8.3 Quality Gate & Production Verification Matrix
* **TypeScript Compilation**: `npx tsc --noEmit` (**0 errors**).
* **Unit & Component Tests**: Jest (`apps/web/src/__tests__/social-living-feed.test.tsx`): **8 / 8 tests passed** (100%).
* **Full Web Test Suite**: **147 / 147 test suites passed**, **589 / 589 tests passed** (100%).
* **Next.js Production Build**: `next build --webpack` (**88 / 88 routes compiled cleanly**, including `/feed` and updated `/destinations/[slug]`).

---

## 9. Phase 25: Curated Social Aggregation & Showcase Engine (Backend Architecture & Sync Pipeline)

### 9.1 Core Distinction & Product Definition
CG Tourism does **not** host or own creator video blobs permanently. It acts as an authoritative, curated discovery layer that normalizes metadata from approved external platforms (`YouTube`, `Instagram`, future `Facebook`/`X`) and drives traffic to the original platform (`Watch on YouTube`, `View on Instagram`) while connecting directly to the **Tourism Entity Graph** (`place_slug`, `district_id`, `route_id`, `festival_name`) and **Trip Planner**.

### 9.2 Subsystems & Architecture Built
1. **Domain Enums & State Transitions (`domain/enums.py`, `domain/state_machines.py`)**:
   - `SocialPlatform`: `YOUTUBE`, `INSTAGRAM`, `FACEBOOK`, `X`, `OTHER`.
   - `SocialAccountStatus`: `PENDING` -> `VERIFYING` -> `VERIFIED` -> `PENDING_ACCEPTANCE` -> `ACCEPTED` -> `ACTIVE` (with `PAUSED`, `REJECTED`, `DISCONNECTED`).
   - `SocialAccountStateMachine`: Strict validation of allowed transitions and automated acceptance gate.
   - `SyncHealthStatus`: `HEALTHY`, `DEGRADED`, `ERROR`, `PAUSED`.
   - `FeedLayoutType`: `STANDARD_GRID`, `MASONRY`, `FEATURED_GRID`, `CAROUSEL`, `HERO_SPOTLIGHT`, `REGIONAL_SHOWCASE`.
2. **Provider Abstraction Layer (`providers/`)**:
   - `SocialProvider` protocol defining `verify_account(handle_or_url)` and `fetch_content(handle, cursor, limit)`.
   - `YouTubeProvider`: Channel handle extraction, deterministic channel resolution, metadata normalization for Videos and Shorts.
   - `InstagramProvider`: Handle extraction, profile verification, normalization for Reels and Photo posts.
   - `ProviderFactory`: Factory for runtime provider resolution with extensible registry.
3. **Database Schema & ORM Models (`models/`)**:
   - `SocialAccount`: Platform, handle, priority, allowed content types, sync frequency, health status, consecutive failures, cursor, and metadata.
   - `SocialSyncRun`: Audit log for tracking sync executions, items discovered, items synced, timestamps, and error traces.
   - `SocialFeedTemplate`: Configurable layout templates with responsive desktop/tablet/mobile columns, filter rules, and sort strategies.
   - Extended `SocialContent`: Added `social_account_id`, `provider`, `provider_content_id`, `source_url`, `original_platform_action_label`, `synced_at`, `duration_seconds`, and `aspect_ratio`.
   - `Creator`: Updated to support external administrative onboarding (`user_id` nullable).
4. **Service & Engine Layer (`services/`)**:
   - `SocialAccountService`: Creator registration with accounts, handle verification, social acceptance gate, priority and filter management.
   - `SocialSyncEngine`: Synchronous incremental sync engine with deduplication on `(provider, provider_content_id)`, engagement refresh, thumbnail extraction, and failure recovery.
   - `FeedTemplateService`: Layout rendering with platform/content-type/district filtering and responsive presentation metadata.
5. **Admin & Public API Routers (`api/`)**:
   - `admin_social_router.py` mounted at `/api/social/admin/`:
     - `POST /creators/register` (Admin registers creator with social accounts)
     - `POST /creators/{creator_id}/accounts` & `GET /creators/{creator_id}/accounts`
     - `POST /accounts/{account_id}/verify`
     - `POST /accounts/{account_id}/accept`
     - `POST /accounts/{account_id}/activate`, `/pause`
     - `PATCH /accounts/{account_id}/settings`
     - `POST /accounts/{account_id}/sync` & `POST /sync-all`
     - `GET /accounts/health`
     - `POST /feed-templates` & `GET /feed-templates`
     - `PATCH /content/{content_id}/visibility`
   - `templates_router.py` mounted at `/api/social/templates/`:
     - `GET /{slug}` (Consumer layout and content resolution)
6. **Alembic Migration**:
   - `apps/api/alembic/versions/p24_social_aggregation_engine.py`.

### 9.3 Comprehensive Verification Matrix
* **Social Module Test Suite**: `pytest apps/api/tests/social -v -p no:cacheprovider` (**15 / 15 tests passed**, 100%).
* **Full Backend API Test Suite**: `pytest apps/api/tests -v -p no:cacheprovider` (**459 passed**, 4 skipped, 0 failed, 100%).
* **Full Web Test Suite**: `npm test` (**147 / 147 test suites passed, 589 / 589 tests passed**, 100%).
* **Next.js Production Build**: `88 / 88 routes cleanly compiled**.

---

## 10. Phase 0: Social Engine Foundations (Domain Naming, Contracts & Architecture)

### 10.1 Objective & Strategy
Phase 0 establishes the immutable foundation and contracts for the Social Engine within `apps/api/app/modules/social/` without premature external provider network calls or database dependencies.

### 10.2 Architectural Components Implemented
1. **Domain Enums (`domain/enums.py`)**:
   - `SocialPlatform`: `youtube`, `instagram` (with case-insensitive resolution).
   - `SocialAccountStatus`: `pending`, `verifying`, `verified`, `pending_acceptance`, `accepted`, `active`, `paused`, `rejected`, `disconnected`.
   - `SocialContentType`: `post`, `video`, `reel`, `short`, `story`.
   - `SocialContentStatus`: `discovered`, `synced`, `validated`, `under_review`, `approved`, `published`, `hidden`, `removed`, `source_unavailable`, `source_deleted`, `source_private`.
   - `SocialModerationStatus`: `not_required`, `pending`, `approved`, `rejected`.
   - `SocialVisibility`: `public`, `hidden`.
   - `SyncStatus`: `never_run`, `running`, `succeeded`, `partial`, `failed`.
   - `AccountAcceptanceAction`: `accept`, `reject`, `pause`, `reactivate`.
2. **Canonical Domain Dataclasses (`domain/models.py`)**:
   - `SocialAccount`: Pure domain dataclass representing an approved external account.
   - `SocialContent`: Canonical representation of external social media items linked with Tourism Context.
3. **SourceUrl Value Object (`domain/value_objects.py`)**:
   - Scheme enforcement (HTTP/HTTPS only).
   - Hostname validation and normalization (lowercasing, fragment stripping).
4. **Provider Abstraction & Registry (`providers/base.py`, `providers/registry.py`)**:
   - `SocialProvider` protocol defining `verify_account`, `fetch_content`, and `fetch_content_item`.
   - `ProviderAccount` and `ProviderContent` value contracts.
   - `ProviderRegistry` for runtime registration and decoupling.
5. **Account State Machine Service (`services/account_service.py`)**:
   - Explicit `ALLOWED_TRANSITIONS` guard and `transition_account` transition logic.
6. **Safety Configuration Boundary (`config.py`)**:
   - `SocialSettings`: Default `social_engine_enabled=False`, `social_sync_enabled=False`, `social_require_acceptance=True`.
7. **Error Taxonomy (`domain/errors.py`)**:
   - Hierarchy of retryable, non-retryable, provider, and moderation exceptions.
8. **Foundational Unit Tests (`app/modules/social/tests/`)**:
   - `test_enums.py` (6 tests).
   - `test_source_url.py` (4 tests).
   - `test_provider_registry.py` (3 tests).
   - `test_account_lifecycle.py` (4 tests).
   - All 17 Phase 0 unit tests passed cleanly in <2s.

---

## 11. Phase 1: Persistence Layer & Models (Production Social Engine)

### 11.1 Strategic Objective
Deliver the production persistence layer for Chhattisgarh Tourism OS Social Engine (`Unseen36Garh`), establishing relational integrity, lifecycle fields, uniqueness constraints, bi-directional domain mappings, audit trails, and transactional outbox event publishing.

### 11.2 Architectural Components Implemented
1. **Domain Model Extensions (`apps/api/app/modules/social/domain/models.py`)**:
   - `SocialCreator`: Pure domain dataclass for local creator profiles.
   - `SocialSyncState`: Pure domain dataclass for provider sync status snapshots.
2. **SQLAlchemy ORM Models (`apps/api/app/modules/social/models/`)**:
   - `Creator` / `SocialCreator`: Added canonical alias and `.to_domain()`.
   - `SocialAccount`: Added `display_name`, `external_account_id`, `sync_status` (`SyncStatus` enum), properties (`sync_enabled`, `last_synced_at`, `last_successful_sync_at`), `.to_domain()`, `.from_domain()`, and 1-to-1 relationship to `SocialAccountSyncState`.
   - `SocialAccountSyncState` (new model in `models/sync_state.py`): Tracks account sync snapshot, failure counts, errors, and pagination cursors.
   - `SocialContent`: Added `thumbnail_url`, `metadata_json`, properties (`platform`, `status`), and `.to_domain()`, `.from_domain()`.
3. **Database Migration (`apps/api/alembic/versions/p25_social_persistence_layer.py`)**:
   - Upgrades `social_accounts` with `display_name`, `external_account_id`, `sync_status`, and secondary indexes.
   - Upgrades `social_contents` with `thumbnail_url` and `metadata_json`.
   - Creates `social_account_sync_states` table with 1-to-1 foreign key to `social_accounts`.
   - Creates SQL view alias `social_creators` pointing to `creators`.
4. **Transactional Outbox Events (`app/events/types.py`, `services/`)**:
   - Added events: `SOCIAL_ACCOUNT_REGISTERED`, `SOCIAL_ACCOUNT_ACCEPTED`, `SOCIAL_ACCOUNT_ACTIVATED`, `SOCIAL_ACCOUNT_PAUSED`, `SOCIAL_CONTENT_SYNCED`, `SOCIAL_SYNC_COMPLETED`, `SOCIAL_SYNC_FAILED`.
   - Emits outbox events across account lifecycle and content sync operations.
5. **Schemas & API Compatibility (`schemas/account_schemas.py`, `schemas/content_schemas.py`)**:
   - Updated `SocialAccountCreate`, `SocialAccountResponse`, `SocialContentResponse`, and `FeedCardResponse` to seamlessly handle new persistence fields.
6. **Comprehensive Test Suite (`apps/api/app/modules/social/tests/test_persistence_models.py`)**:
   - 5 comprehensive tests validating ORM relationships, bidirectional domain conversions, and transactional outbox event generation.
   - 37 / 37 social tests passing cleanly in <3s.


---

## 12. Phase 1: Core Modules & Functions (Production Social Engine)

### 12.1 Strategic Objective
Transform domain contracts and persistence layers into the modular core application architecture for the Chhattisgarh Tourism OS Social Engine.
Architectural flow:
`Admin-approved social accounts -> Provider adapters -> Normalized social content -> Tourism-aware feed -> Original source`

Strict constraints enforced:
- **Canonical backend**: All code resides in `apps/api/app/modules/social/`.
- **Fail-closed acceptance**: Only `ACTIVE` accounts with `sync_enabled=True` may sync.
- **Strict attribution & linking**: Zero raw video blob storage; all content deep links to the original YouTube/Instagram source.
- **Tourism graph grounding**: Content automatically infers Bastar and 20+ CG districts, tourism zones, and cultural tags.
- **Feed diversity**: Anti-monopoly diversity interleaving prevents a single viral creator or dominant district from saturating the public feed.

### 12.2 Architectural Subpackages Implemented
1. **`providers/`**:
   - `base.py`: `ProviderCapabilities`, `ProviderAccount`, `ProviderContent`, and `SocialProvider` protocol.
   - `registry.py`: `ProviderRegistry` with singleton `default()` container and support listing.
   - `adapters/`: Deterministic mock adapters for `YouTubeAdapter` and `InstagramAdapter` generating valid deep links and tourism test fixtures.
2. **`source/`**:
   - `validator.py`: `SourceValidator` with host checking (YouTube: `youtube.com`, `youtu.be`; Instagram: `instagram.com`), URL normalization, and handle extraction.
   - `resolver.py`: `SourceResolver` resolving canonical external link or returning `"SOURCE_UNAVAILABLE"` for hidden, private, or deleted content.
3. **`acceptance/`**:
   - `policies.py`: `can_sync(account)` and `assert_sync_allowed(account)` enforcing fail-closed security.
   - `service.py`: `SocialAcceptanceService` orchestrating `submit_for_acceptance`, `accept`, `reject`, `pause`, and `reactivate` with transactional outbox events.
4. **`creators/`**:
   - `models.py`, `schemas.py` (`CreatorCreate`, `CreatorUpdate`, `CreatorResponse`).
   - `repository.py` (`CreatorRepository`), `service.py` (`CreatorService`) managing creator profiles, handle uniqueness guards, and status lifecycles.
5. **`accounts/`**:
   - `models.py`, `schemas.py` (`SocialAccountRegisterRequest`, `SocialAccountCreate`, `SocialAccountUpdate`, `SocialAccountAcceptPayload`, `SocialAccountResponse`).
   - `repository.py` (`SocialAccountRepository`).
   - `service.py` (`SocialAccountService`) handling registration validation via `SourceValidator`, duplicate account rejection (`409`), initial `PENDING` state and `SocialAccountSyncState` provisioning.
6. **`content/`**:
   - `models.py`, `schemas.py` (`SocialContentCreateRequest`, `SocialContentUpdateRequest`, `SocialContentResponse`, `SocialContentSyncInput`).
   - `normalizer.py`: `SocialContentNormalizer` mapping provider items into canonical `SocialContent` with tourism context, deterministic slugs, and source action labels.
   - `repository.py`: `SocialContentRepository` with `get_by_provider_and_id`.
   - `service.py`: `SocialContentService` with upserting deduplication logic preventing duplicate rows.
7. **`sync/`**:
   - `state.py`: `SyncResult` dataclass tracking discovery, creations, updates, skips, failures, and cursors.
   - `policies.py`: Allowed content type enforcement, exponential retry backoff, and automatic quarantine (`MAX_CONSECUTIVE_FAILURES_BEFORE_QUARANTINE = 5`).
   - `service.py`: `SocialSyncService` orchestrating end-to-end sync runs, error recovery, sync state snapshotting, and `SOCIAL_SYNC_COMPLETED`/`FAILED` events.
8. **`context/`**:
   - `resolver.py`: `SocialContextResolver` inferring Bastar, Dantewada, Surguja, Raipur, etc., plus waterfalls, heritage, wildlife, tribal art, and tourism circuit metadata.
9. **`feed/`**:
   - `query.py`: `FeedQuery` dataclass with multi-dimensional filtering.
   - `policy.py`: `FeedPolicy` and `is_feed_eligible` verifying publication, moderation, visibility, and expiration status.
   - `service.py`: `SocialFeedService` executing feed resolution with anti-monopoly diversity interleaving and deep link resolution.
10. **`moderation/`**:
    - `service.py`: `SocialModerationService` handling approve, reject, hide, restore actions and `SOCIAL_CONTENT_MODERATED` events.
11. **`audit/`**:
    - `service.py`: `SocialAuditService` for domain audit logging via outbox events.
12. **`engine.py`**:
    - `SocialEngine`: Master dependency injection container composing all domain services.
13. **`api/`**:
    - `admin.py`: REST routes for creators, accounts, acceptance, sync triggers, and moderation.
    - `public.py`: Public discovery feed, creator profiles, and source deep link resolution.

### 12.3 Verification & Quality Assurance
- **Unit & Integration Tests (`apps/api/app/modules/social/tests/test_phase1_core.py`)**:
  - `test_source_validator_valid_and_invalid`: Validates URLs across platforms, schemes, and formats.
  - `test_source_resolver_fallbacks`: Validates fallback to `"SOURCE_UNAVAILABLE"`.
  - `test_acceptance_policies_fail_closed`: Verifies rejection of sync for non-active or unaccepted accounts.
  - `test_provider_adapters`: Validates adapter capabilities and deterministic profiles.
  - `test_content_normalizer`: Validates normalization, tourism tag mapping, and slug formatting.
  - `test_social_engine_lifecycle`: End-to-end admin registration -> acceptance -> activation -> sync -> feed -> source deep link resolution.
  - `test_feed_eligibility_and_moderation`: Tests moderation approval, feed eligibility, and hide/restore actions.
  - `test_source_resolver_private_or_deleted`: Verifies private or deleted source handling.
  - `test_feed_policy_expired_without_evergreen`: Tests story expiration vs evergreen persistence.
  - `test_sync_engine_error_tracking_and_quarantine`: Tests failure counts, health degradation, and automatic quarantine.
- **Social Module Test Results**: **47 / 47 PASSED (100%) in 2.70s**.
- **Full Backend API Test Results**: **545 PASSED, 4 SKIPPED, 0 FAILURES**.

---

## 13. Social Engine — Phase 2: Creator Acceptance, Verification & Validation Service Layer

### 13.1 Architectural Principles & Boundaries
Phase 2 establishes the editorial and verification gatekeepers that decide whether an external social handle is allowed into the CG Tourism discovery ecosystem:
$$\text{VALIDATED} \neq \text{VERIFIED} \neq \text{ACCEPTED} \neq \text{ACTIVE}$$
- **A creator can exist without being accepted.**
- **A social account can be registered without being synchronized.**
- **Only a validated + accepted + active account can enter the Social Sync pipeline.**
- **Fail-Closed Security**: Any non-active, unaccepted, or sync-disabled state immediately halts synchronization with deterministic errors (`AccountNotAcceptedError`, `AccountSyncDisabledError`).

### 13.2 Core Services & Components Implemented
1. **`CreatorValidator` (`creators/validator.py`)**:
   - Enforces display name length ($\le 120$ chars), non-empty slug/handle, bio length ($\le 1000$ chars).
   - Validates regional association: assigning a `tourism_zone_id` mandates an explicit `district_id`.
   - Structured `ValidationResult` with strongly-typed `ValidationIssue` entities.
2. **`CreatorDuplicateService` (`creators/duplicate.py`)**:
   - Similarity engine computing confidence scores using sequence matching and token overlap heuristics.
   - Boosts matching confidence when geographical districts align.
   - Non-destructive candidate reporting (`{"possible_duplicates": [...]}`) preventing accidental merges or deletions.
3. **`SocialAccountValidator` (`accounts/validator.py`)**:
   - Platform host whitelisting:
     - YouTube: `youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`.
     - Instagram: `instagram.com`, `www.instagram.com`.
   - Rejects non-HTTP(S) schemes (e.g. `ftp://`, `javascript:`) and redirect tricks.
   - Validates handle format regex (`^[\w\-\.]+$`), sanitizes leading `@`, and extracts handles from URL paths.
4. **`SocialVerificationService` & `CreatorVerificationService` (`verification/`)**:
   - Calls registered provider adapters to verify that external accounts genuinely exist.
   - Transitions verified accounts to status `VERIFIED`, updates `external_account_id` (e.g. YouTube channel ID `UC_...`), and emits `SOCIAL_ACCOUNT_VERIFIED` outbox events.
   - Handles upstream provider errors (`PROVIDER_ERROR`) and missing handles (`NOT_FOUND`) gracefully without panics.
   - Manages creator trust tiers: `UNVERIFIED`, `IDENTITY_CHECKED`, `REGIONAL_CREATOR`, `OFFICIAL_CREATOR`, `FEATURED_CREATOR`.
5. **`SocialAcceptancePolicy` & `SocialAcceptanceWorkflow` (`acceptance/`)**:
   - Enforces valid state machine paths:
     - `PENDING` $\rightarrow$ `VERIFYING` $\rightarrow$ `VERIFIED` $\rightarrow$ `PENDING_ACCEPTANCE` $\rightarrow$ `ACCEPTED` $\rightarrow$ `ACTIVE`.
     - `ACTIVE` $\leftrightarrow$ `PAUSED`.
     - Rejection transitions to `REJECTED` with `sync_enabled=False`.
   - Concurrency conflict detection: `SocialAcceptanceWorkflow.verify_expected_state` guards against race conditions between concurrent admin actions, returning `ConcurrencyStateConflictError` (HTTP 409).
6. **`SocialAcceptanceService` (`acceptance/service.py`)**:
   - `submit(account)`: Moves account to `PENDING_ACCEPTANCE`.
   - `accept(account, approved_content_types, priority, reason)`: Transition to `ACCEPTED` and `ACTIVE` with `sync_enabled=True`. Completely idempotent: already accepted accounts do not re-fire duplicate outbox events.
   - `reject(account, reason, reason_code)`: Requires non-empty reason string and structured `RejectionReasonCode` (`INVALID_CREATOR`, `NOT_RELEVANT`, `CONTENT_POLICY`, etc.).
   - `request_changes(account, reason, requested_fields)`: Transitions back to `PENDING` with feedback notes recorded.
   - `pause(account)` / `reactivate(account)`: Safely pauses or resumes syncing.
7. **`SocialEligibilityService` (`eligibility/service.py`)**:
   - Fail-closed evaluation gate:
     - `can_sync(account, creator, engine_enabled)`: Checks `engine_enabled == True`, `account.status == "active"`, `account.sync_enabled == True`, and `creator.status in ("ACTIVE", "VERIFIED")`.
     - `assert_eligible_for_sync(...)`: Raises explicit `AccountNotAcceptedError` or `AccountSyncDisabledError`.
     - `can_display(account)`: Validates public visibility.
8. **Admin API Endpoints (`api/admin.py`)**:
   - `POST /api/admin/creators/validate`: Validates creator draft payload.
   - `POST /api/admin/creators/duplicates`: Scans for candidate duplicates.
   - `POST /api/admin/accounts/{id}/submit`: Submits verified account for acceptance review.
   - `POST /api/admin/accounts/{id}/accept`: Approves and activates account for sync.
   - `POST /api/admin/accounts/{id}/reject`: Rejects account with mandatory justification.
   - `POST /api/admin/accounts/{id}/request-changes`: Requests modifications from creator.
   - `POST /api/admin/accounts/{id}/activate`: Activates accepted account.
   - `GET /api/admin/accounts/{id}/eligibility`: Returns live sync & display eligibility diagnostics.

### 13.3 Test Suite & Verification Matrix
- **`test_creator_validation.py`**: Validates display name constraints, missing slug, bio length, tourism zone district mandates, and duplicate candidate scoring (8 tests).
- **`test_account_validation.py`**: Validates YouTube & Instagram host whitelists, host mismatch rejections, invalid URL scheme rejections, handle regex checks, and handle extraction (7 tests).
- **`test_verification.py`**: Tests provider verification, external ID persistence, provider failure recovery, not found handling, and creator trust tier assignment (4 tests).
- **`test_acceptance.py`**: Tests acceptance workflow transitions, concurrency conflict HTTP 409 guard, policy checks, accept lifecycle, rejection reason requirement, change request flow, and pause/reactivate (7 tests).
- **`test_eligibility.py`**: Tests end-to-end positive pipeline (Create $\rightarrow$ Validate $\rightarrow$ Register $\rightarrow$ Verify $\rightarrow$ Accept $\rightarrow$ `can_sync == True`), end-to-end negative pipeline (Rejection $\rightarrow$ `can_sync == False`), and fail-closed edge cases (3 tests).
- **`test_acceptance_api.py`**: FastAPI TestClient integration testing of all admin REST endpoints (5 tests).
- **Social Module Test Results**: **81 / 81 PASSED (100%) in 4.01s**.
- **Full Backend API Test Results**: **582 PASSED, 4 SKIPPED, 0 FAILURES**.

---

## 14. Social Engine — Phase 3: Database & Persistence Layer

### 14.1 Objectives & Architectural Governance
Phase 3 converts the Social Engine from service and in-memory abstractions into an immutable PostgreSQL/PostGIS relational persistence system. It enforces the end-to-end lifecycle guarantees established across Phases 0–2:
$$\text{Creator} \longrightarrow \text{Social Account} \longrightarrow \text{Verification} \longrightarrow \text{Acceptance} \longrightarrow \text{Activation} \longrightarrow \text{Sync State} \longrightarrow \text{Canonical Social Content}$$

- **Single Source of Truth**: PostgreSQL (+ PostGIS) is the authoritative persistence engine; Redis serves exclusively as an acceleration/cache layer.
- **Location**: Canonical backend at `apps/api/app/modules/social/` with no auxiliary databases.
- **Repository Commit Isolation**: All repositories invoke `session.flush()` exclusively and never execute `session.commit()`. Calling service layers maintain complete boundary control over unit-of-work transactions.

### 14.2 Schema Enhancements & Persistence Invariants
1. **`creators` Table (`SocialCreator` / `Creator`)**:
   - Added `metadata_json` column (`JSONB` / `JSON`) for flexible extensible properties.
   - Added `slug` synonym property targeting `handle`, enabling unified querying via `slug` or `handle`.
   - Maintained global unique index on lower-cased creator handles.
2. **`social_accounts` Table (`SocialAccount`)**:
   - Added `version: Mapped[int]` (default 1) for optimistic concurrency control.
   - Partial unique index `uq_social_account_external_identity` on `(platform, external_account_id) WHERE external_account_id IS NOT NULL`:
     - Allows multiple pre-verification accounts on the same platform with `external_account_id = None`.
     - Strictly forbids duplicate accounts once an external identity (e.g. YouTube channel ID `UC_...`) is established.
   - Added index `idx_social_account_platform_profile` on `(platform, profile_url)`.
   - Added 1-to-many relationship with `SocialAccountVerification` cascading on delete.
3. **`social_account_verifications` Table (`SocialAccountVerification`)**:
   - Durable audit trail preserving every verification check:
     - `social_account_id`: Foreign key to `social_accounts.id` (`CASCADE`).
     - `status`: Verification outcome status (`verified`, `failed`, `error`).
     - `provider_account_id`, `provider_handle`, `provider_display_name`.
     - `verified_at`: Timestamp of verification event.
     - `details`: Extensible JSON payload capturing provider diagnostic metadata.
4. **`social_account_sync_states` Table (`SocialAccountSyncState` / `SocialSyncState`)**:
   - Strict 1:1 unique constraint on `social_account_id`.
   - Comprehensive sync execution metrics:
     - `last_started_at`, `last_finished_at`, `last_synced_at`, `last_successful_sync_at`.
     - `etag`: HTTP caching etag token for conditional upstream sync requests.
     - Counters: `discovered_count`, `created_count`, `updated_count`, `failed_count`, `items_synced_total`.
5. **`social_contents` Table (`SocialContent`)**:
   - Canonical deduplication: Partial unique index `uq_social_content_provider_identity` on `(provider, provider_content_id) WHERE provider_content_id IS NOT NULL`.
   - Fast feed retrieval: Compound index `idx_social_content_feed` on `(publication_status, visibility, created_at)`.
   - Regional discovery: Compound index `idx_social_content_region` on `(publication_status, district_id, created_at)`.
   - Soft-delete preservation: `mark_source_deleted(content_id)` and `mark_source_unavailable(content_id)` archive publication status to `ARCHIVED` and record `source_status` in `metadata_json` (`SOURCE_DELETED`, `SOURCE_UNAVAILABLE`) preserving historical analytics and tour references.
6. **`social_content_context` Table (`SocialContentContext`)**:
   - Polymorphic association linking social content to CG Tourism entities (`district`, `place`, `craft`, `route`, `festival`, `experience`).
   - Captures `source` (`admin`, `system_resolver`, `editorial`) and `confidence` score ($0.0 \dots 1.0$).
   - Indexed on `social_content_id` and compound `(context_type, context_id)`.

### 14.3 Repository & Concurrency Layer
- **`CreatorRepository` (`creators/repository.py`)**: Added `get_by_slug(slug)` and re-exported `SocialCreatorRepository = CreatorRepository`.
- **`SocialAccountRepository` (`accounts/repository.py`)**:
  - `get_for_update(account_id)`: Implemented pessimistic row-level locking (`with_for_update()`).
  - `get_by_external_identity(platform, external_account_id)`: Looks up verified accounts.
  - `update_optimistic(account_id, expected_version, **updates)`: Checks version match and increments `version`, raising `ConcurrencyStateConflictError` (HTTP 409) on concurrent collisions.
- **`SocialVerificationRepository` (`verification/repository.py`)**:
  - `record_verification(...)`: Persists verification event logs.
  - `get_history(account_id)` & `get_latest(account_id)`: Queries chronological verification events.
- **`SocialSyncStateRepository` (`sync/repository.py`)**:
  - `get_or_create(account_id)`: Idempotently initializes sync state.
  - `record_sync_success(...)` & `record_sync_failure(...)`: Updates execution timestamps, etags, and metrics counters.
- **`SocialContentRepository` (`content/repository.py`)**:
  - `get_by_provider_content = get_by_provider_and_id`: Canonical content query by provider ID.
  - `mark_source_deleted` & `mark_source_unavailable`: Soft deletion handling.
- **`SocialContentContextRepository` (`context/repository.py`)**:
  - `attach_context(...)`: Connects tourism graph context tags.
  - `get_contexts_for_content(...)` & `get_contents_by_context(...)`: Bidirectional lookups.

### 14.4 Service-Layer Atomic Transactions & Row Locking
- **`SocialAcceptanceService` (`acceptance/service.py`)**:
  - Updated `_resolve_account(..., for_update=True)` to acquire row-level lock via `get_for_update()`.
  - Added `expected_version` validation to `accept()`, incrementing `acc.version += 1`.
  - Acceptance transaction writes account state, records audit log, and creates outbox events atomically in a single session transaction.
- **`SocialVerificationService` (`verification/service.py`)**:
  - Records verification attempt in `SocialAccountVerification` on both sync and async verification runs.

### 14.5 Database Migrations
- **Alembic Migration `p26_social_persistence_phase3.py`**:
  - Down revision: `p25_social_persistence_layer`.
  - Creates `social_account_verifications` and `social_content_context` tables.
  - Adds `metadata_json` to `creators`.
  - Adds `version` and partial unique index `uq_social_account_external_identity` to `social_accounts`.
  - Adds metrics columns to `social_account_sync_states`.
  - Adds `uq_social_content_provider_identity`, `idx_social_content_feed`, and `idx_social_content_region` to `social_contents`.
  - Cross-dialect support: Fully operational on both PostgreSQL and SQLite.

### 14.6 Test Suite & Verification Matrix
- **`test_persistence_phase3.py`** (8 tests):
  1. `test_creator_persistence_and_slug`: Creator persistence, metadata JSON, slug lookup, and unique handle constraint.
  2. `test_account_partial_unique_index_on_external_identity`: Pre-verification coexistence of NULL external IDs, verified lookup, and partial unique constraint collision on duplicate external ID.
  3. `test_verification_history_retention`: Chronological verification attempt history retention and account relationship loading.
  4. `test_sync_state_persistence_and_metrics`: 1:1 invariant enforcement and metric tracking (`discovered`, `created`, `updated`, `failed`, `etag`, `cursor`, `started_at`, `finished_at`).
  5. `test_canonical_content_deduplication_and_soft_delete`: Provider ID uniqueness enforcement, duplicate collision handling, and soft deletion preservation via `source_status` and `publication_status = ARCHIVED`.
  6. `test_polymorphic_content_context`: Polymorphic context attachment, bidirectional querying, and relationship loading.
  7. `test_optimistic_locking_and_concurrency_collision`: Version check increment and `ConcurrencyStateConflictError` (HTTP 409) collision guard.
  8. `test_acceptance_service_atomic_row_locking_and_versioning`: Atomic transaction row locking and version increment during acceptance.
- **Social Module Test Results**: **89 / 89 PASSED (100%) in 2.61s**.
- **Full Backend API Test Results**: **590 PASSED, 4 SKIPPED, 0 FAILURES in 219s**.

---

## 15. Social Engine — Phase 4: YouTube Sync, Verification & Content Fetching

### 15.1 Architectural Scope & Core Invariants
Phase 4 connects the CG Tourism Social Engine to the live YouTube Data API v3.
- **Uploads-Playlist Architecture**: Replaces expensive `search.list` (100 quota units)
  with 1-unit `channels.list` -> `playlistItems.list` -> `videos.list` (batch up to 50).
- **Scope Isolation**: Excludes Instagram (reserved for Phase 5), consumer UI, ranking,
  AI tagging, and rehosting/video downloading. Aggregates metadata only.
- **Canonical Source Attribution**: Maps canonical URL `https://www.youtube.com/watch?v={id}`
  and deterministic slug `yt-{video_id}`.
- **Editorial Field Preservation**: Sync updates provider-owned fields (`title`,
  `description`, `thumbnail_url`, `published_at`, `duration_seconds`, view/like counts)
  while strictly preserving editorial curation (`place_slug`, `district_id`, `route_id`,
  `experience_id`, `cultural_tags`, `tourism_tags`, `moderation_status`, `visibility`).
- **Security & Privacy**: Strict server-side isolation of API key; masked in logs,
  never persisted in content metadata, sync cursors, or outbox payloads.

### 15.2 Subsystem Implementation
- **`YouTubeClient` (`providers/youtube/client.py`)**:
  - Asynchronous client with connection pooling via `httpx`.
  - Implements `get_channel_by_handle`, `get_channel_by_id`, `get_playlist_items`,
    and batch `get_videos` (up to 50 IDs per call).
  - Sanitized request logging stripping API keys.
  - Comprehensive exception hierarchy (`YouTubeQuotaExceededError`, `YouTubeRateLimitError`,
    `YouTubeAuthenticationError`, `YouTubeAccountNotFoundError`, `YouTubeUnavailableError`,
    `TransientProviderError`).
- **`YouTubeContentClassifier` (`providers/youtube/classifier.py`)**:
  - Classifies videos into Shorts vs Videos based on duration (<= 180s), `#shorts` regex
    in title/description/URL, tags, and a strict duration negative gate override.
- **`YouTubeContentMapper` (`providers/youtube/mapper.py`)**:
  - Normalizes raw video payload into `SocialContent` model.
  - Resolves tourism context via `SocialContextResolver`.
  - Maps YouTube privacy and upload statuses (`private` -> `SOURCE_PRIVATE` / `PRIVATE`,
    `deleted` -> `SOURCE_DELETED` / `PRIVATE`, `unlisted` -> `UNLISTED`, `public` -> `PUBLIC`).
- **`YouTubeAdapter` (`providers/youtube/adapter.py`)**:
  - Adapts `SocialProvider` protocol for YouTube.
  - Declares capabilities (`supports_shorts=True`, `supports_videos=True`,
    `supports_embeds=True`, `supports_posts=False`, `supports_reels=False`).
  - Supports offline test fallback when client is not configured.
- **`YouTubeSyncService` (`sync/youtube_sync.py`)**:
  - Validates account eligibility via `SocialEligibilityService.can_sync`.
  - Checkpointed incremental pagination: stops fetching once `last_seen_published_at`
    cursor is encountered.
  - Implements retry with exponential backoff and jitter for transient 429/5xx errors.
  - Idempotent upsert via `SocialContentRepository.upsert_provider_content`.
  - Emits `SOCIAL_CONTENT_SYNCED` outbox event and records audit log.
- **Admin REST API (`api/admin.py`)**:
  - Added `POST /api/admin/accounts/{account_id}/verify` for channel verification.
  - Added `POST /api/admin/accounts/{account_id}/sync` (HTTP 202 Accepted) for sync.

### 15.3 Test Suite & Verification Matrix
- **YouTube Provider Tests (`tests/providers/youtube/`)**:
  - `test_parser.py` (8 tests): Handles, channel IDs, URLs, ISO 8601 duration conversion.
  - `test_classifier.py` (6 tests): Shorts duration bounds, regex signals, negative gate.
  - `test_client.py` (12 tests): API endpoints, status codes, quota errors, log sanitization.
  - `test_mapper.py` (6 tests): Video normalization, privacy mapping, context tags.
  - `test_adapter.py` (6 tests): Capabilities, verification workflow, offline fallbacks.
- **YouTube Sync Tests (`tests/sync/test_youtube_sync.py`)**:
  - `test_sync_eligible_account_e2e_success`: Full end-to-end sync workflow.
  - `test_sync_deduplication_and_idempotency`: Idempotent upsert verification.
  - `test_sync_editorial_preservation`: Strict preservation of editorial curation.
  - `test_sync_incremental_checkpoint_stops_pagination`: Timestamp cursor stopping.
  - `test_sync_ineligible_account_raises_account_not_accepted`: Fail-closed gatekeeper.
  - `test_sync_quota_exceeded_handled_gracefully`: Graceful rollback on quota limits.
  - `test_sync_security_no_api_key_leak`: Zero API key leaks in metadata or outbox.
- **Verification Results**:
  - **Social Module Tests**: **128 / 128 PASSED (100%) in 1.48s**.
  - **Social Tests (`tests/social`)**: **36 / 36 PASSED (100%) in 0.50s**.
  - **Full Backend API Tests**: **625 PASSED, 4 SKIPPED, 0 FAILURES in 52.88s**.

---

## 16. Social Engine — Phase 5: Instagram Sync & Content Fetching

### 16.1 Architectural Scope & Core Invariants
Phase 5 implements Instagram integration as a provider adapter adhering to all Social Engine contracts established in Phases 0–4:
$$\text{Admin-approved Creator} \longrightarrow \text{Instagram Account Registry} \longrightarrow \text{Verification / Acceptance} \longrightarrow \text{ACTIVE + SYNC\_ENABLED} \longrightarrow \text{Instagram Provider Adapter} \longrightarrow \text{Official Meta Graph API} \longrightarrow \text{Normalize} \longrightarrow \text{Canonical SocialContent} \longrightarrow \text{PostgreSQL Idempotent Upsert} \longrightarrow \text{Tourism Feed} \longrightarrow \text{Open Original Source}$$

- **Strict Non-Scraping Invariant**: Scraping Instagram usernames or web endpoints is strictly forbidden. The system exclusively communicates with official Meta Graph API endpoints (`https://graph.facebook.com/{version}/...`) using authorized provider credentials.
- **Strict Token Privacy Invariant**: Meta access tokens, refresh tokens, and client secrets must never appear in application logs, database `SocialContent.metadata_json`, sync cursor state, or outbox event payloads.
- **Account Status vs. Provider Access Isolation**: The lifecycle status `SocialAccountStatus` (`pending`, `verified`, `accepted`, `active`, `suspended`, `rejected`) is never overloaded with Meta API authorization state. A dedicated `ProviderAccessStatus` enum (`not_required`, `required`, `available`, `expired`, `revoked`, `invalid`) tracks token health.
- **Provider Access Degradation**: If an access token expires (Meta error code 190) or permissions are revoked (code 200), the system does not delete or corrupt the creator, account, or previously synced content. It marks `provider_access_status` as `expired` or `revoked`, records the sync failure, and allows administrative token refresh.
- **Editorial Field Preservation**: Automated provider sync updates provider-owned fields (`title`, `description`, `thumbnail_url`, `published_at`, duration, engagement counters) while strictly preserving editorial curation (`place_slug`, `district_id`, `route_id`, `cultural_tags`, `tourism_tags`, `moderation_status`, `visibility`).
- **No Consumer UI / No Media Rehosting**: The system stores metadata only and links back to the canonical Instagram post or reel URL.
- **Carousel Normalization**: A carousel is mapped to exactly one `SocialContent` record with type `POST` and `metadata_json["instagram"]["media_count"] = N`.

### 16.2 Subsystem Implementation
- **`ProviderAccessStatus` (`domain/enums.py`)**:
  - Case-insensitive enum with values: `not_required`, `required`, `available`, `expired`, `revoked`, `invalid`.
- **Configuration & Validation (`config.py`)**:
  - Configurable settings: `social_instagram_enabled`, `meta_graph_api_base_url`, `instagram_api_version`, `instagram_client_id`, `instagram_client_secret`, `social_instagram_max_results`, `social_instagram_max_pages_per_sync`, `social_instagram_max_media_per_sync`, `social_instagram_request_timeout_seconds`, `social_instagram_retry_attempts`, `social_instagram_retry_base_delay_seconds`.
  - Added `validate_instagram_configuration()`.
- **`InstagramClient` (`providers/instagram/client.py`)**:
  - Asynchronous client using connection pooling via `httpx.AsyncClient`.
  - Token injection via `Authorization: Bearer <token>` header; query params sanitization.
  - Granular error classification: `InstagramAuthenticationError` (401/190), `InstagramAuthorizationError` (403/200), `InstagramRateLimitError` (429/4/17/32/613), `InstagramMediaNotFoundError` (404/100/803), `InstagramUnavailableError` (5xx/1/2), `TransientProviderError` (network/timeout).
- **`InstagramContentClassifier` (`providers/instagram/classifier.py`)**:
  - Classifies `REELS` into `SocialContentType.REEL` / `ContentType.REEL`.
  - Classifies `VIDEO` into `SocialContentType.VIDEO` / `ContentType.VIDEO`.
  - Classifies `IMAGE` and `CAROUSEL_ALBUM` into `SocialContentType.POST` / `ContentType.POST`.
  - Raises `ContentNormalizationError` for unsupported types.
- **`InstagramContentMapper` (`providers/instagram/mapper.py`)**:
  - Maps `InstagramMedia` into canonical `SocialContent` model.
  - Generates deterministic slug `ig-{media.provider_id.lower()}`.
  - Derives clean title from first line of caption without hashtags; fallback to `"Instagram Reel by @username"`.
  - Sets aspect ratios: 9:16 for REEL, 1:1 for POST/CAROUSEL, 16:9 for VIDEO.
  - Context resolution via `SocialContextResolver` for district, tourism zone, and cultural tags.
  - Enforces rights boundary: `license_type = LicenseType.ORIGINAL_CREATOR.value`.
- **`InstagramAdapter` (`providers/instagram/adapter.py`)**:
  - Implements `SocialProvider` protocol for Instagram.
  - Declares capabilities (`supports_reels=True`, `supports_posts=True`, `supports_videos=True`, `supports_shorts=False`, `supports_embeds=True`).
  - Implements `verify_account_async`, `get_account_info`, `fetch_media_page`, and offline mock fallback.
- **`InstagramWebhookService` (`providers/instagram/webhooks.py`)**:
  - HMAC SHA256 signature verification and outbox event dispatching boundary.
- **`InstagramSyncService` (`sync/instagram_sync.py`)**:
  - Validates creator and account eligibility using `SocialEligibilityService.can_sync`.
  - Blocks execution if `provider_access_status` is `expired`, `revoked`, or `invalid`.
  - Checkpointed incremental pagination: stops fetching once `last_seen_published_at` cursor is encountered.
  - Idempotent upsert via `SocialContentRepository.upsert_provider_content`.
  - Emits `SOCIAL_CONTENT_SYNCED` and `social.instagram.sync.completed` outbox events.
  - Gracefully handles token degradation and records sync state failure.

### 16.3 Test Suite & Verification Matrix
- **Provider Test Suite (`tests/providers/instagram/`)**:
  - `test_parser.py` (8 tests): Profile handle parsing, URLs, schemes, canonical URLs, permalinks.
  - `test_classifier.py` (5 tests): Reel, Video, Image, Carousel classification, and unsupported errors.
  - `test_credentials.py` (2 tests): Token masking, in-memory credential storage, revocation.
  - `test_client.py` (10 tests): Profile retrieval, media paging, single media, 401/403/429/404/500 mapping, timeouts, context manager.
  - `test_mapper.py` (5 tests): Reel mapping, carousel single-record mapping, video mapping, fallback title, missing ID error.
  - `test_adapter.py` (7 tests): Capabilities, account capabilities, offline fallback, online profile verification, media fetch.
- **Sync Test Suite (`tests/sync/test_instagram_sync.py`)**:
  - `test_sync_eligible_instagram_account_e2e_success`: End-to-end sync workflow and outbox verification.
  - `test_sync_deduplication_and_idempotency`: Upsert deduplication.
  - `test_sync_editorial_preservation`: Strict preservation of editorial curation.
  - `test_sync_checkpoint_incremental`: Checkpoint cursor stopping pagination.
  - `test_sync_ineligible_account_raises`: Fail-closed gatekeeper.
  - `test_sync_blocked_on_expired_access_status`: Token expiration blocks sync cleanly.
  - `test_sync_auth_failure_updates_provider_access_status`: 401/190 degrades status to `expired`.
  - `test_sync_permission_revoked_updates_provider_access_status`: 403 degrades status to `revoked`.
  - `test_sync_retry_on_transient_error`: Retry with backoff on transient errors.
  - `test_security_no_tokens_leaked`: Zero token leakage across database, cursor, and outbox.
- **Verification Results**:
  - **Instagram Provider Tests**: **38 / 38 PASSED (100%) in 0.74s**.
  - **Instagram Sync Tests**: **10 / 10 PASSED (100%) in 2.02s**.
  - **Social Module Tests**: **182 / 182 PASSED (100%) in 4.01s**.
  - **Full Backend API Tests**: **683 PASSED, 4 SKIPPED, 0 FAILURES in 240.63s**.

---

## 17. Production Build — Social Engine — Phase 6: Social Handle Sync & Fetching

### 17.1 Architecture & Objectives
Phase 6 builds the unified Social Handle Synchronization and Orchestration Layer across YouTube and Instagram:
$$\text{Creator} \longrightarrow \text{Social Handle Registry} \longrightarrow \text{Normalize/Validate} \longrightarrow \text{Verify/Accept} \longrightarrow \text{Active + Sync-Enabled} \longrightarrow \text{Sync Coordinator} \longrightarrow \text{Providers} \longrightarrow \text{PostgreSQL/Feed}$$

1. **Social Handle Layer**:
   - Universal handle normalization (`@` prefix and slash stripping, lowercase, non-empty validation).
   - Platform-specific syntax validation (YouTube vs. Instagram syntax rules).
   - Profile URL & handle resolution into platform and normalized handle.
   - Creator handle registration enforcing platform-level uniqueness (`UNIQUE(platform, normalized_handle)`).
2. **Fail-Closed Eligibility & Adaptive Scheduling**:
   - Centralized `SocialSyncPolicy` gatekeeper enforcing `ACTIVE`, `sync_enabled`, and `provider_access_status == AVAILABLE`.
   - Adaptive `SyncSchedulePolicy` computing `next_sync_at` (featured 30m, standard 2h, low-priority 6h) with exponential backoff on consecutive failures.
3. **Concurrency Control & Resilience**:
   - Distributed locking via `SocialSyncLock` protocol with thread-safe in-memory and atomic Redis Lua implementations.
   - Circuit breaker protection via `ProviderCircuitBreaker` (CLOSED, OPEN, HALF_OPEN) per platform.
4. **Unified Synchronization Coordinator & Worker**:
   - `SocialSyncCoordinator` orchestrating locking, stale sync recovery, circuit breaking, adapter fetching, canonical normalization, idempotent persistence, partial success detection, run history logging, and outbox event publishing.
   - Source lifecycle preservation via `mark_source_unavailable` preventing hard deletion.
   - `SocialSyncWorker` and bounded `SocialSyncScheduler`.
5. **Admin REST API & Observability**:
   - Endpoints for handle registration, sync state, sync runs, manual sync triggers (202 Accepted), pause/resume sync, and `/health/social`.
6. **Database Migration**:
   - Migration `p27_social_sync_orchestration`.

### 17.2 Implementation Details
- **`SocialHandleNormalizer` & `normalize_handle` (`handles/normalizer.py`)**:
  - Normalizes handles by stripping whitespace, leading `@`, leading/trailing slashes, and lowercasing.
- **`SocialHandleValidator` (`handles/validator.py`)**:
  - YouTube: alphanumeric, dots, hyphens, underscores; length 3-30.
  - Instagram: alphanumeric, dots, underscores; length 1-30; no leading/trailing or consecutive dots.
- **`SocialHandleResolver` (`handles/resolver.py`)**:
  - Parses raw handles and URLs across YouTube and Instagram into `(platform, normalized_handle)`.
- **`SocialHandleService` (`handles/service.py`)**:
  - Registers creator handles with duplicate rejection (`SocialAccountAlreadyExistsError`), fail-closed defaults (`PENDING`, `NEVER_RUN`), and outbox event emission.
- **`SocialSyncPolicy` & `SyncSchedulePolicy` (`sync/policy.py`)**:
  - Enforces `can_sync` and `assert_sync_allowed`.
  - Calculates `next_sync_at` and exponential backoff with jitter.
- **`SocialSyncLock` (`sync/locking.py`)**:
  - `InMemorySocialSyncLock` (monotonic timestamps, thread-safe).
  - `RedisSocialSyncLock` (atomic `SET NX EX` with safe Lua release).
- **`ProviderCircuitBreaker` (`sync/circuit_breaker.py`)**:
  - Per-platform circuit breaker protecting external APIs during outages.
- **`SocialSyncCoordinator` (`sync/coordinator.py`)**:
  - Unified sync entrypoint coordinating policy, locking, circuit breaking, adapter execution, partial success detection, run history, and outbox events.
- **`SocialSyncRunRepository` & `SocialSyncStateRepository` (`sync/repository.py`)**:
  - Historical execution run logs and adaptive schedule due account queries (`find_due_accounts`).
- **`SocialSyncScheduler` & `SocialSyncWorker` (`sync/scheduler.py`, `sync/worker.py`)**:
  - Periodic discovery and queueing of due syncs; background worker handling `SocialSyncRequested`.
- **Admin Endpoints (`api/admin.py`, `api/router.py`, `api/health.py`)**:
  - `POST /api/admin/social/handles`, `GET /api/admin/social/handles` (and `/api/admin/handles`)
  - `POST /api/admin/social/handles/verify` (and `/api/admin/handles/verify`)
  - `GET /api/admin/social/accounts/{id}/sync-state` (and `/api/admin/accounts/{id}/sync-state`)
  - `GET /api/admin/social/accounts/{id}/sync-runs` (and `/api/admin/accounts/{id}/sync-runs`)
  - `POST /api/admin/social/accounts/{id}/sync` (202 Accepted) (and `/api/admin/accounts/{id}/sync`)
  - `POST /api/admin/social/accounts/{id}/verify` (and `/api/admin/accounts/{id}/verify`)
  - `POST /api/admin/social/accounts/{id}/pause-sync`, `POST /api/admin/social/accounts/{id}/resume-sync`
  - `GET /api/social/feed` (Consumer feed)
  - `GET /health/social` (Production health check)

### 17.3 Test Suite & Verification Matrix
- **Handles Suite (`tests/handles/`)**:
  - `test_normalizer.py` (3 tests): basic normalization, whitespace/slashes, empty rejection.
  - `test_validator.py` (2 tests): YouTube syntax rules, Instagram syntax rules.
  - `test_resolver.py` (5 tests): Raw handles, YouTube URLs, Instagram URLs, invalid hosts.
  - `test_service.py` (4 tests): Registration, duplicate prevention, cross-platform allowance, missing creator.
- **Sync Suite (`tests/sync/`)**:
  - `test_policy.py` (4 tests): Eligibility checks, fail-closed assertions, backoff calculation, schedule intervals.
  - `test_locking.py` (3 tests): In-memory lock, context manager conflict, Redis lock with Lua release.
  - `test_circuit_breaker.py` (2 tests): State transitions, platform isolation.
  - `test_coordinator.py` (4 tests): Successful sync, partial success, fail-closed gatekeeper, source lifecycle.
  - `test_concurrency.py` (1 test): 10 concurrent sync threads with barrier; exactly 1 succeeds, 9 blocked by lock.
  - `test_scheduler_worker.py` (2 tests): Due account discovery, bounded queueing, worker handling and lock conflict.
  - `test_api_endpoints.py` (4 tests): `/health/social`, handle registration/listing, sync management endpoints, dual `/api/admin/social/...` prefixes and `/api/social/feed`.
  - `test_phase6_complete_flow.py` (4 tests):
    1. Complete flow end-to-end integration: Creator -> YouTube & Instagram handles -> verification -> acceptance -> activation -> worker fetch -> normalization & idempotent upsert -> 0 duplicates on re-sync -> sync state SUCCESS -> feed cards & source URLs.
    2. Failure integration test: Instagram 429 rate limit backoff and YouTube 500 error tracking with delayed `next_sync_at`.
    3. Scheduler bounded concurrency: 100 due accounts discovering and queueing with bounded batch limits.
    4. Security authorization: Unauthenticated & non-admin rejected (401/403), paused & unaccepted accounts blocked (400), cross-creator collision prevention (`SocialAccountAlreadyExistsError`), and zero credential leakage.
- **Verification Results**:
  - **Phase 6 Handle Tests**: **14 / 14 PASSED (100%) in 0.46s**.
  - **Phase 6 Sync Tests**: **31 / 31 PASSED (100%) in 6.22s**.
  - **Total Social Module Tests**: **200 / 200 PASSED (100%) in 5.17s**.
  - **Full Backend API Tests**: **721 PASSED, 4 SKIPPED, 0 FAILURES in 3m 16s**.

---

## 18. Phase 7: Social Feed — Template, Grid Arrangement & Screens

### 18.1 Architectural Principle & Core Invariants
Phase 7 delivers the consumer-facing presentation layer of the Social Engine for Chhattisgarh Tourism:
* **Canonical Content Consumption**: The UI consumes `SocialContent` strictly through `/api/social/...` contracts, never communicating with Meta/Instagram or Google/YouTube APIs from the browser.
* **Regional Tourism Discovery Interaction**: Implements `Discover -> Understand -> Explore -> Open Original` rather than shallow vanity metrics (likes/comments/followers). Every card is an entrypoint into the regional tourism graph.
* **Original Platform Source Preservation**: Preserves verified attribution and direct outbound links (`View on Instagram →`, `Watch on YouTube →`) with secure attributes (`target="_blank"`, `rel="noopener noreferrer"`, accessible labels).
* **Visual Normalization**: Adapts mixed source aspect ratios (9:16 reels/shorts, 1:1 posts, 16:9 videos) into clean `4:5` and `16:9` card containers using `object-fit: cover` and badging without distortion or aggressive auto-play.
* **Anti-Monopoly Diversity**: Feed presentation guarantees diversity policies (`max_items_per_creator`, `max_items_per_district`) so dominant accounts cannot flood regional exploration streams.

### 18.2 Data Contracts & Templates Layer (`apps/web/src/lib/social/`)
* **`types.ts`**: TypeScript contracts for `SocialPlatform`, `SocialContentType`, `SocialCreator`, `SocialContent`, `SocialFeedTemplate`, `SocialFeedQuery`, `SocialFeedResponse`, and `FeedPolicy`.
* **`templates.ts`**: Standardized presentation presets:
  - `STANDARD_SOCIAL_FEED`: Responsive 2/3/4 column grid with compact tourism badges.
  - `MASONRY_SOCIAL_FEED`: Staggered Pinterest-style cards with expanded storytelling captions.
  - `FEATURED_GRID_FEED`: High-impact hero card spotlight followed by supporting grid.
  - `REGIONAL_SHOWCASE_FEED`: Specialized asymmetric regional showcase (Hero + stacked side stories + grid).
  - `COMPACT_GRID_FEED`: Minimal 2/2/3 column layout designed for embedded widgets inside destination/district pages.
  - `getSocialTemplate(idOrLayout)`: Safe runtime resolver with fallback to `STANDARD_SOCIAL_FEED`.
* **`api.ts`**: Resilient data client providing `getSocialFeed`, `getSocialContentById`, `getCreatorFeed`, `getDistrictSocialFeed`, `getPlaceSocialFeed`, and `getPublicCreators`, backed by verified regional fallback datasets (`mock-data.ts`).

### 18.3 Atomic & Presentation Components (`apps/web/src/components/social/`)
* **Badges & Outbound Actions**:
  - `SocialPlatformBadge.tsx`: Platform indicators (Instagram, YouTube, Verified Official Source).
  - `SocialContentTypeBadge.tsx`: Format indicators (Reel, Short, Video, Post, Folklore).
  - `SocialContextBadge.tsx`: Tourism location pills (📍 District, 📍 Destination Place, Festival).
  - `SocialOpenSourceButton.tsx`: Accessible outbound button with safe `target="_blank"` and `rel="noopener noreferrer"`.
* **Media & Cards**:
  - `SocialContentMedia.tsx`: 4:5 normalized ratio, thumbnail loading, play button overlay for video formats, duration pill, and graceful fallback placeholder.
  - `SocialContentMeta.tsx`: Creator identity (avatar, display name, handle, verified badge), tourism location pins, story title, and date.
  - `SocialContentCard.tsx`: Master card component (`default`, `featured`, `compact`) supporting keyboard navigation and discrete internal/external links.
* **Strips, Grids & States**:
  - `SocialCreatorCard.tsx` & `SocialCreatorStrip.tsx`: Horizontal creator discovery strip.
  - `SocialFeaturedContent.tsx`: Asymmetric hero section highlighting featured regional stories.
  - `SocialFeedGrid.tsx`: Layout engine rendering Standard, Masonry, Featured, Regional, and Compact grids.
  - `SocialFeedHeader.tsx`, `SocialFeedTabs.tsx`, `SocialFeedFilters.tsx`: Desktop toolbar and accessible mobile bottom drawer sheet with platform, format, and district filters.
  - `SocialFeedPagination.tsx`: Cursor-aware "Load More Stories" pagination button.
  - `SocialFeedSkeleton.tsx`, `SocialEmptyState.tsx`, `SocialErrorState.tsx`: Accessible loading placeholders, tourism fallback empty states, and polite error boundaries hiding technical provider failures.
  - `SocialFeed.tsx`: Top-level orchestrator unifying headers, tabs, grids, states, and pagination.
  - `EmbeddedSocialModule.tsx`: Reusable modular component embeddable across destination, district, and festival pages.

### 18.4 App Router Screens (`apps/web/src/app/social/`)
1. **Screen 1 — Social Home (`/social`)**: Regional discovery landing page featuring living hero banner, creator strip, featured stories spotlight, latest stories grid, and quick district explorer.
2. **Screen 2 — Social Feed (`/social/feed`)**: Full searchable stream supporting URL query state (`?platform=...&type=...&district=...&tab=...`), format tabs, mobile filter drawer, creator directory mode, and cursor pagination.
3. **Screen 3 — Creator Feed (`/social/creators/[slug]`)**: Creator profile header, verified badges, bio, district context, featured tourism locations, and published stories grid.
4. **Screen 4 — Content Detail (`/social/content/[id]`)**: Focused media view, creator attribution, prominent original source button, deep tourism destination context card with "Explore Destination Guide →", and related regional stories.
5. **Screen 5 — District Social Feed (`/social/districts/[slug]`)**: Regional showcase header (Bastar, Surguja, Dantewada, Mahasamund), resident creator strip, and regional showcase grid.
6. **Screen 6 — Place Social Feed (`/social/places/[slug]`)**: Destination-tagged feed (Chitrakote Falls, Mainpat, Sirpur, Barnawapara, Tirathgarh) with direct links to destination itinerary planning.
7. **Screen 7 — Embedded Social Module (`EmbeddedSocialModule`)**: Reusable embeddable component ready for destination, district, culture, and festival pages.

### 18.5 BFF API Route Handlers (`apps/web/src/app/api/social/`)
* `GET /api/social/feed`: Proxies upstream to backend `/public/feed` and formats as `SocialFeedResponse` with graceful regional fallback when backend is offline.
* `GET /api/social/content/[id]`: Resolves single content by UUID or slug with fallback.

### 18.6 Verification Matrix
* **Frontend Social Test Suite**: `npx jest src/lib/social/__tests__ src/components/social/__tests__` (**5 / 5 test suites passed, 32 / 32 tests passed**, 100%).
* **TypeScript Compilation**: Zero type errors across all social files (`src/lib/social`, `src/components/social`, `src/app/social`).
* **Backend Social Engine Suite**: `pytest -q app/modules/social/tests` (**200 / 200 passed in 6.69s**, 100%).

---

## 19. Phase 8: Screen & Page Structure · Components · Buttons · Navigation · Transitions · Motion · Blur · Micro-Animations

### 19.1 Strategic Philosophy & Interaction Hierarchy
Phase 8 builds the complete UX layer connecting social discovery directly into the regional tourism operating system:
* **Core Principle**: "See Chhattisgarh through the people who experience it." CG Tourism is not another social network competing for ad views or infinite scrolling.
* **Interaction Funnel**:
  $$\text{Content} \longrightarrow \text{Creator} \longrightarrow \text{Place} \longrightarrow \text{Region} \longrightarrow \text{Experience} \longrightarrow \text{Original Source}$$
* **Tone**: Cinematic, geographic, calm, editorial, lightweight, and responsive.

### 19.2 Motion, Depth & Z-Index Tokens (`apps/web/src/lib/social/motion.ts`)
* **Duration Tokens**:
  - `instant`: 100ms (toggles, micro-interactions)
  - `fast`: 160ms (badges, button state changes)
  - `normal`: 220ms (card hover lift, dropdowns)
  - `medium`: 300ms (drawer open, filter expansions)
  - `slow`: 400ms (page entry, modal reveal)
* **Easings**:
  - `standard`: `cubic-bezier(0.2, 0, 0, 1)`
  - `decelerate`: `cubic-bezier(0, 0, 0.2, 1)`
  - `accelerate`: `cubic-bezier(0.4, 0, 1, 1)`
  - `spring`: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`
* **3-Level Blur & Depth Architecture**:
  - `Level 0`: No blur (`backdrop-blur-none`, opaque cards)
  - `Level 1`: 8px blur (`backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/60 dark:border-zinc-800/60`) for sticky headers and section navigation
  - `Level 2`: 16px blur (`backdrop-blur-xl bg-black/80 text-white`) for media lightboxes and modals
* **Strict Z-Index Hierarchy**:
  - `base: 0 < cardOverlay: 10 < sticky: 100 < dropdown: 200 < drawer: 300 < modal: 400 < toast: 500`
* **Accessibility**: SSR-safe `usePrefersReducedMotion()` hook and CSS `@media (prefers-reduced-motion: reduce)`.

### 19.3 Navigation & Telemetry Helpers (`apps/web/src/lib/social/`)
* **`navigation.ts`**:
  - `getSocialHomePath()`: `/social`
  - `getSocialFeedPath(filters)`: `/social/feed?tab=...&district=...`
  - `getSocialContentPath(id)`: `/social/content/[id]`
  - `getSocialCreatorsIndexPath()`: `/social/creators`
  - `getSocialCreatorPath(slug)`: `/social/creators/[slug]`
  - `getSocialDistrictPath(slug)`: `/social/districts/[slug]`
  - `getSocialPlacePath(slug)`: `/social/places/[slug]`
  - `getTourismDestinationPath(slug)`: `/destinations/[slug]`
  - `getTourismItineraryPath(slug)`: `/itineraries?destination=[slug]`
  - `buildSocialFeedUrl(filters)`: Normalizes and strips empty/default query params
* **`analytics.ts`**:
  - `trackSocialEvent(eventName, payload)`: Dispatches DOM `CustomEvent('cg_social_analytics')` with automatic `window.gtag` and `window.dataLayer` forwarding.
  - Events: `social_page_view`, `social_feed_filter`, `social_content_open`, `social_creator_open`, `social_place_open`, `social_source_click`, `social_destination_click`, `social_load_more`, `social_share`.

### 19.4 Button Primitives Family (`apps/web/src/components/social/buttons/`)
* Wraps the existing canonical `@/components/ui/Button/Button.tsx`:
  - `SocialPrimaryButton.tsx`: Primary call to action with `min-h-[44px]`, forest-emerald background, and micro-scale feedback.
  - `SocialSecondaryButton.tsx`: Balanced action with `min-h-[44px]` and subtle borders.
  - `SocialGhostButton.tsx`: Subtle transparent button.
  - `SocialIconButton.tsx`: 44x44px touch area with accessible `aria-label` and optional count badge.
  - `SocialFilterButton.tsx`: Toggle pill button with `aria-pressed`, active state indicator, and count badge.
  - `SocialSourceButton.tsx`: Outbound external platform button with inline SVG branding, `target="_blank"`, `rel="noopener noreferrer"`, and telemetry tracking.
  - `SocialBackButton.tsx`: Back navigation with fallback href and history detection.

### 19.5 Layout Hierarchy & Overlays (`apps/web/src/components/social/layout/`, `overlays/`)
* **Layout**:
  - `SocialShell.tsx`: Standardized responsive page container with max-width (5xl, 6xl, 7xl) and gutters.
  - `SocialNavigation.tsx`: Sticky top header with brand badge, living discovery links, and active route detection.
  - `SocialSectionNav.tsx`: Horizontal category selector (All, Reels, Shorts, Videos, Posts, Creators) with scrollable pills.
  - `SocialBreadcrumbs.tsx`: Schema-ready breadcrumb trail linking content back to district and feed.
  - `apps/web/src/app/social/layout.tsx`: Global layout wrapper mounted on `/social/*`.
* **Overlays**:
  - `SocialMediaLightbox.tsx`: Fullscreen media preview with Level 2 blur, ESC key listener, body scroll lock, creator profile, dual CTAs ("Plan Visit" and "Open Original Source"), and share sheet trigger.
  - `SocialShareSheet.tsx`: Native `navigator.share` fallback to clipboard copy with visual feedback, WhatsApp, and X sharing.
  - `SocialFilterDrawer.tsx`: Mobile filter drawer with min 44x44px touch targets.

### 19.6 Verification Matrix
* **Frontend Web Test Suite**: `npm test -- --testPathPattern="social"`:
  - **12 / 12 test suites passed, 73 / 73 tests passed** (100%).
  - Tests covering: `motion.test.ts`, `navigation.test.ts`, `analytics.test.ts`, `SocialButtons.test.tsx`, `SocialLayout.test.tsx`, `SocialOverlays.test.tsx`, `SocialBadges.test.tsx`, `SocialContentCard.test.tsx`, `SocialFeedGrid.test.tsx`, `api.test.ts`, `templates.test.ts`, `social-living-feed.test.tsx`.
* **Backend Social Engine Test Suite**: `pytest -q app/modules/social`:
  - **200 / 200 passed in 6.25s** (100%).
* **TypeScript Compilation**: Zero type errors across all social components and routes.

---

## 20. Production Build — Social Engine — Phase 9: Workflow Development & Implementation

### 20.1 Architecture & Objectives
Phase 9 establishes the end-to-end workflow orchestration system connecting creator onboarding, social handle verification, editorial acceptance, sync orchestration, content validation, moderation, publication, tourism graph contextualization, and consumer discovery:
$$\text{Admin} \longrightarrow \text{Creator Onboarding} \longrightarrow \text{Handle Registry} \longrightarrow \text{Provider Verification} \longrightarrow \text{Editorial Acceptance} \longrightarrow \text{Operational Activation} \longrightarrow \text{Sync Execution} \longrightarrow \text{Content Validation} \longrightarrow \text{Moderation} \longrightarrow \text{Publication} \longrightarrow \text{Tourism Graph} \longrightarrow \text{Discovery Feed}$$

1. **State Invariants & Separation of Concerns**:
   - `ACCEPTED != ACTIVE`: Editorial acceptance evaluates creator brand and local authenticity; operational activation enables scheduled background sync.
   - UI visibility never bypasses backend state guards.
   - Fail-closed validation against 33 official Chhattisgarh districts.
   - Sacred ritual protection gate preventing approval without explicit clan elder consent.
   - Anti-SSRF allowlist enforcement on provider source URLs.

### 20.2 Components & Subsystems
- **Master Orchestrator (`app/modules/social/workflows/service.py`)**:
  - `SocialWorkflowService`: Instantiates workflows with transactional DB session, provider registry, and sync locking.
- **Workflow State Machines (`app/modules/social/workflows/`)**:
  - `CreatorOnboardingWorkflow` (`creator_workflow.py`): Enforces geography, duplicate prevention, and activate/suspend lifecycle.
  - `SocialAccountWorkflow` (`account_workflow.py`): Platform-level uniqueness, URL resolution, pause/reactivate/disconnect.
  - `AccountVerificationWorkflow` (`verification_workflow.py`): Non-blocking provider querying with friendly error mapping.
  - `AccountAcceptanceWorkflow` (`acceptance_workflow.py`): Editorial acceptance gate and operational activation gate.
  - `SocialSyncWorkflow` (`sync_workflow.py`): Non-blocking `202 Accepted` queueing, distributed locking (`ttl_seconds=300`), exponential backoff, and quota window tracking.
  - `ContentValidationWorkflow` (`content_workflow.py`): Anti-SSRF URL allowlisting and source deletion lifecycle (`SOURCE_DELETED`).
  - `ContentModerationWorkflow` (`moderation_workflow.py`): Cultural protection consent gate, approve, reject, hide, and restore actions.
  - `PublicationWorkflow` (`publication_workflow.py`): Public feed publishing with automatic feed cache invalidation.
  - `TourismContextWorkflow` (`tourism_context_workflow.py`): Resolves canonical district, place UUID, and slug mappings with cross-district mismatch rejection.
- **Transactional Events Subsystem (`app/modules/social/events/`)**:
  - `SocialWorkflowEventType` and `SocialWorkflowEvent` with JSON-safe dictionary serialization `_make_json_safe`.
  - `SocialEventPublisher`: Inserts `OutboxEvent` records within the active database transaction and dispatches to memory subscribers.
  - Event handlers: Feed cache invalidation, workflow telemetry metrics, and structured audit logs.
- **Policy Engine & Guards (`app/modules/social/policies/`, `guards.py`)**:
  - `SocialAccountPolicy`, `SocialSyncPolicy`, `SocialContentPolicy`, `SocialPublicationPolicy`.
  - `assert_creator_active`, `assert_account_verifiable`, `assert_account_acceptable`, `assert_account_activatable`, `assert_account_sync_allowed`, `assert_content_validatable`, `assert_content_moderatable`, `assert_content_publishable`, `assert_cultural_protection`, `assert_geography_valid`.
- **Admin REST API (`app/modules/social/api/admin.py`)**:
  - `POST /api/admin/creators/{id}/activate`, `POST /api/admin/creators/{id}/suspend`
  - `POST /api/admin/accounts/{id}/disconnect`
  - `POST /api/admin/moderation/{id}/hide`, `POST /api/admin/moderation/{id}/restore`
  - `POST /api/admin/moderation/{id}/tourism-context`
  - `GET /api/admin/content`, `GET /api/admin/content/{id}`

### 20.3 Verification Matrix
- **Workflow Unit & Integration Suite (`tests/workflows/`)**:
  - `test_creator_workflow.py` (4 tests): Onboarding, duplicate check, activate, suspend.
  - `test_account_workflow.py` (4 tests): Register, duplicate platform rejection, pause, disconnect.
  - `test_sync_workflow.py` (5 tests): Async queueing (202), sync lock prevention, force sync, execution, quota handling.
  - `test_content_moderation_workflow.py` (5 tests): Validation, sacred consent gate, approve, hide, restore.
  - `test_tourism_context_workflow.py` (3 tests): Context assignment, cross-district mismatch rejection, festival tagging.
  - `test_end_to_end_workflow.py` (1 test): Complete 12-step orchestrated lifecycle from onboarding to public feed query.
  - `test_failure_injection.py` (4 tests): Quota backoff calculation, verification timeout friendly error, SSRF blocking, transaction rollback outbox consistency.
  - **Result: 26 / 26 PASSED (100%)**.
- **Admin API Integration Suite (`tests/social/test_admin_workflow_api.py`)**:
  - `test_admin_creator_activate_and_suspend_api`
  - `test_admin_account_disconnect_api`
  - `test_admin_moderation_hide_and_restore_api`
  - `test_admin_moderation_tourism_context_api`
  - `test_admin_content_list_and_get_api`
  - **Result: 5 / 5 PASSED (100%)**.
- **Total Backend Social Engine Tests**:
  - `pytest -q app/modules/social`: **226 / 226 PASSED (100%) in 7.24s**.
  - `pytest -q tests/social`: **25 / 25 PASSED (100%) in 2.38s**.
  - **Combined: 251 / 251 PASSED (100%)**.
- **Frontend Jest Suite**:
  - `npm test -- --testPathPattern="social"`: **12 / 12 suites, 73 / 73 PASSED (100%) in 8.87s**.

---

## 21. Production Build — Social Engine — Phase 10: System Integration & End-to-End User Experience

### 21.1 Architectural Objectives
- Transform Social into a native discovery-to-tourism subsystem of the CG Tourism OS.
- Bridge creator stories directly to destination exploration, interactive maps, and trip planning without duplicating domain graphs.
- Establish strict ownership boundaries: providers own third-party media and post identifiers; CG Tourism owns geographical, cultural, and planning metadata.
- Implement decoupled `SocialTourismContextService` integration boundary so the Social module does not depend on internal graph implementation details.
- Provide full two-way navigation between Map, Homepage, Districts, Places, and Creator portfolios.

### 21.2 Implemented Subsystems & Modules
- **Context Resolution Service (`apps/api/app/modules/social/context/`)**:
  - `SocialTourismContext`: Frozen dataclass capturing canonical district, place UUID, place slug, place name, zone, experience, festival, and confidence scores.
  - `SocialTourismContextService`: Bridges direct `SocialContent` fields with secondary `SocialContentContext` entity links (`resolve_sync` and `resolve`).
  - Added `self.context = SocialTourismContextService(session)` to `SocialEngine`.
- **Feed & Entity Repositories (`apps/api/app/modules/social/`)**:
  - `SocialContentRepository.list_feed`: Added `place_id: UUID | None` and `creator_id: UUID | None` filtering.
  - `FeedService.get_feed`: Exposed `place_id`, `creator_id`, and `cultural_tag` filters.
  - `SocialContent.place_name`: Added mapped column for persisted place name resolution.
  - `AccountVerificationWorkflow`: Added guard preventing account verification for inactive/suspended creators.
- **REST API Endpoints (`apps/api/app/modules/social/api/`)**:
  - `GET /api/social/districts/{district_id}`: Serves district social stories.
  - `GET /api/social/places/{place_id_or_slug}`: Supports UUID lookup and slug resolution.
  - `GET /api/social/feed`: Parameterized with place, creator, cultural tag, and content type.
  - `GET /api/social/creators` & `GET /api/social/creators/{handle_or_id}`: Creator directory and profile lookups.
- **Cache Eviction Pipeline (`apps/api/app/modules/social/events/handlers.py`)**:
  - Event-driven invalidation for Section 10.33 cache keys: `social:feed:all`, `social:feed:district:{id}`, `social:feed:place:{id}`, `social:content:{id}`, `social:creator:{id}` with safe Redis eviction.
- **Frontend Contract & Client API (`apps/web/src/lib/social/`)**:
  - `types.ts`: Added `SocialTourismContext` and `TourismReference` contracts; enriched `SocialContent` model.
  - `api.ts`: Exported unified `socialApi` surface (`getFeed`, `getContent`, `getCreators`, `getCreator`, `getDistrictContent`, `getPlaceContent`).
  - `navigation.ts`: Added `getTourismMapPath` and `getTourismPlannerPath`.
- **Frontend UI Subsystem Integrations (`apps/web/`)**:
  - `SocialStoriesSection` (`src/components/social/home/SocialStoriesSection.tsx`): Curated regional stories on homepage (`/`).
  - `DistrictSocialStories` (`src/components/social/district/DistrictSocialStories.tsx`): Local perspectives embedded on district guides (`/districts/[slug]`).
  - `TourismMap` (`src/components/map/TourismMap.tsx`): "View Stories" popup action linking directly into place feeds (`/social/places/[slug]`).
  - Content Detail Page (`src/app/social/content/[id]/page.tsx`): Destination guide, interactive map, and itinerary planning CTAs.

### 21.3 Verification Matrix
- **Backend System Integration Suite (`apps/api/app/modules/social/tests/test_phase10_system_integration.py`)**:
  - `test_golden_path_end_to_end_22_steps`: Verified all 22 steps of the golden path lifecycle from creator onboarding through moderation, publication, feed discovery, context resolution, and original source navigation.
  - `test_integration_tourism_context_service_secondary_entities`: Verified context synthesis across direct and auxiliary tags.
  - `test_integration_failure_and_security_invariants`: Verified security invariants (inactive creator verification block, paused account sync block).
  - **Result: 3 / 3 PASSED (100%)**.
- **Full Backend Social Engine Suite**:
  - `pytest -q app/modules/social`: **229 / 229 PASSED (100%)**.
  - `pytest -q tests/social`: **25 / 25 PASSED (100%)**.
  - **Combined Backend: 254 / 254 PASSED (100%)**.
- **Frontend Jest Suite (`apps/web`)**:
  - `SocialPhase10Integration.test.tsx` (5 tests): Navigation helpers, unified `socialApi`, `SocialStoriesSection`, `DistrictSocialStories`.
  - **Full Frontend Social Suites**: **13 / 13 suites, 78 / 78 PASSED (100%)**.

---

## 22. Production Build — Social Engine — Phase 11: Unit Test Cases, Verification, Validation & End-to-End User Experience Testing

### 22.1 Quality Architecture & Objectives
Phase 11 acts as the strict production quality gate for the Social Engine subsystem of the CG Tourism OS. It validates the full continuum:
$$\text{Admin} \longrightarrow \text{Provider} \longrightarrow \text{Database} \longrightarrow \text{Feed} \longrightarrow \text{Tourism} \longrightarrow \text{Planning} \longrightarrow \text{Original Source}$$

### 22.2 Core Quality Gates & Verification Components
1. **Deterministic Test Environment Hierarchy (`apps/api/app/modules/social/tests/fixtures.py`)**:
   - `setup_social_test_environment(session)`: Builds a complete deterministic mock database state spanning geographic zones, Creators A/B/C, multi-platform accounts (Active, Rejected), and content across all publication and availability states.
2. **HTTPS Scheme & Source URL Integrity (`apps/api/app/modules/social/domain/value_objects.py`, `source/validator.py`)**:
   - Restricts `SUPPORTED_SCHEMES = {"https"}` and `ALLOWED_SCHEMES = frozenset({"https"})`. Rejects insecure `http://`, `file://`, `ftp://`, and `javascript:` schemes.
3. **Backend Test Suites (`apps/api/app/modules/social/tests/`)**:
   - `test_phase11_domain_and_urls.py` (9 tests): Covers Gates 01–03 (Enums, Source URL validation, normalization, state machine transitions, sync eligibility).
   - `test_phase11_creators_and_accounts.py` (3 tests): Covers Gates 04–05 (Creator CRUD, duplicate slug rejection, district validation, account uniqueness, editorial acceptance gate).
   - `test_phase11_providers_and_parsers.py` (6 tests): Covers Gates 06–08 (Provider registry, HTTP error mappings 404/401/429/503/quota, YouTube parser, Shorts vertical classifier, sync deduplication, and editorial field preservation).
   - `test_phase11_content_moderation_feed.py` (9 tests): Covers Gates 09–12 (Content lifecycle, moderation review, audit logging, sacred consent validation, publication gate matrix, feed eligibility & filtering, cursor pagination, anti-monopoly diversity, and geography graph validation).
   - `test_phase11_security_and_resilience.py` (9 tests): Covers Gates 13–15 (Standardized API error contracts, RBAC roles, SSRF isolation, secret scanning, outbox transaction atomicity, cache invalidation, sync idempotency, distributed locking concurrency, failure injection & recovery).
4. **Frontend QA & End-to-End User Experience Suite (`apps/web/src/components/social/__tests__/SocialPhase11QA.test.tsx`)**:
   - 10 comprehensive tests covering Consumer Journeys 1–6:
     - Journey 1: Social discovery to outbound platform attribution with secure anchor attributes.
     - Journey 2: Accessible format tabs with tablist semantics and active states.
     - Journey 3: Verified regional creator strip with handle display and profile navigation.
     - Journey 4: High-resolution media lightbox with Escape key dismissal and accessible close action.
     - Journey 5: Tourism entity badge linking to place and district guides.
     - Journey 6: Open original source action button with target `_blank` and rel `noopener noreferrer`.
5. **Formal QA & Certification Documentation**:
   - `docs/social/PHASE_11_TEST_REPORT.md`: Comprehensive test execution log across all 15 gates and frontend journeys.
   - `docs/social/PHASE_11_VALIDATION_REPORT.md`: Invariant validation and production readiness sign-off report.

### 22.3 Verification Matrix
- **Full Backend Social Engine Pytest Suite (`apps/api`)**:
  - `pytest -q app/modules/social/tests`: **265 / 265 PASSED (100%)** in 54.64s.
- **Full Frontend Social Jest Suite (`apps/web`)**:
  - `npm test -- --testPathPattern="social"`: **14 / 14 suites, 88 / 88 PASSED (100%)** in 6.13s.
- **Combined Platform Verification**: **353 / 353 PASSED (100%)**. Zero regressions. All quality gates cleared.








