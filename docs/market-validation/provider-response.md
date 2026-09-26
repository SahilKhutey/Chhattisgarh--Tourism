# Provider Responsiveness & SLA Validation

## 1. The Core Bottleneck: Supply Latency

Market validation demonstrates that traveler conversion drops exponentially when provider response time exceeds 2 hours:
- Inquiries answered in **< 15 minutes** convert at **4.2x** the rate of inquiries answered after 6 hours.
- Inquiries with zero response after 24 hours result in traveler churn and permanent negative brand perception of the destination.

Therefore, MV7 establishes programmatic tracking of provider responsiveness SLAs.

---

## 2. SLA Performance Buckets

Each response by a provider is automatically classified into one of five standard duration buckets:

| SLA Bucket | Duration Threshold | Experience Classification |
|------------|-------------------|----------------------------|
| `under_5m` | ≤ 300 seconds (5 min) | Instant Response (Highest Conversion) |
| `under_30m` | 301 - 1,800 seconds (30 min) | Fast Direct Response |
| `under_2h` | 1,801 - 7,200 seconds (2 hours) | Standard Commercial Response |
| `under_24h` | 7,201 - 86,400 seconds (24 hours) | Delayed / At-Risk Response |
| `over_24h` | > 86,400 seconds (> 24 hours) | SLA Breach / High Drop-off |

---

## 3. Response Actions & Workflow

Providers can respond with one of four structured actions:
1. `ACCEPT`: Provider confirms availability for requested dates and price.
2. `DECLINE`: Provider declines with mandatory explanation (`FULLY_BOOKED`, `DATES_CLOSED`, `PRICE_MISMATCH`, `NOT_AVAILABLE`).
3. `QUESTION`: Provider asks clarifying questions (group dynamics, arrival vehicle, food preferences).
4. `QUOTE`: Provider offers a custom package quote or revised pricing.

---

## 4. Impact on Provider Ranking

Under the MV7 validation architecture, providers with consistent `< 30m` response SLAs receive algorithmic boost in discovery placement, while unresponsive providers (> 24h) are temporarily hidden from instant contact to safeguard traveler trust.
