# Social Engine — Production Operations, Observability & Runbooks

## 1. Operational Health Dashboard

Administrators and DevOps engineers monitor the health of the Social Engine via the operational dashboard endpoint:
`GET /social/admin/dashboard`

```
Social Engine Health Overview
─────────────────────────────
Active Creators:        128
Active Accounts:        214
Syncing Accounts:        17
Failed Syncs:             3
Content Published:    8,421
Pending Moderation:      42
Unavailable Sources:     19

Providers:
  YouTube:             ✓ Healthy (Quota consumed: 4.2%)
  Instagram:           ✓ Healthy (Rate limit: 12.8%)
```

---

## 2. Standard Telemetry Counters (Section 12.32)

Tracked via `apps/api/app/modules/social/observability.py`:
- `social_sync_total`: Total synchronization jobs initiated.
- `social_sync_success_total`: Total successful sync runs.
- `social_sync_failure_total`: Total failed sync runs.
- `social_provider_request_total`: Outbound calls to YouTube / Instagram.
- `social_provider_error_total`: Outbound provider HTTP errors.
- `social_rate_limit_total`: 429 rate limit responses received.
- `social_content_created_total`: New canonical content records ingested.
- `social_content_updated_total`: Existing content records updated with fresh metrics.
- `social_content_hidden_total`: Content items hidden by curators.
- `social_feed_request_total`: Feed page requests received.
- `social_feed_cache_hit_total`: Feed responses served from Redis/memory cache.
- `social_source_click_total`: Consumer outbound clicks to original source platforms.

---

## 3. Secret Redaction & Structured Logging (Section 12.34)

Developer logs must conform to structured schema and redact sensitive tokens:
```python
{
    "request_id": "req-98231",
    "account_id": "acc-10492",
    "provider": "youtube",
    "operation": "fetch_channel_videos",
    "error_type": "QuotaExceeded",
    "status_code": 429,
    "duration_ms": 142.3,
    "retry_count": 2,
    "message": "Outbound call failed for key=***REDACTED***"
}
```

---

## 4. Operational Runbooks

### Runbook 1: Production Deployment Sequence (Section 12.36)
1. **Database Backup**: Snapshot production database.
2. **Backend Deploy**: Deploy API services.
3. **Run Migrations**: `alembic upgrade head`.
4. **Deploy Frontend**: Deploy web application with cached static assets.
5. **Start Sync Workers**: Spin up background worker consumers.
6. **Start Sync Scheduler**: Activate cron schedule.
7. **Verify Health**: Probe `GET /health` and `GET /social/admin/dashboard`.
8. **Controlled Sync**: Trigger Wave 1 sync for 1–3 creators.

### Runbook 2: Provider Circuit Breaker Trip
1. Check `/social/admin/dashboard` provider health status.
2. Inspect log output for HTTP 429 or quota limit exhaustion.
3. If quota exceeded, verify that `social_max_pages_per_sync` and `social_youtube_max_videos_per_sync` are appropriately constrained.
4. Circuit resets automatically after cooldown (default: 60 seconds).
