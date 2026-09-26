# MV5 — Content & Discovery Validation

## 1. Executive Summary & Strategic Shift
- **MV1** established the competitive landscape and market intelligence layer.
- **MV2** uncovered consumer problems, fragmented workflows, and planning friction.
- **MV3** validated the tourism supply-side participation, listing velocity, and provider lead economics.
- **MV4** established the regional geographic operating model, spatial relationships, and corridor clustering.

**MV5 now validates the content & discovery engine of CG Tourism OS:**

> *"Does richer, structured, trustworthy, regional tourism content help travelers discover destinations they care about, understand them faster, and move from discovery to planning?"*

Instead of an uncontrolled content factory producing generic SEO articles or AI-generated prose, MV5 validates **structured content schemas, ground-truth evidence provenance, real-time trust scoring, and behavioral discovery funnels**.

```
                   CG TOURISM CONTENT & DISCOVERY CHAIN
                                     │
                             Tourism Ground Data
                                     │
                         Structured Fact Sheets & Schemas
                                     │
                             Contextual Discovery
                      (Thematic, Geographic, Serendipity)
                                     │
                             Destination Relevancy
                                     │
                          Destination Understanding
                         (Logistics, Timing, Permits)
                                     │
                             Save / Bookmark / Share
                                     │
                             Trip Itinerary Planning
```

---

## 2. Core Validation Vectors
1. **Structured Content vs. Narrative Prose:** Verifying whether standardized fact sheets, logistical constraints, and key-value tables outperform traditional travel blogs in traveler decision-making.
2. **Provenance & Evidence Verification:** Demonstrating that attaching ground surveyor logs, official government orders, and community elder confirmations lifts traveler confidence and bookmarking.
3. **Dynamic Trust Index:** Penalizing stale information and unverified claims while rewarding verified operator and administrative corroborations.
4. **Behavioral Discovery Funnel:** Tracking the full lifecycle from impression to engaged reading, save/share, secondary destination view, and itinerary start.
5. **Controlled A/B Hypotheses:** Executing 10 rigorous experiments (`H-MV5-001` through `H-MV5-010`) using deterministic hashing across user cohorts.

---

## 3. The 7-Dimension Content Quality Metric ($Q \in [0, 100]$)

$$Q = C_{comp} + C_{acc} + C_{fresh} + C_{geo} + C_{util} + C_{trust} + C_{local}$$

| Dimension | Max Points | Measurement Focus |
| :--- | :--- | :--- |
| **Completeness ($C_{comp}$)** | 20 | Coverage of required schemas: hours, ticket prices, access routes, seasonality, and facilities. |
| **Accuracy ($C_{acc}$)** | 20 | Verified against official tourism notices, district gazettes, or verified on-site audits. |
| **Freshness ($C_{fresh}$)** | 10 | Recency of verification; degrades linearly when audit age exceeds 90 days (`CONTENT_STALE`). |
| **Geographic Context ($C_{geo}$)** | 15 | Explicit coordinates, transit access corridor, nearby cluster linkages, and drive-time buffers. |
| **Practical Utility ($C_{util}$)** | 15 | Clear resolution of travel friction: network connectivity, ATM availability, permit rules, safety alerts. |
| **Trust & Provenance ($C_{trust}$)** | 10 | Number of verified claims and absence of unresolved contradiction flags. |
| **Localization ($C_{local}$)** | 10 | Cultural nuance, vernacular terminology (e.g. Haat days, tribal customs), and community respect notes. |

---

## 4. The 7-Step Discovery Funnel
Rather than vanity traffic metrics (pageviews), MV5 measures the conversion drop-off across seven behavioral milestones:

1. **Content Impression:** Destination summary card surfaced via search, map, or recommendation feed.
2. **Content Open / View:** Traveler opens full structured fact sheet.
3. **Engaged Read:** Traveler interacts with page for $\ge 45$ seconds or scrolls $\ge 70\%$ of content body.
4. **Content Save / Bookmark:** Explicit intent captured to revisit destination during trip planning.
5. **Second Destination View:** Cross-discovery of nearby circuit destination within same session.
6. **Itinerary Draft Start:** User adds destination as waypoint in an active itinerary or creates new trip draft.
7. **Provider Inquiry Sent:** Traveler engages qualified local guide, homestay, or transport provider.

---

## 5. Architectural & Database Wiring
- **Database Migration:** `apps/api/alembic/versions/p17_market_validation_mv5.py` introduces 7 relational tables:
  1. `market_content_entries`
  2. `market_content_evidence`
  3. `market_content_trust`
  4. `market_content_experiments`
  5. `market_content_assignments`
  6. `market_discovery_events`
  7. `market_content_performance`
- **Backend Submodules:** Built in `apps/api/app/modules/market_validation/` across 7 subdomains (`content/`, `content_evidence/`, `trust/`, `content_experiments/`, `discovery/`, `content_analysis/`, and `auth.py`).
- **Frontend Dashboard:** 6 interactive admin pages in `apps/web/src/app/admin/market-validation/` and 8 reusable components.
- **Test Coverage:** 28 backend unit/integration tests (`apps/api/tests/modules/market_validation/mv5/`) and 8 frontend Jest tests (`apps/web/tests/market-validation/mv5-content-discovery.spec.ts`).
