# CG Tourism Platform — Phase 5: AI Tourism Intelligence System
## AI Recommendation Engines, Semantic Vector Search, and Moderation Pipelines

---

## 1. System Vision & AI Stack

Phase 5 introduces advanced cognitive computing layers to transform the CG Tourism Platform into an active travel intelligence system. By combining neural vector search engines with local respect and safety classification grids, the system offers personalized itineraries while safeguarding tribal heritage and natural ecosystems.

### COGNITIVE STACK SPECIFICATION
- **Vector Embeddings Model:** `text-embedding-3-small` (for high-density semantic tourism search).
- **Inference Engine:** Google Gemini Pro / Flash (for automated multilingual translation and storytelling enrichment).
- **Vector Database Vector store:** PostgreSQL `pgvector` extension (native indices on `Place` and `Lore` collections).
- **Recommendation Orchestration:** Python FastAPI Microservice executing collaborative tensor operations.

---

## 2. Dynamic Itinerary Generation Architecture (`ItineraryEngine.py`)

A pythonic smart algorithm generating structured travel routes optimized for travel seasons and ecological carry constraints:

```python
import math
from typing import List, Dict, Any

class ItineraryEngine:
    def __init__(self, database_connection):
        self.db = database_connection

    def generate_eco_itinerary(
        self, 
        district: str, 
        duration_days: int, 
        pace: str = "moderate"
    ) -> List[Dict[str, Any]]:
        """
        Generates a custom travel plan that respects district ecological bounds.
        Pace maps to the maximum distance traveled per day:
        - slow: 30km max
        - moderate: 70km max
        - active: 150km max
        """
        # 1. Fetch verified places in the targeted district
        places = self.db.query_verified_places(district=district)
        
        # 2. Group places by ecological limits (filter out spots nearing carrying capacity)
        safe_places = [
            p for p in places 
            if p.current_tourist_load < p.max_ecological_carrying_capacity
        ]

        if not safe_places:
            return []

        # 3. Sort by priority score (rating / distance)
        safe_places.sort(key=lambda x: x.rating, reverse=True)

        itinerary = []
        visited = set()
        current_coordinates = (21.2787, 81.8661)  # Default coordinates start at Raipur capital

        for day in range(1, duration_days + 1):
            day_stops = []
            max_daily_distance = 30.0 if pace == "slow" else (70.0 if pace == "moderate" else 150.0)
            daily_travel_km = 0.0

            while daily_travel_km < max_daily_distance and len(day_stops) < 3:
                # Find the nearest unvisited place
                next_place = self._find_nearest_unvisited(
                    current_coordinates, safe_places, visited
                )
                
                if not next_place:
                    break

                dist = self._calculate_distance(
                    current_coordinates[0], current_coordinates[1],
                    next_place.latitude, next_place.longitude
                )

                if daily_travel_km + dist > max_daily_distance:
                    break

                visited.add(next_place.id)
                day_stops.append({
                    "name": next_place.name,
                    "slug": next_place.slug,
                    "coordinates": {"lat": next_place.latitude, "lng": next_place.longitude},
                    "best_season_info": next_place.best_season,
                    "safety_rules": next_place.rules
                })
                
                daily_travel_km += dist
                current_coordinates = (next_place.latitude, next_place.longitude)

            itinerary.append({
                "day": day,
                "stops": day_stops,
                "distance_traveled_km": round(daily_travel_km, 2)
            })

        return itinerary

    def _find_nearest_unvisited(self, current, places, visited):
        nearest = None
        min_dist = float('inf')
        for p in places:
            if p.id in visited:
                continue
            dist = self._calculate_distance(current[0], current[1], p.latitude, p.longitude)
            if dist < min_dist:
                min_dist = dist
                nearest = p
        return nearest

    def _calculate_distance(self, lat1, lon1, lat2, lon2) -> float:
        R = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2) ** 2 + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(d_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
```

---

## 3. Semantic Tourism Search API Endpoint Structure

To handle conversational natural language queries (e.g. *"quiet cascading waterfalls near Jagdalpur with easy walking trails"*), we perform cosine similarity calculations on vector columns:

```typescript
// NestJS semantic search controller endpoint
@Post('semantic-search')
@ApiOperation({ summary: 'Semantic search on regional legends and destinations' })
async semanticSearch(@Body() body: { query: string; limit?: number }) {
  const limit = body.limit || 5;

  // 1. Generate text embeddings using Gemini/OpenAI
  const embedding = await this.aiService.generateEmbedding(body.query);
  const embeddingString = `[${embedding.join(',')}]`;

  // 2. Perform Cosine Similarity query via pgvector inside Prisma queryRaw
  const matches: any[] = await this.prisma.$queryRaw`
    SELECT 
      p.id, p.name, p.slug, p.description, p.district, p."heroImage",
      1 - (p.embedding <=> ${embeddingString}::vector) AS similarity_score
    FROM "Place" p
    WHERE p.verified = true
    ORDER BY similarity_score DESC
    LIMIT ${limit};
  `;

  return matches.filter(match => match.similarity_score > 0.72); // Confidence threshold
}
```

---

## 4. Automatic AI Story & Safety Moderation Flow

Every contributor upload passes through automated text classification models to flag disrespectful tribal narratives or unsafe coordinates references:

```
 [ Creator Contribution ] ──► [ LLM Moderation Filter ]
                                      │
       ┌──────────────────────────────┴──────────────────────────────┐
       ▼ (Passes Sensitivity Tests)                                   ▼ (Flags Found)
 [ Backlog Queue (verified: false) ]                           [ Auto Reject Feedbacks ]
```
