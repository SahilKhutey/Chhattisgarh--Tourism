# MV5 — Discovery Funnel & Attribution Architecture

Discovery in CG Tourism OS is defined as *the transition from passive awareness to actionable travel planning*.

---

## 1. Funnel Stages & Baseline Metrics

Based on the initial pilot cohort (48 curated destinations across Bastar and Surguja):

```
Step 1: Content Impression        42,000  (100.0%)
           │
           │ 40.0% conversion
           ↓
Step 2: Content Open / View       16,800  ( 40.0%)
           │
           │ 55.0% conversion
           ↓
Step 3: Engaged Read (≥45s)        9,240  ( 22.0%)
           │
           │ 50.0% conversion
           ↓
Step 4: Save / Bookmark            4,620  ( 11.0%)
           │
           │ 70.0% conversion
           ↓
Step 5: Second Destination View    3,234  (  7.7%)
           │
           │ 50.0% conversion
           ↓
Step 6: Itinerary Draft Start      1,617  (  3.8%)
           │
           │ 30.0% conversion
           ↓
Step 7: Provider Inquiry Sent        485  (  1.2%)
```

---

## 2. Discovery Source Attribution Matrix

Every discovery event logs its ingress channel (`discovery_source`):

| Discovery Channel | Share of Opens | Engaged Read % | Planning Activation Rate |
| :--- | :--- | :--- | :--- |
| **`THEMATIC_SEARCH`** | 38.5% | 62.0% | **24.5%** |
| **`GEOGRAPHIC_CLUSTER`** | 24.2% | 58.0% | **22.0%** |
| **`ROUTE_CORRIDOR`** | 16.8% | 54.0% | **19.8%** |
| **`SERENDIPITY_FEED`** | 12.0% | 41.0% | **11.2%** |
| **`DIRECT_BROWSE`** | 8.5% | 38.0% | **8.5%** |

### Key Insight
- **Thematic Search** ("waterfalls for family in monsoon") and **Geographic Clusters** ("attractions within 30km of Jagdalpur") generate the highest planning activation rate ($>22\%$), while generic homepage browsing converts at less than $9\%$.

---

## 3. The Discovery Score Formula ($S_{disc} \in [0, 100]$)

For each destination fact sheet:

$$S_{disc} = 0.20 \times \text{OpenRate} + 0.25 \times \text{EngagedRate} + 0.20 \times \text{SaveRate} + 0.20 \times \text{SecondDestRate} + 0.15 \times \text{ItineraryRate}$$

Content scoring above **75.0** demonstrates confirmed product-market fit in facilitating independent traveler decision-making.
