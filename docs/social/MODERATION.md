# Social Engine — Content Moderation & Cultural Responsibility

## 1. Multi-Stage Moderation Pipeline

Every discovered media item passes through a mandatory moderation and validation pipeline prior to public feed visibility:

```
[ DISCOVERED ]
      │
      ▼
[ VALIDATED ] ── (Automated check: valid media URL, non-empty title/slug)
      │
      ▼
[ UNDER REVIEW ] ── (Queued for human editorial inspection)
      │
      ├───────────────────────┬───────────────────────┐
      ▼                       ▼                       ▼
 [ APPROVED ]            [ REJECTED ]            [ ESCALATED ]
      │                   (Irrelevant/Spam)   (Cultural Sensitivity)
      ▼
 [ PUBLISHED ]
```

---

## 2. Cultural Sensitivity Taxonomy

To respect indigenous tribal customs, sacred groves (Devgudis), and heritage protocols:

| Level | Identifier | Description & Requirements |
|---|---|---|
| **Standard** | `STANDARD` | General nature, waterfalls, highway viewpoints, standard city attractions. Default review path. |
| **Sensitive** | `SENSITIVE` | Living tribal customs, village haat bazaars, metal crafts. Requires editorial verification of narrative accuracy. |
| **Sacred Ritual** | `SACRED_RITUAL` | Bastar Dussehra rituals, Madai fairs, sacred forest ceremonies. Requires `has_sacred_consent: True` and explicit cultural attribution. |
| **Community Protected** | `COMMUNITY_PROTECTED` | Protected tribal territory (Abujhmardh, remote settlements). Prohibited from automated public broadcast without formal tourism board and community council clearance. |

---

## 3. Moderation Actions & Audit Logging

- **Approve**: Transitions status to `APPROVED`, preparing content for publication.
- **Reject**: Marks status as `REJECTED`, logging curator rejection reason.
- **Hide / Restore**: Admin toggle enabling immediate removal of controversial or outdated media from public feeds without data loss.
- **Source Unavailable**: Triggered automatically when periodic health checks detect that the original creator removed the video/post from YouTube or Instagram.
