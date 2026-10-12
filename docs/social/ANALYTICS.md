# Social Engine — Analytics & Telemetry

## 1. Interaction Event Model

The Social Engine captures privacy-compliant consumer interaction telemetry to measure content effectiveness and destination interest without invasive tracking.

```
┌─────────────────────────┬────────────────────────────────────────────────────────┐
│ Event Name              │ Trigger Condition                                      │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ social_feed_view        │ Feed page rendered (with format tab, filter context)   │
│ social_card_click       │ User clicks card thumbnail/preview                     │
│ social_creator_open     │ User opens creator profile link                        │
│ social_place_click      │ User navigates to place destination hub                │
│ social_destination_click│ User clicks "Plan Visit to Place" or map link          │
│ social_trip_add         │ User clicks "Add to Trip" CTA                          │
│ social_source_click     │ User clicks "Watch on YouTube" or "View on Instagram"  │
│ social_filter_change    │ User toggles format tabs (all, reels, videos, etc.)    │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Privacy & Compliance

- **No Third-Party Tracker Injection**: The frontend does not load invasive third-party tracking scripts (Meta Pixel, Google conversion tags) in the discovery feed.
- **Aggregated Attribution**: Telemetry data is aggregated into anonymous performance counters to identify trending destinations and high-impact regional creators.
- **Backend Metric Counter Updates**: Engagement increments are executed asynchronously to maintain sub-50ms feed rendering latency.
