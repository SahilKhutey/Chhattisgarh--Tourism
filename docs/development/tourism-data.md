# CG Tourism Platform — Tourism Data & Content System (Phase P5)

This document specifies the authoritative geographic catalog, category taxonomies, verification workflows, and database schema conventions for the Chhattisgarh Tourism OS (`Unseen36Garh`).

---

## 1. Geographic District Taxonomy

Chhattisgarh comprises **33 administrative districts** organized into **5 administrative divisions**. All destinations in the master catalog must belong to an authentic district name.

| Division | Official Districts | Cultural & Natural Highlights |
| :--- | :--- | :--- |
| **Bastar Division** | Bastar, Dantewada, Kanker, Kondagaon, Narayanpur, Bijapur, Sukma | Chitrakote Falls, Tirathgarh, Kanger Valley National Park, Kutumsar Caves, Dholkal Ganesh, Barsur Temples, Bastar Dussehra, Bell Metal / Dhokra Craft |
| **Raipur Division** | Raipur, Baloda Bazar, Gariaband, Mahasamund, Dhamtari | Purkhauti Muktangan, Barnawapara Sanctuary, Rajim Kumbh, Sirpur Buddhist & Hindu complex, Gangrel Dam, Sitanadi Wildlife Sanctuary, Jatmai-Ghatarani |
| **Durg Division** | Durg, Balod, Bemetara, Rajnandgaon, Kabirdham, Khairagarh-Chhuikhadan-Gandai, Mohla-Manpur-Ambagarh Chowki | Bhoramdeo Temple ("Khajuraho of CG"), Kawardha Palace, Tandula Dam, Ganga Maiya Temple, Dongargarh Maa Bamleshwari Temple, Maitri Bagh |
| **Bilaspur Division** | Bilaspur, Korba, Janjgir-Champa, Raigarh, Mungeli, Gaurela-Pendra-Marwahi, Sakti, Sarangarh-Bilaigarh | Achanakmar Tiger Reserve, Ratanpur Mahamaya Temple, Chaiturgarh Fort (Lafagarh), Hasdeo Bango Dam, Malhar, Shivrinarayan, Tala Deorani-Jethani |
| **Surguja Division** | Surguja, Jashpur, Koriya, Balrampur, Surajpur, Manendragarh-Chirmiri-Bharatpur (MCB) | Mainpat ("Shimla of CG" / Tibetan settlement), Ramgarh Hills, Sita Bengra & Jogimara Caves, Amrit Dhara Waterfall, Badalkhol Sanctuary, Kailash Gufa |

---

## 2. Category Taxonomy & Slugs

All destinations belong to a relational `Category` model indexed by a canonical, URL-safe slug:

| Category Slug | Name | Description & Visual Tone |
| :--- | :--- | :--- |
| `waterfall` | Waterfall | Cascades, plunge falls, and river rapids (e.g. Chitrakote, Tirathgarh, Amrit Dhara) |
| `national-park` | National Park | Protected national flora and fauna parks (e.g. Kanger Valley, Indravati) |
| `wildlife-sanctuary` | Wildlife Sanctuary | Protected habitat sanctuaries (e.g. Barnawapara, Sitanadi, Udanti, Badalkhol) |
| `tiger-reserve` | Tiger Reserve | Project Tiger reserves (e.g. Achanakmar Tiger Reserve) |
| `cave` | Cave | Stalactite, stalagmite, and historical cavern systems (e.g. Kutumsar, Kailash, Dandak) |
| `hill-station` | Hill Station | High-elevation plateaus and mountain valleys (e.g. Mainpat, Keshkal Valley, Sonhat Hills) |
| `nature-spot` | Nature Spot | Dams, reservoirs, forest canopies, and scenic trails (e.g. Gangrel Dam, Bango Reservoir) |
| `natural-wonder` | Natural Wonder | Geological phenomena and unexplainable wonders (e.g. Jaljali bouncy land, Kotumsar blind fish) |
| `heritage-temple` | Heritage Temple | Revered historic pilgrimage shrines (e.g. Bhoramdeo, Danteshwari, Dongargarh) |
| `ancient-temple` | Ancient Temple | Centenary and millennium archaeological stone temples (e.g. Barsur, Pali, Deobaloda) |
| `archaeological-site` | Archaeological Site | Excavations, ancient forts, rock art, and heritage ruins (e.g. Sirpur, Chaiturgarh, Malhar) |
| `pilgrimage` | Pilgrimage | Sacred spiritual confluence centers (e.g. Rajim, Champaran, Shivrinarayan, Belpan) |
| `heritage-town` | Heritage Town | Historic royal capitals and cultural towns (e.g. Ratanpur, Kanker Palace, Kawardha Palace) |
| `tribal-culture` | Tribal Culture & Craft | Living folklore, Haat bazaars, Dhokra metal casting, and woodcraft villages |

---

## 3. Destination Lifecycle & Verification Levels

The platform enforces a graduated verification workflow to reconcile contributor submissions with authoritative government and community moderation:

```
                  CONTRIBUTOR / CREATOR SUBMISSION
                                │
                                ▼
                       POST /places (API)
                                │
                     ┌──────────┴──────────┐
                     │  verified: false    │
                     │  status: UNVERIFIED │
                     └──────────┬──────────┘
                                │
                                ▼
                     MODERATION BACKLOG QUEUE
                    (GET /moderation/pending)
                                │
          ┌─────────────────────┴─────────────────────┐
          │                                           │
          ▼                                           ▼
   ADMIN / MODERATOR                           ADMIN / MODERATOR
   APPROVE (PATCH)                             REJECT (DELETE)
          │                                           │
          ▼                                           ▼
┌───────────────────────────────┐               ┌───────────┐
│ verified: true                │               │ Permanently│
│ verificationLevel:            │               │ Purged    │
│  - COMMUNITY                  │               └───────────┘
│  - CREATOR_VERIFIED           │
│  - OFFICIAL                   │
└───────────────────────────────┘
```

### Verification Level Definitions
- **`UNVERIFIED`**: Freshly submitted by a user or contributor; pending admin verification. Hidden from public `GET /places`.
- **`AI_ESTIMATED`**: Aggregated from social media or automated ingestion; coordinates estimated, awaiting field confirmation.
- **`COMMUNITY`**: Validated by trusted local community members or multi-user consensus.
- **`CREATOR_VERIFIED`**: Submitted and verified by an authorized platform Creator with attached field photo/video proof.
- **`OFFICIAL`**: Certified and vetted by the State Tourism Board or Forest Department.

---

## 4. REST API Reference

### Destinations

- **`GET /places`**
  - **Query Params**:
    - `category` (optional): Category slug (e.g. `waterfall`)
    - `district` (optional): District name (e.g. `Bastar`)
    - `search` (optional): Text search across destination name, description, and district
  - **Response**: Array of verified destinations with category, media, and parsed JSON metadata.

- **`GET /places/categories`**
  - **Description**: Returns all distinct categories alongside their verified destination counts.
  - **Response**:
    ```json
    [
      { "id": "uuid", "name": "Waterfall", "slug": "waterfall", "placeCount": 12 },
      { "id": "uuid", "name": "Heritage Temple", "slug": "heritage-temple", "placeCount": 9 }
    ]
    ```

- **`GET /places/districts`**
  - **Description**: Returns all distinct Chhattisgarh districts alongside their verified destination counts.
  - **Response**:
    ```json
    [
      { "name": "Balod", "placeCount": 2 },
      { "name": "Bastar", "placeCount": 18 },
      { "name": "Dantewada", "placeCount": 3 }
    ]
    ```

- **`GET /places/nearby`**
  - **Query Params**:
    - `lat` (required): Target latitude (Float)
    - `lng` (required): Target longitude (Float)
    - `radiusKm` (optional, default: 50): Search radius in kilometers
  - **Engine**: Executes PostGIS `ST_DWithin` with spatial geography indexing, automatically falling back to trigonometric Haversine formula if PostGIS extension is unconfigured.

- **`GET /places/:slug`**
  - **Param**: `slug` (e.g. `chitrakote-falls`)
  - **Response**: Full place profile including related media, weather conditions, transit links, metadata, and user reviews.

- **`POST /places`**
  - **Description**: Submits a new place to the moderation backlog.
  - **Validation**:
    - `name`, `description`, `district`, `categoryId`, `heroImage` (required)
    - `latitude`: Must fall within Chhattisgarh bounds (`17.0 <= lat <= 25.0`)
    - `longitude`: Must fall within Chhattisgarh bounds (`80.0 <= lng <= 85.0`)
    - Initial status: Automatically forced to `verified: false` and `verificationLevel: "UNVERIFIED"`.

---

## 5. Seed Dataset Integrity

The master dataset (`apps/backend/prisma/data/destinations/master_destinations.json`) provides 100 curated destinations:
- **Zero "Unknown" districts**: All 100 destinations belong to verified Chhattisgarh districts.
- **Zero "uncategorized" items**: All 100 destinations belong to defined category taxonomies.
- **Idempotent seeding**: Running `pnpm db:seed` clears tables in strict reverse foreign-key order, reinstating users, creators, categories, destinations, media, and multilingual translations without primary-key collisions.
