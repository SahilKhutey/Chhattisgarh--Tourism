# Social Engine — Synchronization Engine & Orchestration

## 1. Sync Orchestration Architecture

The Synchronization Engine coordinates periodic and on-demand synchronization of active creator accounts:

```
┌─────────────────┐       ┌────────────────────┐
│ Sync Scheduler  │  ──>  │  Async Job Queue   │
└─────────────────┘       └────────────────────┘
                                     │
                                     ▼
                          ┌────────────────────┐
                          │   Sync Worker      │
                          └────────────────────┘
                                     │
                                     ▼
                          ┌────────────────────┐
                          │  Sync Coordinator  │
                          └────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
             Acquire Lock                     Fetch Provider Media
             (InMemory/Redis)                         │
                    │                                 ▼
                    │                          Normalize to Canonical
                    │                                 │
                    │                                 ▼
                    │                          Deduplicate by Identity
                    │                                 │
                    ▼                                 ▼
              Release Lock                     Persist SocialContent
```

---

## 2. Sync Safety Rules

1. **Distributed Lock Guarantee**: Each sync job requires acquiring `SocialSyncLock(account_id)`. Concurrent sync attempts for the same account immediately return HTTP 409 Conflict.
2. **Freshness & Age Limit**: Media older than `social_max_content_age_days` (default 90 days) is ignored during discovery to protect database capacity.
3. **Idempotency & Deduplication**: Unique constraint on `(provider, provider_content_id)` prevents duplicate records. If content already exists, only performance metrics (`views_count`, `likes_count`) and freshness are updated.
4. **Editorial Immutability (Rule 5)**: Background synchronization never touches or overwrites:
   - `place_id`, `place_slug`, `place_name`
   - `district_id`, `tourism_zone_id`
   - `cultural_sensitivity`, `cultural_tags`
   - `moderation_status`, `publication_status`

---

## 3. Production Controlled Rollout Strategy (Section 12.37)

To protect third-party API quotas and verify ingestion data quality:

- **Wave 1 (Initial Release)**: 1–3 pilot regional creators (e.g., Bastar Trails, Surguja Diaries).
  - Verify normalization, slug generation, and place linkage.
- **Wave 2**: 5–10 active creators across diverse districts (Bilaspur, Raipur, Bastar, Surguja).
- **Wave 3**: 25 active creators.
- **Wave 4**: Full creator registry synchronization on automated cron schedule.
