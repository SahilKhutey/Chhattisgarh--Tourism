# Chhattisgarh Tourism OS — Social Engine Architecture

## 1. Executive Overview

The **Social Engine** is an integrated regional discovery subsystem of the **Chhattisgarh Tourism Operating System (CG Tourism OS)**. Rather than functioning as a self-contained social network, the Social Engine exists to communicate one guiding regional principle:

> **"See Chhattisgarh through the people who experience it."**

The platform integrates authentic creator narratives—from Bastar tribal folklore and Dhokra art to Kanger Valley waterfalls, Sirpur archaeological marvels, and Mainpat highlands—directly into the official geographic, destination, map, and trip-planning subsystems.

```
                         CG TOURISM OS
                              │
 ┌────────────────────────────┼────────────────────────────┐
 │                            │                            │
 ▼                            ▼                            ▼
TOURISM DATA               SOCIAL ENGINE               PLANNING
 │                            │                            │
 ├─ Geography                 ├─ Creators                  ├─ Trips
 ├─ Places                    ├─ Accounts                  ├─ Itineraries
 ├─ Destinations              ├─ Acceptance                └─ Experiences
 ├─ Experiences               ├─ Providers
 ├─ Festivals                 ├─ Sync
 └─ Culture                   ├─ Content
                              ├─ Moderation
                              ├─ Feed
                              ├─ Templates
                              └─ Analytics
                                   │
                                   ▼
                              CONSUMER
                                   │
                     ┌─────────────┼─────────────┐
                     ▼             ▼             ▼
                  DISCOVER       EXPLORE       PLAN
                     │             │             │
                     └─────────────┼─────────────┘
                                   ▼
                            REAL-WORLD TOURISM
```

---

## 2. The Five Architectural Rules

All Social Engine components strictly adhere to the five governing architectural rules (Section 12.3):

| Rule | Name | Architectural Mandate |
|---|---|---|
| **Rule 1** | **One Canonical SocialContent** | There is only one canonical `SocialContent` representation across the platform. Neither backend nor frontend implements fragmented per-provider models (e.g. no separate `YouTubeVideo` or `InstagramPost` UI components). |
| **Rule 2** | **Providers Stay Behind Adapters** | External APIs (YouTube Data API v3, Meta Graph API v21.0) stay strictly encapsulated behind backend adapters implementing `BaseSocialProvider`. The frontend never communicates directly with external social platforms. |
| **Rule 3** | **Backend Owns Source URLs** | Canonical source URLs (`https://youtube.com/watch?v=...`, `https://instagram.com/p/...`) are resolved, sanitized, validated, and persisted by the backend. The frontend renders them with secure `target="_blank" rel="noopener noreferrer"` attributes without URL manipulation. |
| **Rule 4** | **Mandatory Acceptance Workflow** | Social accounts cannot bypass editorial acceptance. The state progression is strictly: `REGISTERED` $\to$ `VERIFIED` $\to$ `ACCEPTED` $\to$ `ACTIVE` $\to$ `SYNC ENABLED`. Activation requires prior human editorial approval. |
| **Rule 5** | **Metrics Cannot Overwrite Editorial Context** | Background provider sync updates performance metrics (`view_count`, `like_count`, `comments_count`) and freshness without ever overwriting curated editorial context (`place_id`, `place_slug`, `district_id`, `tourism_zone_id`, `cultural_sensitivity`). |

---

## 3. Canonical System Boundaries

### Backend Boundary (`apps/api/app/modules/social`)
- **Domain & Models**: `Creator`, `SocialAccount`, `SocialContent`, `SocialContentContext`, `SocialModerationLog`, `FeedTemplate`.
- **Workflows**: `SocialWorkflowService`, `CreatorWorkflow`, `AccountWorkflow`, `AcceptanceWorkflow`, `SyncWorkflow`, `ModerationWorkflow`, `PublicationWorkflow`, `TourismContextWorkflow`.
- **Providers**: `ProviderRegistry`, `YouTubeAdapter`, `InstagramAdapter`.
- **Sync Engine**: `SocialSyncEngine`, `SocialSyncWorker`, `SocialSyncScheduler`, `SocialSyncCoordinator`, `InMemorySocialSyncLock`, `SocialCircuitBreaker`.
- **Observability**: `observability.py` tracking telemetry counters, operational dashboard metrics, and sanitized structured logging.

### Frontend Boundary (`apps/web/src/components/social`, `src/lib/social`, `src/app/social`)
- **Routes**: `/social` (Home), `/social/feed` (Feed), `/social/creators/[slug]` (Creator Profiles), `/social/content/[id]` (Content Detail), `/social/districts/[slug]` (District Hubs), `/social/places/[slug]` (Place Hubs).
- **Core Components**: `SocialContentCard`, `SocialContentMedia`, `SocialContentMeta`, `SocialContextBadge`, `SocialOpenSourceButton`, `SocialFeedGrid`, `SocialFeedTabs`, `SocialCreatorStrip`, `SocialMediaLightbox`.
- **Navigation & API**: `src/lib/social/navigation.ts`, `src/lib/social/api.ts`.
