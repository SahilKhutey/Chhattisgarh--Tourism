# Social Engine — Deep Tourism Graph & Planning Integration

## 1. Discovery-to-Tourism Conversion Loop

The core rationale of the Social Engine within the CG Tourism OS is driving real-world tourism conversions from organic social narratives:

```
                  SOCIAL CONTENT
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
  CREATOR             PLACE           DISTRICT
(Narrative)       (Destination)      (Regional)
       │                │                │
       └────────────────┼────────────────┘
                        ▼
                DESTINATION HUB
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
INTERACTIVE MAP    EXPERIENCE      ITINERARY PLANNER
(/map?place=...)  (Eco/Heritage)   (/plan?place=...)
       │                │                │
       └────────────────┼────────────────┘
                        ▼
               REAL-WORLD TOURISM
```

---

## 2. Tourism Graph Entity Relationships

Each `SocialContent` record links into the official Tourism Entity Graph:
- **`district_id`**: Links into the district hub (e.g. `/districts/bastar`, `/districts/surguja`).
- **`place_slug`**: Links into the destination page (e.g. `/places/chitrakote-falls`, `/places/teerathgarh-falls`).
- **`tourism_zone_id`**: Circuit grouping (e.g., `bastar-circuit`, `northern-highlands`).
- **`route_id`**: Scenic road trip route (e.g., `jagdalpur-waterfalls-trail`).
- **`experience_id`**: Specific cultural activity (e.g., `dhokra-casting-workshop`).

---

## 3. "Add to Trip" Action Flow

When a traveler discovers an inspiring place through a reel or video:
1. The user clicks **"Add to Trip"** on the card or in the lightbox.
2. The frontend calls the backend context endpoint:
   `POST /social/content/{id}/add-to-trip`
3. The content's `trip_adds_count` engagement metric increments.
4. The traveler is redirected to the itinerary planner (`/plan?place=<place_slug>`), pre-populating their route with the authentic location.
