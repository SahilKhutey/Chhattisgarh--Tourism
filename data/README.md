# Chhattisgarh Tourism Data Catalog & Schemas

Welcome to the central data repository for the **CG Tourism Platform**. This directory contains canonical datasets, administrative geospatial boundaries, dynamic template schemas, and seeding manifests for the state of Chhattisgarh.

---

## 📁 Directory Structure

```text
data/
├── README.md                  # Central data catalog and documentation (this file)
├── destinations/              # Master destination records and curated points of interest
│   ├── master_destinations.json  # Comprehensive state-wide tourism destinations (180+ KB)
│   └── 100_destinations.json     # Top 100 curated priority tourism sites
├── geo/                       # Geospatial definitions & administrative boundaries
│   ├── districts.json            # 33 administrative districts with centroids and metadata
│   ├── district-boundaries.json  # Polygon GeoJSON boundaries for map rendering
│   ├── divisions.json            # 5 revenue divisions (Bastar, Bilaspur, Durg, Raipur, Surguja)
│   └── tourism-zones.json        # Categorized regional tourism circuits & eco-corridors
└── templates/                 # Production JSON schema definitions for dynamic content
    ├── destination.json          # Schema for natural & heritage destinations
    ├── event.json                # Schema for cultural festivals and ceremonies
    ├── attraction.json           # Schema for monuments, sanctuaries, and viewpoints
    └── folklore.json             # Schema for indigenous narratives and oral histories
```

---

## 🗺️ Geospatial Standards

- **Coordinate Reference System (CRS)**: WGS 84 (`EPSG:4326`)
- **Format**: Decimal degrees with minimum 4 decimal place precision (`latitude`, `longitude`).
- **Administrative Hierarchy**:
  1. **State**: Chhattisgarh (`CG`)
  2. **Divisions (5)**:
     - **Bastar Division**: Bastar, Dantewada, Kanker, Kondagaon, Narayanpur, Sukma, Bijapur.
     - **Bilaspur Division**: Bilaspur, Korba, Janjgir-Champa, Raigarh, Mungeli, Gaurela-Pendra-Marwahi, Sakti.
     - **Durg Division**: Durg, Rajnandgaon, Balod, Bemetara, Kabirdham (Kawardha), Mohla-Manpur-Ambagarh Chowki, Khairagarh-Chhuikhadan-Gandai.
     - **Raipur Division**: Raipur, Gariaband, Dhamtari, Mahasamund, Baloda Bazar-Bhatapara.
     - **Surguja Division**: Surguja (Ambikapur), Surajpur, Balrampur-Ramanujganj, Koriya, Manendragarh-Chirmiri-Bharatpur, Jashpur.

---

## 📑 Dynamic Schema Templates

The platform uses an immutable, versioned template engine (`P1–P4`). The canonical schemas in `data/templates/` define the field-level contracts:

| Template | Slug | Category | Key Translatable Fields | Primary Attributes |
| :--- | :--- | :--- | :--- | :--- |
| **Destination** | `destination` | `destinations` | `name`, `description` | `district`, `location` (lat/lng), `tags`, `hero_image` |
| **Event & Festival** | `event` | `events` | `name`, `description` | `district`, `start_date`, `end_date`, `tags` |
| **Attraction** | `attraction` | `attractions` | `name`, `description` | `district`, `category`, `tags` |
| **Folklore** | `folklore` | `folklore` | `title`, `story` | `tribe`, `district`, `audio_url`, `tags` |

---

## 🌐 Multilingual & Localization Standards

All user-facing content entries support tri-lingual localization conforming to ISO 639 codes:
- `en`: English (Standard International)
- `hi`: Hindi (Devanagari script)
- `cg`: Chhattisgarhi (Local regional language, Devanagari script)

Content publication mandates strict completeness gates: content cannot enter `PUBLISHED` state unless all translatable fields have valid translations or verified glossary fallbacks.

---

## 🚀 Ingestion & Seeding Workflows

### 1. Python API Ingestion (`scripts/seed.py`)
Populates the dynamic schema templates, active versions, and 14 realistic multilingual content items (Chitrakote, Tirathgarh, Bastar Dussehra, Bhoramdeo, Sirpur, Madku Dweep, Mainpat, etc.) through transactional outbox publishing:
```bash
python scripts/seed.py
```

### 2. Prisma Database Seed (`apps/backend/prisma/seed.ts`)
Hydrates historical Prisma database models with geospatial polygons and places:
```bash
pnpm --filter backend prisma db seed
```

---

## 🔒 Data Governance & Validation Rules

1. **Latitude/Longitude Range**:
   - Latitude: Between `17.70° N` and `24.10° N`
   - Longitude: Between `80.20° E` and `84.40° E`
2. **Slug Uniqueness**: Slugs must be URL-safe lowercase kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
3. **Immutability**: Once a template version is published, it cannot be modified. Field changes necessitate a new semantic version (e.g., `1.0.0` → `1.1.0`).
