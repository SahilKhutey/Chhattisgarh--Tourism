# UI/UX-1 — UX Foundation & Design Architecture

**Platform**: CG Tourism OS (`Unseen36Garh`)  
**Phase**: UI/UX Track — Phase 1  
**Status**: ACTIVE / HARDENED  
**Baseline**: v1.0.0-market-validation-final  

---

## 1. Executive Summary & Problem Framing

Chhattisgarh's tourism landscape is characterized by dense biodiversity corridors, living tribal cultures (Gond, Baiga, Abhujmaria, Dhurwa), ancient archaeological clusters (Sirpur, Bhoramdeo), and off-grid nature trails (Bastar, Surguja, Kanger Valley). 

Prior digital initiatives suffered from three systemic flaws:
1. **Generic Web Portal Syndrome**: Treating living tribal heritage and sacred landscapes like standard commodity hotel listings.
2. **Connectivity Fragility**: Assuming constant 4G/5G connections; breaking down entirely inside remote sanctuaries and forest corridors.
3. **Hardcoded UI Debt**: Frontends hardcoding views for each content type (`if place`, `if festival`), creating high maintenance friction when new tourism templates are published.

**UI/UX-1** establishes the foundational interaction architecture, behavioral contracts, accessibility baselines, and design-token systems that power the remaining 12 phases.

---

## 2. Core UX Principles

| # | Principle | Description & Architectural Mandate |
|---|---|---|
| **P1** | **Tribal Dignity & Authentic Narrative** | Content represents indigenous people and sacred spaces with cultural sovereignty, dignity, and historical fidelity. No sensationalism, orientalist caricature, or exploitative tourist-gaze framing. |
| **P2** | **Schema-Driven Determinism** | The UI never hardcodes presentation by entity type. Every page, section, and card is rendered dynamically from immutable JSON template schemas (`TemplateVersion`). |
| **P3** | **Geographic Synchronicity** | Maps and content lists are synchronized twins. Selecting an entity on the list centers the map; panning the map updates the active corridor viewport with zero disorienting layout shifts. |
| **P4** | **Low-Connectivity Resiliency** | Interfaces degrade gracefully across Fast $\rightarrow$ Slow $\rightarrow$ Intermittent $\rightarrow$ Full Offline states. Offline vector packs, cached guides, and queued interactions are first-class primitives. |
| **P5** | **Trilingual Parity** | English, Hindi, and Chhattisgarhi (`cg`) maintain complete semantic, informational, and visual equality. No language is treated as an afterthought or unstyled translation key. |
| **P6** | **Universal Accessibility (WCAG 2.1 AA)** | Complete keyboard traversability, semantic ARIA landmarks, $\ge 4.5:1$ contrast ratios, screen-reader audio descriptions, and reduced-motion fallbacks. |
| **P7** | **Zero-Friction Safety & Trust** | Verified local host certifications, road motorability indicators, weather alerts, and 1-tap Emergency SOS dispatcher accessible globally within $< 2$ seconds. |

---

## 3. Consumer Journey & Information Architecture (IA)

### 3.1 The 9-Stage Tourism Experience Funnel

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                CONSUMER EXPERIENCE FUNNEL                                │
├───────────┬──────────────┬──────────┬──────────┬────────────┬─────────┬──────┬────────┬──────┤
│ 1.Discover│ 2.Understand │ 3.Explore│ 4. Plan  │5.Experience│ 6.Share │7.Book│8.Safety│9.Home│
└─────┬─────┴──────┬───────┴────┬─────┴────┬─────┴─────┬──────┴────┬────┴──┬───┴───┬────┴──┬───┘
      │            │            │          │           │           │       │       │       │
      ▼            ▼            ▼          ▼           ▼           ▼       ▼       ▼       ▼
  Hero Corridors Culture &   Spatial    Interactive Field Mode  Creator Verified Real-time Retain
  & Visuals    Etiquette     GIS Map    Itinerary   Audio Guide & Stories Homestay SOS &   & Recall
               Guidelines    Layers     Optimizer   & Offline   Uploads Hosts   Alerts   Memories
```

### 3.2 Geographic & Spatial Taxonomy

Information in CG Tourism is organized hierarchically to reflect real-world travel mechanics:

$$\text{State (Chhattisgarh)} \longrightarrow \text{5 Divisions} \longrightarrow \text{33 Districts} \longrightarrow \text{Tourism Zones} \longrightarrow \text{Circuits / Corridors} \longrightarrow \text{Entities / Places}$$

1. **5 Administrative Divisions**: Bastar, Durg, Raipur, Bilaspur, Surguja.
2. **33 Districts**: Master boundary polygons and geo-indexes.
3. **Corridors & Circuits**:
   - *Bastar Cultural & Waterfall Circuit* (Jagdalpur $\leftrightarrow$ Chitrakote $\leftrightarrow$ Tirathgarh $\leftrightarrow$ Kanger Valley $\leftrightarrow$ Dantewada)
   - *Maikal Hills & Heritage Belt* (Bhoramdeo $\leftrightarrow$ Chilphi Ghati $\leftrightarrow$ Kawardha)
   - *Northern Tribal & Archaeological Loop* (Mainpat $\leftrightarrow$ Ramgarh Caves $\leftrightarrow$ Tatapani)
   - *Central Eco-Spiritual Corridor* (Raipur $\leftrightarrow$ Sirpur $\leftrightarrow$ Barnawapara $\leftrightarrow$ Rajim)

---

## 4. Navigation Architecture

### 4.1 Desktop Navigation Model
The Desktop Application Shell optimizes for spatial exploration, wide-screen GIS interaction, and multi-day itinerary building.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Unseen36Garh │ Discover  Explore  Plan  Circuits  Experiences │ [Search ⌘K] [EN|HI|CG] [SOS]│
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│                                    DYNAMIC PAGE VIEWPORT                                     │
│                                                                                              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ Footer: 33 District Directory │ Cultural Charter │ Safety Protocols │ Offline Sync Status   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Mobile Navigation Model
Mobile navigation is designed independently from desktop to accommodate field usage with one-handed thumb reachability:

```
┌──────────────────────────────────────────┐
│ [≡ Menu]  Unseen36Garh       [🚨 SOS]     │  <-- Persistent Top Bar
├──────────────────────────────────────────┤
│                                          │
│                                          │
│           FLUID MOBILE VIEWPORT          │
│                                          │
│                                          │
├──────────────────────────────────────────┤
│ [🏠 Home] [🧭 Explore] [🗺️ Map] [📋 Trips] [👤]│  <-- Thumb-Zone Bottom Dock
└──────────────────────────────────────────┘
```

- **Bottom Dock Targets**:
  - `Home`: Personalized recommendations, active corridor, weather alerts.
  - `Explore`: Multi-facet filters, categories (Waterfalls, Caves, Tribal Haats, Temples).
  - `Map`: Full-screen synchronized GIS viewer with current GPS location & offline vector tiles.
  - `Trips`: Saved places, active offline-cached itineraries, and day-by-day routes.
  - `Profile`: Language selection, offline cache management, booking passes, emergency contacts.
- **Top Quick Actions**:
  - `District Selector Slide-over`: Direct jump to any of the 33 districts.
  - `High-Priority SOS Trigger`: Direct instant access to emergency dispatcher.

---

## 5. Consumer Mental Model vs. System Architecture

| Dimension | Typical Consumer Thought Process | CG Tourism Architectural Resolution |
|---|---|---|
| **Corridors over Points** | *"I want to spend 3 days in Bastar seeing nature and crafts."* | Spatial Corridors group destinations by drivable transit chains with estimated route durations. |
| **Seasonal Viability** | *"Is Chitrakote waterfall full right now? Is it safe during monsoon?"* | Dynamic Seasonality Indicators with live stream levels and post-monsoon readiness tags. |
| **Cultural Etiquette** | *"Can I photograph the Madai mela? Do I need a permit for the tribal village?"* | Integrated Cultural Etiquette Badges and Community Consent notices embedded in template schemas. |
| **Connectivity Anxiety** | *"Will Google Maps work in Kanger Valley caves?"* | 1-Tap "Download Circuit Offline Pack" including vector maps, audio narratives, and emergency numbers. |

---

## 6. Page Hierarchy & Layout System

```
Hierarchy Structure
├── Level 0: Global Entry Hubs
│   ├── / (Home Corridor Gateway)
│   ├── /explore (Facet Filter Hub)
│   └── /map (Unified Spatial GIS Canvas)
├── Level 1: Regional & Corridor Portals
│   ├── /districts/[slug] (District Hub with 33 district boundaries)
│   └── /circuits/[slug] (Curated Multi-Day Routes)
├── Level 2: Dynamic Template Content Portals (Schema-Driven)
│   ├── /destinations/[slug]
│   ├── /attractions/[slug]
│   ├── /festivals/[slug]
│   └── /folklore/[slug]
└── Level 3: Transactional & Execution Surfaces
    ├── /planner (Drag-and-drop itinerary optimizer)
    ├── /bookings/[id] (Homestay and guide reservations)
    └── /sos (Offline-capable emergency beacon)
```

---

## 7. Responsive Strategy

### 7.1 Breakpoint System
- `xs`: `< 480px` — Ultra-compact field devices / entry-level smartphones.
- `sm`: `480px - 640px` — Standard mobile portrait.
- `md`: `768px - 1023px` — Tablet portrait & foldable split-screens.
- `lg`: `1024px - 1279px` — Tablet landscape & standard laptops.
- `xl`: `1280px - 1535px` — High-resolution desktop monitors.
- `2xl`: `≥ 1536px` — Ultra-wide displays & command-center GIS views.

### 7.2 Touch Target Policy
- All interactive controls (buttons, links, map markers, drawer toggles) enforce a minimum touch bounding box of **$44 \times 44\text{ px}$** (WCAG 2.1 Criterion 2.5.5).
- Spacing between adjacent touch targets $\ge 8\text{ px}$ to eliminate accidental triggers while in transit.

---

## 8. Accessibility Baseline (WCAG 2.1 AA)

### 8.1 Mathematical Contrast Formula
Contrast ratio is computed via relative luminance:
$$L = 0.2126 \cdot R' + 0.7152 \cdot G' + 0.0722 \cdot B'$$
$$\text{Contrast Ratio} = \frac{L_{\text{lighter}} + 0.05}{L_{\text{darker}} + 0.05}$$

- **Normal Text ($< 18\text{ pt}$)**: Minimum ratio $\mathbf{4.5:1}$ (Level AA).
- **Large Text ($\ge 18\text{ pt}$ or $\ge 14\text{ pt}$ bold)**: Minimum ratio $\mathbf{3.0:1}$ (Level AA).
- **UI Components & Graphical Objects**: Minimum ratio $\mathbf{3.0:1}$ (Level AA).

### 8.2 Focus & Navigational Traversal
- Distinct focus rings with high contrast: `2px solid var(--color-forest-emerald)` with `2px offset`.
- Skip-to-content links bypass repeated headers directly to `#main-content`.
- Modal and drawer dialogs implement strict keyboard focus trapping (`Tab` / `Shift+Tab`) and close on `Escape`.

---

## 9. State Lifecycle Architecture

Every UI surface implements a strict 5-stage lifecycle contract:

```
                  ┌──────────────┐
                  │   INITIAL    │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   LOADING    │ ◄── Skeleton Layouts (Zero CLS)
                  └──────┬───────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  ┌──────────────┐┌──────────────┐┌──────────────┐
  │    EMPTY     ││    ERROR     ││    READY     │
  │ Contextual   ││ Offline Retry││ Synchronized │
  │ Alternatives ││ & Safe State ││ Interactive  │
  └──────────────┘└──────────────┘└──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ OFFLINE_SYNC │
                                  │ Cached Data  │
                                  │ Active Banner│
                                  └──────────────┘
```

1. **`LOADING`**: Skeletons match exact content layout dimensions, eliminating layout shifts ($CLS < 0.05$).
2. **`READY`**: Complete presentation with rich interactive elements.
3. **`EMPTY`**: Explains why zero results match and provides one-click alternative recovery (e.g. *"Broaden search to neighboring Bastar district"*).
4. **`ERROR`**: User-friendly explanation with offline cached fallback button and technical error correlation ID (`X-Request-ID`).
5. **`OFFLINE_SYNCING`**: Informs user they are viewing cached field data and queues actions for background sync upon network reconnection.

---

## 10. Design-Token Architecture

The design tokens are codified into TypeScript definitions located at [`apps/web/src/lib/tokens/`](file:///c:/Users/ASUS/Documents/Unseen36Garh/Chhattisgarh--Tourism/apps/web/src/lib/tokens/):

- **Palette**: Inspired by the living geography and craft of Chhattisgarh:
  - *Bastar Forest Emerald* (`#0A3622`): Primary brand, authority, lush Sal vegetation.
  - *Tribal Terracotta* (`#B25329`): Secondary brand, warm earth, traditional craft.
  - *River Blue* (`#1A5E7A`): Accent, Mahanadi and Indravati waters, waterfalls.
  - *Sand Beige* (`#F4EBE1`): Warm background, natural paper, reduced glare in sunlight.
  - *Charcoal Stone* (`#1E2229`): High-contrast typography, readability.
  - *Bell Metal Gold* (`#D4A373`): Dhokra craft highlight, premium verified badge.
  - *Emergency Crimson* (`#D32F2F`): High-priority safety, SOS beacon.
- **Typography Scale**: Modular scale based on $1.25$ ratio ($12, 14, 16, 20, 24, 30, 36, 48\text{ px}$). Supports Latin and Devanagari Unicode scripts.
- **Spacing**: Rigid $4\text{px}$ base rhythm ($4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128\text{ px}$).
- **Elevation**: 4 levels of soft organic shadow with subtle warm ambient occlusion.
- **Motion**: Standardized transition curves with automatic `prefers-reduced-motion` suppression.
