# Social Engine — Phase 1: Persistence Layer & Models Architecture

## 1. Executive Summary

Phase 1 establishes the production persistence layer for the **Social & Feed System** in Chhattisgarh Tourism OS (`Unseen36Garh`). Building upon the immutable domain models and enums finalized in Phase 0, Phase 1 delivers:
1. **SQLAlchemy ORM Models**:
   - `Creator` / `SocialCreator` (`creators` table, view alias `social_creators`)
   - `SocialAccount` (`social_accounts` table)
   - `SocialAccountSyncState` (`social_account_sync_states` table)
   - `SocialContent` (`social_contents` table)
   - `SocialSyncRun` (`social_sync_runs` table)
2. **Database Schema Constraints & Indexes**:
   - Composite uniqueness constraint: `uq_social_account_creator_platform_handle` on `(creator_id, platform, handle)`
   - Multi-column index `(status, platform)` for high-throughput sync scheduler polling
   - Secondary indexes on `external_account_id` and `sync_status`
   - Canonical `(provider, provider_content_id)` deduplication index on `social_contents`
3. **Bi-directional Domain <-> ORM Mapping**:
   - Explicit `.to_domain()` and `.from_domain()` methods for `SocialAccount`, `SocialContent`, `SocialCreator`, and `SocialAccountSyncState`
   - Python property compatibility bridges (`sync_enabled`, `last_synced_at`, `last_successful_sync_at`, `platform`, `status`)
4. **Transactional Outbox Event Generation**:
   - `SOCIAL_ACCOUNT_REGISTERED`
   - `SOCIAL_ACCOUNT_ACCEPTED`
   - `SOCIAL_ACCOUNT_ACTIVATED`
   - `SOCIAL_ACCOUNT_PAUSED`
   - `SOCIAL_CONTENT_SYNCED`
   - `SOCIAL_SYNC_COMPLETED`
   - `SOCIAL_SYNC_FAILED`
5. **Database Migration**:
   - `p25_social_persistence_layer.py` applied cleanly via Alembic.

---

## 2. Relational Entity Schema

```
 +-----------------------------------------------------------------------------------+
 |                                     creators                                      |
 +-----------------------------------------------------------------------------------+
 | id (UUID PK)                                                                      |
 | user_id (UUID FK Nullable, Unique)                                                |
 | handle (VARCHAR(50) Unique)                                                       |
 | display_name (VARCHAR(120))                                                       |
 | district_id (VARCHAR(80))                                                         |
 | languages (JSONB)                                                                 |
 | categories (JSONB)                                                                |
 | status (VARCHAR(30))                                                              |
 | is_verified (BOOLEAN)                                                             |
 | followers_count, following_count, posts_count (INTEGER)                           |
 | created_at, updated_at (TIMESTAMPTZ)                                              |
 +-----------------------------------------------------------------------------------+
                                         | 1
                                         |
                                         | N
 +-----------------------------------------------------------------------------------+
 |                                 social_accounts                                   |
 +-----------------------------------------------------------------------------------+
 | id (UUID PK)                                                                      |
 | creator_id (UUID FK creators.id CASCADE)                                          |
 | platform (VARCHAR(32))                                                            |
 | handle (VARCHAR(128))                                                             |
 | display_name (VARCHAR(255) Nullable)                                              |
 | external_account_id (VARCHAR(128) Nullable, Index)                                |
 | profile_url (VARCHAR(512) Nullable)                                               |
 | account_type (VARCHAR(64) 'CREATOR')                                              |
 | status (VARCHAR(32), Index)                                                       |
 | sync_status (VARCHAR(32), Index, Default 'never_run')                             |
 | is_sync_enabled (BOOLEAN)                                                         |
 | sync_frequency_minutes (INTEGER Default 60)                                       |
 | priority (INTEGER Default 50)                                                     |
 | content_types_allowed (JSONB ['VIDEO', 'SHORT', 'REEL', 'POST'])                  |
 | max_items (INTEGER Default 30)                                                    |
 | is_featured (BOOLEAN)                                                             |
 | sync_health (VARCHAR(32) 'HEALTHY')                                               |
 | last_successful_sync (TIMESTAMPTZ Nullable)                                       |
 | last_attempted_sync (TIMESTAMPTZ Nullable)                                        |
 | last_error (TEXT Nullable)                                                        |
 | consecutive_failures (INTEGER Default 0)                                          |
 | sync_cursor (VARCHAR(256) Nullable)                                               |
 | metadata_json (JSONB)                                                             |
 | created_at, updated_at (TIMESTAMPTZ)                                              |
 +-----------------------------------------------------------------------------------+
        | 1                              | 1                              | 1
        |                                |                                |
        | 1 (uselist=False)              | N                              | N
        v                                v                                v
 +-----------------------------+  +-----------------------------+  +-----------------------------+
 | social_account_sync_states  |  |       social_contents       |  |      social_sync_runs       |
 +-----------------------------+  +-----------------------------+  +-----------------------------+
 | id (UUID PK)                |  | id (UUID PK)                |  | id (UUID PK)                |
 | social_account_id (UUID FK) |  | creator_id (UUID FK)        |  | social_account_id (UUID FK) |
 | sync_status (VARCHAR(32))   |  | social_account_id (UUID FK) |  | status (VARCHAR(32))        |
 | sync_enabled (BOOLEAN)      |  | provider (VARCHAR(32))      |  | items_discovered (INTEGER)  |
 | last_synced_at              |  | provider_content_id (Index) |  | items_synced (INTEGER)      |
 | last_successful_sync_at     |  | source_url (VARCHAR(1024))  |  | error_message (TEXT)        |
 | consecutive_failures (INT)  |  | thumbnail_url (VARCHAR)     |  | started_at, finished_at     |
 | cursor (VARCHAR(256))       |  | district_id, place_id       |  +-----------------------------+
 | items_synced_total (INT)    |  | cultural_tags, tourism_tags |
 | updated_at (TIMESTAMPTZ)    |  | likes, saves, trip_adds     |
 +-----------------------------+  +-----------------------------+
```

---

## 3. Strict Architectural Decisions

### 3.1 Avoid Property Clashes with Declarative MetaData
In SQLAlchemy declarative mapping, `Model.metadata` is reserved for the `sqlalchemy.MetaData` collection. Defining a Python `@property def metadata(self)` on declarative models breaks table registration with `AttributeError: 'property' object has no attribute 'schema'`.
- **Resolution**: Use `metadata_json` as the column and attribute name for arbitrary JSON metadata dictionaries. The domain dataclasses map this field via `.to_domain()` and `.from_domain()`.

### 3.2 Index Collision Prevention in SQLite
SQLite creates table-level indexes from both column-level `index=True` flags and explicit `__table_args__ = (Index(...),)`. Having both with the same name raises `OperationalError: index already exists`.
- **Resolution**: Declare named indexes strictly once within `__table_args__`.

### 3.3 Zero Raw Video Blob Persistence
CG Tourism does not store raw video binaries. All content sync strictly retains normalized thumbnails, duration, aspect ratios, titles, cultural context, and external platform deep links (`Watch on YouTube`, `View on Instagram`).
