# Multi-Touch Attribution & 30-Day Window Protocol

## 1. Objective of Tourism Attribution

Travel planning for experiential regional tourism is rarely an impulsive single-session event. A traveler may:
1. Discover an unheralded waterfall via an interactive regional map (Day 1).
2. Read a verified local culture guide about tribal weekly haats (Day 4).
3. Browse a 4-day Jagdalpur-Kanger Valley curated route (Day 9).
4. Return via search and submit an assisted booking intent to a local homestay (Day 16).
5. Complete the trip (Day 25).

Without attribution, the destination guide, map, and route systems appear unproductive, while search takes all credit.

---

## 2. Multi-Touch Attribution Model

MV7 supports touchpoint recording across:
- `first_touch_source`: The original channel that introduced the traveler to the platform.
- `last_touch_source`: The channel immediately preceding the booking intent.
- `assisting_sources`: All intermediate content, route, map, and creator touchpoints.

### Standard Touchpoint Channels
- `SEARCH`: Platform global search.
- `DESTINATION`: Destination profile pages.
- `MAP`: Interactive GIS map exploration.
- `NEARBY`: Nearby place discovery recommendations.
- `EXPERIENCE`: Experiential listing view.
- `CREATOR`: Creator trail / travelogue.
- `ROUTE`: Curated multi-day route.
- `RECOMMENDATION`: Personalized recommendation cards.
- `DIRECT`: Direct bookmark or link.

---

## 3. Attribution Time Window

- **Standard Window**: **30 Days** (`attribution_window_days = 30`).
- Any booking intent or completed transaction occurring within 30 days of initial discovery touchpoint is credited to the originating content and discovery surfaces.
- Inactive interactions older than 30 days are categorized as `UNATTRIBUTED_ORGANIC`.
