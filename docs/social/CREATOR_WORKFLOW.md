# Social Engine — Creator & Account Lifecycle Workflow

## 1. Creator Onboarding & Identity

Every content creator on the Chhattisgarh Tourism platform is registered with a distinct regional identity linked to tourism districts:

```
                  ONBOARD CREATOR
                        │
                        ▼
                 Creator (PENDING)
                        │
                ┌───────┴───────┐
                ▼               ▼
           Add Handle      Verify Identity
                │               │
                └───────┬───────┘
                        ▼
                 Creator (ACTIVE)
```

### Required Creator Identity Attributes
- `display_name`: Official public creator or channel name.
- `slug`: URL-safe identifier (e.g., `amrit_lal_bastar`, `bastartrails`).
- `district_id`: Primary regional association (e.g., `bastar`, `surguja`, `raipur`).
- `bio`: Curated editorial narrative highlighting focus areas (tribal craft, waterfalls, eco-trails).
- `is_verified`: Boolean badge indicating official tourism ambassador verification.

---

## 2. Social Account Registry & Acceptance Workflow

To guarantee brand safety, cultural dignity, and platform compliance, social account ingestion strictly enforces the **Mandatory Acceptance Workflow (Rule 4)**:

```
[ REGISTER HANDLE ]
        │
        ▼
   status: PENDING
        │
        ▼
[ PROVIDER VERIFICATION ]
        │  (Validates handle exists & returns channel/account ID)
        ▼
   status: VERIFIED
        │
        ▼
[ EDITORIAL ACCEPTANCE ]
        │  (Human curator reviews content quality & regional relevance)
        ▼
   status: ACCEPTED  (sync_enabled: False)
        │
        ▼
[ OPERATIONAL ACTIVATION ]
        │  (Operations activates account for synchronization)
        ▼
   status: ACTIVE    (sync_enabled: True)
```

### State Definitions

| State | Description | Sync Allowed |
|---|---|:---:|
| `PENDING` | Handle registered in database, awaiting provider lookup. | ❌ |
| `VERIFYING` | Verification request currently in-flight with provider API. | ❌ |
| `VERIFIED` | Provider confirmed channel exists; valid external ID bound. | ❌ |
| `ACCEPTED` | Editorial review approved creator content for tourism platform. | ❌ |
| `ACTIVE` | Operations enabled account; eligible for automatic sync worker. | ✅ |
| `PAUSED` | Temporarily paused by admin or rate limits; no sync jobs ran. | ❌ |
| `DISCONNECTED` | Handle revoked or removed by creator/admin. | ❌ |

---

## 3. Disconnection & Cleanup

When an account is disconnected:
1. `status` transitions to `DISCONNECTED`.
2. `sync_enabled` is set to `False`.
3. Cached feed keys associated with the creator (`social:creator:<id>`, `social:feed:all`) are immediately invalidated.
4. Existing published content can be retained with archival flag or hidden according to moderation policy.
