# MV5 — Content Taxonomy & Schema Specification

CG Tourism OS rejects unstructured blog publishing in favor of a strictly typed, relational, and validated JSON schema.

---

## 1. Content Categories
Every content entry belongs to one of seven canonical tourism categories:

1. **`ATTRACTION`**: Natural wonders, waterfalls, caves, historical monuments, temples.
2. **`CIRCUIT_GUIDE`**: Multi-destination half-day or full-day sequenced routes.
3. **`CULTURE_HERITAGE`**: Tribal craft traditions (Dhokra bell metal, terracotta), festivals (Bastar Dussehra, Madai), sacred groves.
4. **`PRACTICAL_LOGISTICS`**: Transit hubs, permits, seasonal advisory notices, connectivity maps.
5. **`CULINARY_LOCAL`**: Indigenous food, millets (Kodo-Kutki), regional specialties, tribal Haat cuisine.
6. **`STAY_EXPERIENCE`**: Verified eco-resorts, homestays, forest rest houses, campsite rules.
7. **`COMMUNITY_CUSTOM`**: Village codes of conduct, artisan cooperatives, local guides directory.

---

## 2. Canonical JSON Fact Sheet Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CGTourismContentFactSheet",
  "type": "object",
  "required": ["quick_facts", "logistics", "seasonality", "safety"],
  "properties": {
    "quick_facts": {
      "type": "object",
      "required": ["timings", "entry_fee", "ideal_duration", "nearest_transit_hub"],
      "properties": {
        "timings": { "type": "string" },
        "entry_fee": { "type": "string" },
        "ideal_duration": { "type": "string" },
        "nearest_transit_hub": { "type": "string" },
        "wheelchair_accessible": { "type": "boolean" },
        "cellular_coverage": {
          "type": "object",
          "properties": {
            "jio": { "type": "string", "enum": ["STRONG", "MODERATE", "WEAK", "NONE"] },
            "airtel": { "type": "string", "enum": ["STRONG", "MODERATE", "WEAK", "NONE"] },
            "bsnl": { "type": "string", "enum": ["STRONG", "MODERATE", "WEAK", "NONE"] }
          }
        }
      }
    },
    "logistics": {
      "type": "object",
      "required": ["road_type", "parking_available", "last_mile_access"],
      "properties": {
        "road_type": { "type": "string" },
        "parking_available": { "type": "boolean" },
        "parking_fee": { "type": "string" },
        "last_mile_access": { "type": "string" },
        "guide_required": { "type": "boolean" },
        "guide_rate_standard": { "type": "string" }
      }
    },
    "seasonality": {
      "type": "object",
      "required": ["best_months", "monsoon_behavior"],
      "properties": {
        "best_months": { "type": "array", "items": { "type": "string" } },
        "peak_season": { "type": "string" },
        "monsoon_behavior": { "type": "string" },
        "current_water_status": { "type": "string" }
      }
    },
    "safety": {
      "type": "object",
      "required": ["swimming_permitted", "cliff_barriers", "emergency_contact"],
      "properties": {
        "swimming_permitted": { "type": "boolean" },
        "cliff_barriers": { "type": "boolean" },
        "emergency_contact": { "type": "string" },
        "nearest_hospital_km": { "type": "number" }
      }
    },
    "cultural_guidelines": {
      "type": "object",
      "properties": {
        "sacred_etiquette": { "type": "string" },
        "photography_restrictions": { "type": "string" },
        "local_artisan_hub": { "type": "string" }
      }
    }
  }
}
```

---

## 3. Curated Content Cohorts

Content entries are evaluated in targeted geographic cohorts rather than bulk dumps:

- **`BASTAR_CIRCUIT` (Anchor Cohort):** Chitrakote, Tirathgarh, Kotumsar Cave, Danteshwari, Tokapal Haat, Dandami Resort.
- **`SURGUJA_NORTH`:** Mainpat High Plateau, Tiger Point, Jaljali, Fish Point, Maheshpur Archaeological Site.
- **`RAIPUR_URBAN`:** Purkhouti Muktangan, Marine Drive, Mahant Ghasidas Memorial Museum, Nandanvan Jungle Safari.
- **`BILASPUR_HERITAGE`:** Ratanpur Mahamaya Temple, Malhar Excavations, Tala Deorani-Jethani Temples, Achanakmar Tiger Reserve buffer.
