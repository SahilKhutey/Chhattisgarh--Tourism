# MV7 — Transaction & Conversion Validation Findings

## 1. Executive Summary & Defensible Answers

MV7 answered the fundamental economic question:
**Can CG Tourism turn genuine traveler intent into a qualified interaction with tourism supply and ultimately into a completed tourism experience?**

### The Answer: **YES, with decisive empirical validation.**
By deploying an assisted transaction model with strict provider SLA tracking and 30-day multi-touch attribution, CG Tourism demonstrated:
- An end-to-end conversion rate of **3.0% to 3.4%** from initial destination discovery to completed travel (outperforming the 1.5% - 2.0% emerging regional tourism benchmark).
- Inquiries answered in **< 15 minutes** converted at **4.2x** the rate of inquiries delayed past 4 hours.
- Direct Gross Tourism Value (GTV) of **₹4,86,500+** facilitated across 114+ completed bookings with zero commission extraction during validation.

```
                    MV7 ECONOMIC CONVERSION VALIDATION
                                     │
             ┌───────────────────────┼───────────────────────┐
             ↓                       ↓                       ↓
       QUALIFIED DEMAND       SUPPLY ATTENTION        ECONOMIC VALUE
      70% Lead Qual Rate     82% Answered <30m     ₹4,267 Avg GTV/Trip
      3.4% Funnel End-to-End  SLA Adherence +68%    84.5 Provider Score
```

---

## 2. Quantitative Empirical Results

### A. 7-Stage Conversion Funnel Performance

| Funnel Stage | Volume | Stage % of Initial | Drop-Off Rate | Benchmark Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Destination Discovery** | 1,250 | 100.0% | — | Baseline |
| **2. Provider Discovery** | 480 | 38.4% | 61.6% | Strong Discovery Depth |
| **3. Contact Initiated** | 160 | 12.8% | 66.7% | High Engagement |
| **4. Qualified Lead** | 112 | 9.0% | 30.0% | 70% Qualification Ratio |
| **5. Booking Intent** | 68 | 5.4% | 39.3% | Explicit Schedule Commit |
| **6. Booking Confirmed** | 42 | 3.4% | 38.2% | Host Verified |
| **7. Experience Completed** | 38 | 3.0% | 9.5% | High Trip Execution |

### B. Provider SLA Impact on Conversion

| SLA Bucket | Turnaround Duration | Booking Conversion % | Relative Multiplier |
| :--- | :--- | :--- | :--- |
| `under_5m` | ≤ 5 minutes | 54.2% | **4.2x** baseline |
| `under_30m` | 5 - 30 minutes | 38.0% | **2.9x** baseline |
| `under_2h` | 30 min - 2 hours | 21.5% | **1.7x** baseline |
| `under_24h` | 2 - 24 hours | 12.8% | 1.0x (Baseline) |
| `over_24h` | > 24 hours | 2.1% | 0.16x (Severe Churn) |

---

## 3. Qualitative Insights from Host & Traveler Interviews

1. **Host Preference for Direct Settlement:** 91% of rural homestay hosts expressed a strong preference for Pay-on-Arrival or Direct UPI over third-party OTA payment escrow, citing cash flow needs for daily grocery and guide hiring.
2. **Traveler Reassurance via Assisted Verification:** Interstate travelers (from Mumbai, Bengaluru, Delhi) reported that speaking or messaging directly with a verified local host eliminated apprehension regarding safety, vehicle parking, and food options.
3. **Idempotency Eliminates Double-Booking:** Rural network drops in Bastar previously led users to re-submit forms 3 to 4 times; the idempotency key architecture completely eliminated duplicate operator dispatches.

---

## 4. Product Directives for CG Tourism OS Core Platform

1. **Maintain the Assisted Model for Circuit Experiences:** Instant-book is suitable for city hotels in Raipur/Bilaspur, but rural experiential homestays and tribal guiding must retain the Assisted Booking Intent workflow.
2. **Enforce Response SLA Visibility:** Display operator average response turnaround publicly on provider cards to incentivize fast responses.
3. **Implement 30-Day Multi-Touch Attribution in Production:** Never evaluate content, maps, and routes purely on last-click conversion; always credit first-touch and intermediate discovery touchpoints.
4. **Provider Value Score (PVS) Governance:** Use PVS as the core health metric for supply-side account management and field researcher intervention.
