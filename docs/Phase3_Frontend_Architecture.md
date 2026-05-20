# CG Tourism Platform — Phase 3: Frontend Architecture

## Next.js App Router — Page Structure & Component Design System

---

## 1. Route Map

```
apps/web/src/app/
├── layout.tsx           ← Root layout (sticky nav + footer, mobile drawer)
├── page.tsx             ← Landing page (hero + feature cards + CTA)
├── globals.css          ← Design tokens, Tailwind theme, CSS animations
├── metadata.ts          ← SEO metadata (server-safe, separated from client layout)
│
├── explore/page.tsx     ← Interactive Chhattisgarh SVG map + smart filters
├── destination/[id]/    ← Dynamic destination detail pages (SSG-ready)
│   └── page.tsx
├── planner/page.tsx     ← AI heuristic itinerary generator (multi-day)
├── stories/page.tsx     ← Folklore & oral legend narrative archive
├── bookmarks/page.tsx   ← Trip collection folders + offline sync
├── creator/page.tsx     ← Verified contributor studio (place submission)
├── admin/page.tsx       ← Governance control desk (charts, moderation)
└── sos/page.tsx         ← Offline emergency SOS cockpit
```

---

## 2. Design System Tokens (`globals.css`)

| Token | CSS Variable | Hex Value | Usage |
|-------|-------------|-----------|-------|
| Forest Emerald | `--color-forest-emerald` | `#0A3622` | Primary brand, CTAs, headers |
| Tribal Terracotta | `--color-tribal-terracotta` | `#B25329` | Accents, emergency, SOS |
| River Blue | `--color-river-blue` | `#1A5E7A` | Map layer, data overlays |
| Sand Beige | `--color-sand-beige` | `#F4EBE1` | Backgrounds, button text |
| Warm Orange | `--color-warm-orange` | `#E67E22` | Highlights, hover states |
| Charcoal Stone | `--color-charcoal-stone` | `#1E2229` | Body text |

### Typography
- **Display / Headers:** `font-sans` → Geist Sans (variable) → Inter fallback
- **Code / Labels:** `font-mono` → Geist Mono
- **Scale:** Tailwind's responsive text utilities (`text-xs` → `text-5xl`)

### Glass Morphism Utility
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
```

---

## 3. Data Layer

### `apps/web/src/app/data/`

| File | Purpose |
|------|---------|
| `destinations.ts` | Static mock dataset (8 curated destinations with full metadata) |
| `places-api.ts` | Async API client with NestJS backend integration + local fallback |

### `places-api.ts` Architecture
```
fetchAllPlaces()    →  GET /api/v1/places
                    →  fallback: DESTINATIONS static array
fetchPlaceBySlug()  →  GET /api/v1/places/:slug
                    →  fallback: DESTINATIONS.find()
fetchNearbyPlaces() →  GET /api/v1/places/nearby
                    →  fallback: Haversine distance calculation in-browser
```

All API calls use **graceful degradation** — if the backend is unavailable, the frontend automatically falls back to the curated static data, ensuring the platform works offline or without a running database.

---

## 4. Page Architecture Details

### `/explore` — Interactive Map Dashboard
- **Left panel:** Search + category filters + smart experience dropdowns + destination list
- **Right panel:** SVG-drawn Chhattisgarh state shape with clickable coordinate pins
- **Layer system:** 4 overlays (Tourism, Eco, Safety, Cultural) change pin colors + legend info
- **Creator integration:** Approved creator submissions from `localStorage` auto-appear on map

### `/planner` — AI Itinerary Engine
- **Input wizard:** 4-step form (days, theme, budget, transport)
- **Generation engine:** Heuristic algorithm filters destinations by theme, cycles through matches, generates per-day schedules with timing, eco tips, and photography advice
- **Output panel:** Day-by-day timeline view + responsible travel score + carbon offset metrics

### `/admin` — Governance Control Desk
- **Tab 1:** 12-month traffic forecasting with Recharts AreaChart + revenue BarChart
- **Tab 2:** Ecological carrying capacity visualization per location (bar chart + alert cards)
- **Tab 3:** Guide & homestay compliance registry (table with approve/reject controls)
- **Tab 4:** Creator contribution moderation backlog (from `localStorage:cg_pending_places`)

### `/creator` — Verified Contributor Studio
- **Step 1:** Social credential verification with animated progress bar
- **Step 2:** Full place submission form (name, district, coordinates, story, safety, gear, lore)
- **Submission:** Writes to `localStorage:cg_pending_places` → Admin tab 4 reads and moderates

### `/sos` — Emergency Cockpit
- **SOS trigger:** Giant physical-style toggle button with animated dispatch confirmation
- **Women Safety:** Trusted corridor config + sync button
- **Right panel:** District-filtered helplines (Bastar/Raipur/Bilaspur) + live disaster bulletins

---

## 5. Offline Strategy

| Feature | Implementation |
|---------|---------------|
| Creator submissions | `localStorage:cg_pending_places` |
| Approved places | `localStorage:cg_approved_places` |
| Trip collections | `localStorage:cg_saved_collections` |
| Offline sync status | `localStorage:cg_synced_collections` |
| API fallback | Static `DESTINATIONS` array (all 8 destinations pre-loaded) |

> **Phase 4 Upgrade:** Replace `localStorage` with IndexedDB + Service Worker for true offline-first PWA behaviour.

---

## 6. Build Commands

```bash
# Development (hot reload both frontend + backend)
pnpm dev

# Production build verification
pnpm --filter web build

# Type check only
pnpm --filter web exec tsc --noEmit

# Run all backend unit tests
pnpm test
```

---

## 7. Environment Variables (Frontend)

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SITE_NAME="CG Tourism OS"
NEXT_PUBLIC_MAP_STYLE=terrain
```
