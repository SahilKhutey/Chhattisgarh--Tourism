# Social Engine — Phase 0: Foundations Architecture

## 1. Executive Summary & Objective
Phase 0 establishes the immutable architectural foundation and domain contracts for the **Social Engine** within the Chhattisgarh Tourism OS (`Unseen36Garh`). It establishes canonical terminology, provider abstractions, account lifecycles, content representation, source URL validation, and error taxonomies **without premature provider API dependencies, video blob storage, or ad-hoc hacks**.

## 2. Canonical Architecture & Ownership Model
```
                    CREATOR
                       │ (owns original content)
                       ▼
                 SOCIAL ACCOUNT
                       │
                ACCEPTANCE GATE
             (VERIFIED -> ACTIVE)
                       │
                       ▼
                 SOCIAL PROVIDER
             (YouTube / Instagram)
                       │
                       ▼
                 SOCIAL CONTENT
             (Normalized Metadata)
                       │
                       ▼
                TOURISM CONTEXT
            (District, Place, Graph)
                       │
                       ▼
                  FEED ENGINE
                       │
                       ▼
                 FEED TEMPLATE
           (Standard / Masonry / Hero)
                       │
                       ▼
                   CONSUMER
             (Discovers on Platform)
                       │
                       ▼
                ORIGINAL SOURCE
             (Clicks Out to External)
```

## 3. Directory Layout & Module Structure
```
apps/api/app/modules/social/
│
├── __init__.py
│
├── domain/
│   ├── __init__.py
│   ├── enums.py            # StrEnums: SocialPlatform, SocialAccountStatus, SocialContentType, etc.
│   ├── errors.py           # Explicit error taxonomy for retryable/non-retryable failures
│   ├── models.py           # Pure domain dataclasses: SocialAccount, SocialContent
│   ├── state_machines.py   # State machine guards and transitions
│   └── value_objects.py    # SourceUrl: HTTP/S validation & canonical normalization
│
├── providers/
│   ├── __init__.py
│   ├── base.py             # Protocol SocialProvider, ProviderAccount, ProviderContent
│   └── registry.py         # ProviderRegistry for runtime lookup and decoupling
│
├── services/
│   ├── __init__.py
│   └── account_service.py  # transition_account and ALLOWED_TRANSITIONS validation
│
├── config.py               # SocialSettings (disabled-by-default safety posture)
│
└── tests/
    ├── __init__.py
    ├── test_enums.py
    ├── test_source_url.py
    ├── test_provider_registry.py
    └── test_account_lifecycle.py
```

## 4. Key Contracts & Invariants

### 4.1 Domain Enums & StrEnum Isolation
- All platform and status identifiers are strongly typed via `StrEnum` to prevent raw string comparisons across the application.
- Enums:
  - `SocialPlatform`: `youtube`, `instagram`
  - `SocialAccountStatus`: `pending`, `verifying`, `verified`, `pending_acceptance`, `accepted`, `active`, `paused`, `rejected`, `disconnected`
  - `SocialContentType`: `post`, `video`, `reel`, `short`, `story`
  - `SocialContentStatus`: `discovered`, `synced`, `validated`, `under_review`, `approved`, `published`, `hidden`, `removed`, `source_unavailable`, `source_deleted`, `source_private`
  - `SocialModerationStatus`: `not_required`, `pending`, `approved`, `rejected`
  - `SocialVisibility`: `public`, `hidden`
  - `SyncStatus`: `never_run`, `running`, `succeeded`, `partial`, `failed`
  - `AccountAcceptanceAction`: `accept`, `reject`, `pause`, `reactivate`

### 4.2 SourceUrl Value Object
- Restricts schemes strictly to `http` and `https`.
- Mandates a valid non-empty hostname.
- Provides idempotent normalization: lowercased scheme, lowercased hostname, and stripped URL fragments (`#section`).

### 4.3 Explicit Account Lifecycle & Acceptance Gate
- Enforces multi-stage state transitions:
  - `PENDING` -> `VERIFYING` -> `VERIFIED` -> `ACCEPTED` -> `ACTIVE`
  - Pre-active accounts can transition to `REJECTED`
  - Active accounts can transition to `PAUSED` or `DISCONNECTED`
- **Core Product Rule**: Accounts must be `ACCEPTED` and have `sync_enabled=True` before any synchronization engine is allowed to fetch external content.

### 4.4 Provider Interface & Registry
- `SocialProvider` protocol defines:
  - `verify_account(profile_url) -> ProviderAccount`
  - `fetch_content(account, cursor) -> tuple[list[ProviderContent], str | None]`
  - `fetch_content_item(external_id) -> ProviderContent`
- `ProviderRegistry` holds registered platform providers, prevents duplicates, and isolates callers from platform-specific APIs.

### 4.5 Configuration Safety Boundary
- `SocialSettings`:
  - `social_engine_enabled`: default `False`
  - `social_sync_enabled`: default `False`
  - `social_require_acceptance`: default `True`
  - `social_default_page_size`: default `20`
  - `social_max_content_age_days`: default `90`
  - `social_sync_timeout_seconds`: default `30`
  - `social_allowed_platforms`: `"youtube,instagram"`

## 5. Test Suite Verification
- `test_enums.py`: Verifies enum string values, lookups, and acceptance actions.
- `test_source_url.py`: Verifies URL normalization, HTTPS scheme validation, and invalid URL rejections.
- `test_provider_registry.py`: Verifies provider registration, duplicate rejection, and platform lookups.
- `test_account_lifecycle.py`: Verifies valid and invalid account lifecycle state transitions.
- Total Phase 0 unit tests: **17 passed in <2s**. Total social tests: **32 passed in ~3s**.
