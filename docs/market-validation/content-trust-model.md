# MV5 — Content Trust & Credibility Model

Trust is the single most critical asset in non-standardized tourism destinations like Chhattisgarh. Inaccurate gate timings, unknown road closures, or obsolete permit requirements create immediate trip failure and brand destruction.

---

## 1. Dynamic Trust Index Formula ($T \in [0, 100]$)

Every content entry begins with a neutral baseline of **50.0 points**, adjusted dynamically based on verification provenance and contradiction signals:

$$T = \min\Big(100, \max\big(0, 50 + B_{gov} + B_{ranger} + B_{op} + B_{fresh} - P_{contra} - P_{stale} - P_{dispute}\big)\Big)$$

### Trust Increment Bonuses ($B$)
- **Official Administrative Citation ($B_{gov} = +20$ pts):** Corroborated with district collectorate order, forest gazette notification, or official tourism board release.
- **On-Ground Field Ranger Audit ($B_{ranger} = +20$ pts):** Direct verification by forest department ranger or municipal tourism supervisor.
- **Registered Operator Corroboration ($B_{op} = +15$ pts):** Confirmed by an onboarded, verified local guide or homestay host from the MV3 registry.
- **Verification Recency ($B_{fresh} = +10$ pts):** Full logistical check conducted within past 30 days.

### Trust Degradation Penalties ($P$)
- **Active Contradiction Flag ($P_{contra} = -25$ pts):** An unverified conflict between traveler reports and recorded data (e.g. gate closed at 5pm instead of 6:30pm).
- **Staleness Decay ($P_{stale} = -15$ pts):** No verification logged for $>90$ days.
- **Severe Pricing Dispute ($P_{dispute} = -20$ pts):** Confirmed price variance $>25\%$ between published tariff and on-site charge.

---

## 2. Evidence Source Types & Hierarchy

When a claim is registered in `market_content_evidence`, its initial confidence is weighted by source authority:

| Source Type | Weight | Verification Protocol |
| :--- | :--- | :--- |
| **`GOVERNMENT_OFFICIAL`** | 1.00 | Formal notification order number, gazette link, signed circular. |
| **`FIELD_SURVEY`** | 0.90 | Geotagged surveyor photo log, receipt photo, timestamped GPS track. |
| **`LOCAL_OPERATOR`** | 0.85 | Registered MV3 guide/homestay owner confirmation via dashboard. |
| **`COMMUNITY_ELDER`** | 0.80 | Tribal council (Panchayat / Gaon Patel) verbal sign-off logged by surveyor. |
| **`SATELLITE_GIS`** | 0.75 | Satellite imagery verification of paved road access and clearing boundaries. |
| **`TRAVELER_REPORT`** | 0.50 | Crowdsourced observation requiring verifier review before state promotion. |

---

## 3. Contradiction Resolution Lifecycle

```
 Traveler Report / Surveyor Flag
              │
              ↓
    [CONTRADICTION_FLAGGED]
              │
    ┌─────────┴─────────┐
    ↓                   ↓
  Valid              Invalid
Discrepancy         Misunderstanding
    │                   │
    ↓                   ↓
Update Data      Dismiss Report
Status:          Status:
[VERIFIED]       [RESOLVED_REJECTED]
    │                   │
    └─────────┬─────────┘
              ↓
    Trust Score Recalculated
```

1. **Flag Ingestion:** If a user or surveyor reports an incongruous detail, `contradiction_flag` is set to `true`, instantly applying the $-25$ pt penalty.
2. **Review Window:** Content Verifiers (`CONTENT_VERIFIER` role) receive a priority queue alert.
3. **Audit Execution:** Verifier validates ground reality via direct phone check with forest post or registered operator.
4. **Resolution:** Either data is corrected and re-certified, or the report is dismissed with explanatory notes.
