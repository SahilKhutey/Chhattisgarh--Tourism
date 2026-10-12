# Social Engine — Feed System, Presentation & Caching

## 1. Unified Feed Architecture

The Social Feed provides an editorial, cinematic discovery experience across all formats without segregating YouTube and Instagram:

```
                            SOCIAL FEED
                                 │
           ┌───────────┬─────────┴─────────┬───────────┐
           ▼           ▼                   ▼           ▼
        All Stories  Reels               Videos      Shorts
           │           │                   │           │
           └───────────┴─────────┬─────────┴───────────┘
                                 │
                                 ▼
                     Responsive Dynamic Grids
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
            Standard Cards               Lightbox Modal
           (In-Feed Browse)            (Focus Exploration)
```

---

## 2. Feed Components & Presentation Layer

- **`SocialFeedTabs`**: Accessible tablist allowing fluid switching between All Stories, Reels, Videos, Shorts, and Photo Posts.
- **`SocialCreatorStrip`**: Horizontal carousel featuring verified regional storytellers with one-click navigation to creator profile pages.
- **`SocialContentCard`**: Card design featuring:
  - Responsive media thumbnail with format/platform badges.
  - Creator profile badge with verification checkmark.
  - Curated geographic badge (`SocialContextBadge`) linking directly to place pages.
  - Direct external platform attribution button (`SocialOpenSourceButton`).
- **`SocialMediaLightbox`**: Fullscreen modal for immersive exploration, featuring:
  - High-resolution media presentation.
  - Narrative caption and cultural tags.
  - "Plan Visit to [Place]" primary CTA linking into the itinerary planner.
  - Original source attribution.

---

## 3. Cache Architecture & Invalidation

### Cache Hierarchy
- `social:feed:all` — Global feed top items (TTL: 15 minutes).
- `social:feed:district:<district_id>` — District-specific feeds.
- `social:feed:place:<place_slug>` — Place-specific social collections.
- `social:creator:<creator_id>` — Creator portfolio feeds.

### Event-Driven Invalidation
Cache keys are automatically purged whenever content lifecycle changes occur:
- `CONTENT_PUBLISHED`
- `CONTENT_HIDDEN`
- `CONTENT_RESTORED`
- `CONTENT_SOURCE_DELETED`
- `ACCOUNT_PAUSED`
- `ACCOUNT_DISCONNECTED`
