# Social Engine — Provider Integration & Adapter Architecture

## 1. Provider Registry Pattern

All external social platforms interface with the Chhattisgarh Tourism Social Engine via the `ProviderRegistry` pattern. The core engine remains completely agnostic to platform-specific SDKs, API differences, and payload structures.

```
                  ProviderRegistry
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
YouTubeAdapter                   InstagramAdapter
 (YouTube Data API v3)            (Meta Graph API v21.0)
```

Each adapter implements `BaseSocialProvider` with canonical methods:
- `verify_account(handle: str) -> SocialAccountProfile`
- `fetch_content(account_id: str, since: datetime | None, limit: int) -> list[RawProviderContent]`
- `fetch_metrics(content_ids: list[str]) -> dict[str, ContentMetrics]`
- `verify_source_availability(source_url: str) -> bool`

---

## 2. YouTube Production Adapter

- **Protocol**: REST over HTTPS via `httpx` asynchronous client.
- **Base URL**: `https://www.googleapis.com/youtube/v3`
- **Supported Media Types**: Long-form Videos (`ContentType.VIDEO`), YouTube Shorts (`ContentType.SHORT`).
- **Authentication**: Server-side API key (`YOUTUBE_API_KEY`) secured in environment variables.
- **Quota Protection**:
  - Search requests: Cost 100 quota units; minimized by fetching directly from creator channel `uploads` playlist (cost: 1 unit).
  - Max pages per sync: 3 (default, configurable up to 20).
  - Max videos per sync: 150 items.
  - Video detail batching: Grouped in chunks of 50 per `videos.list` request.
- **Resilience**:
  - Exponential backoff with jitter on HTTP 429 and 5xx errors.
  - Circuit breaker trips after 5 consecutive failures with a 60-second cooldown window.

---

## 3. Instagram Production Adapter

- **Protocol**: Meta Graph API v21.0.
- **Base URL**: `https://graph.facebook.com/v21.0`
- **Supported Media Types**: Instagram Reels (`ContentType.REEL`), Carousels & Photos (`ContentType.POST`).
- **Authentication**: Instagram Graph API token management (`INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`).
- **Pagination & Rate Limiting**:
  - Cursor-based pagination (`after` token).
  - Rate limiting monitored via `X-App-Usage` and `X-Business-Use-Case-Usage` headers.
  - Automatic sleep/delay when call usage exceeds 80% threshold.

---

## 4. Extensibility Guide

To add a new platform (e.g. Threads, Pinterest):
1. Add platform identifier to `SocialPlatform` enum in `domain/enums.py`.
2. Implement `BaseSocialProvider` in `app/modules/social/providers/<new_platform>/adapter.py`.
3. Map external payloads to canonical `RawProviderContent` and `SocialContent`.
4. Register the adapter in `app/modules/social/providers/registry.py`.
