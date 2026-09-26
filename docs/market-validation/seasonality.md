# Tourism Seasonality & Cohort Normalization

## 1. The Seasonality Problem in Tourism Analytics

Analyzing cohorts without seasonality adjustments leads to invalid conclusions:
- Comparing a **June cohort** (peak summer, off-season in Central India) against an **October cohort** (Bastar Dussehra festival, peak season) could falsely suggest product degradation in June.

---

## 2. Chhattisgarh Seasonal Cycles & Adjustment Factors

| Season | Calendar Months | Regional Dynamics | Index Factor | Expected Trip-Cycle Retention |
|---|---|---|---|---|
| **Dussehra Festival** | Oct | 75-day World Famous Bastar Dussehra | **1.25x** | 34.0% |
| **Winter Peak** | Nov - Feb | Ideal climate, water levels clear, birding | **1.15x** | 29.0% |
| **Monsoon** | Jul - Sep | Full waterfall spouts (Chitrakote/Tirathgarh), lush forests | **0.90x** | 22.0% |
| **Summer** | Apr - Jun | Extreme heat, forest sanctuary restrictions | **0.75x** | 14.0% |

All cohort evaluations must report raw metrics alongside seasonality-adjusted indicators before claiming changes in product-market fit.
