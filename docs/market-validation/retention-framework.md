# Consumer Retention Framework & Meaningful Activity

## 1. Principles of Episodic Retention

Unlike social media or daily productivity tools, leisure travel is practiced 1 to 4 times annually by urban Indian professionals. Measuring continuous daily active usage introduces false churn signals.

In CG Tourism OS:
- **Diagnostic Digital Retention (D1, D7, D30)**: Monitored strictly to diagnose session stickiness and usability during active trip planning windows.
- **Trip-Cycle Retention**: Evaluates whether a traveler who finished one complete tourism journey returns to execute another meaningful tourism task.

---

## 2. Meaningful Activity Taxonomy

| Action Category | Action Name | System Impact |
|---|---|---|
| `DESTINATION_DISCOVERY` | Explores verified fact sheet | Transition to `DISCOVERED` |
| `DESTINATION_SAVE` | Adds place to wishlist/saved | Transition to `ENGAGED` |
| `TRIP_CREATION` | Initializes multi-day itinerary | Transition to `PLANNING` |
| `ITINERARY_CREATION` | Sequences attractions & routes | Transition to `PLANNING` |
| `PROVIDER_INQUIRY` | Dispatches lead to host | Recorded in lead pipeline |
| `BOOKING` | Submits express booking intent | Transition to `BOOKED` |
| `REVIEW` | Submits post-trip verified rating | Transition to `POST_TRIP` |
| `TRIP_SHARE` | Generates referral link | Increments viral share count |
| `NEW_DESTINATION_DISCOVERY` | Explores next region post-trip | Transition to `RETURNED` |

---

## 3. Retention Failure Taxonomy

When travelers do not return, reasons are classified to distinguish product failures from natural travel seasonality:

- `USER_COMPLETED_NEED`: Traveler had one trip planned and no upcoming vacation (Normal Behavior).
- `SEASONALITY`: Off-season weather (e.g. peak summer heat in May/June).
- `NO_RELEVANT_DESTINATION`: Traveled to Bastar; lack of curated routes in Northern Surguja.
- `CONTENT_GAP`: Missing practical logistics for secondary destinations.
- `TRUST_ISSUE`: Inaccurate gate timings or unverified photos.
- `BOOKING_FAILURE`: Provider declined or was unresponsive.
- `LOW_REGIONAL_COVERAGE`: Insufficient vetted homestay supply in destination zone.
