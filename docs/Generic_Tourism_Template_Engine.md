# Generic Tourism Content Template & Render Engine

## 1. Executive Summary

The **Generic Tourism Content Engine** replaces hardcoded content models (`PlaceModule`, `FestivalModule`, `FolkloreModule`, `CuisineModule`, etc.) with a pure schema-driven primitive:

$$\text{Template} \longrightarrow \text{Dynamic Form} \longrightarrow \text{Content Entry} \longrightarrow \text{Validation} \longrightarrow \text{Moderation} \longrightarrow \text{Published} \longrightarrow \begin{cases} \text{Discovery Index} \\ \text{Map / Geo} \\ \text{Generic Renderer} \end{cases}$$

No tourism entity is hardcoded into the application codebase. New content types (e.g. Wildlife Sanctuary, Bastar Craft, Waterfalls, Heritage Trails, Tribal Festivals) are defined dynamically by administrators as templates, authored by creators via dynamically generated forms, verified by moderators, indexed with PostGIS spatial coordinates and full-text search, and rendered publicly with polymorphic renderers.

---

## 2. End-to-End Architecture

```
ADMIN
  │
  ├── Create Template (Name, Slug, Description)
  ├── Configure Fields (16 Canonical Field Types)
  ├── Live Preview (Creator Form & Public Experience View)
  └── Publish Template
         │
         ▼
CREATOR
  │
  ├── Dynamic Entry Form (Generated from Template Schema)
  ├── Polymorphic Inputs & Client-Side Validation
  └── Draft ──► Submit for Review
                    │
                    ▼
MODERATOR
  │
  ├── Audit Log Tracking & State Transition
  ├── Atomic Prisma $transaction
  └── Approve ──► PUBLISHED
        │
  ┌─────┴───────────────────────────┐
  ▼                                 ▼
DISCOVERY & GEO INDEXING      GENERIC RENDER ENGINE
  │                                 │
  ├── Full-Text Search Index        ├── Canonical Field Registry (16 types)
  ├── PostGIS Spatial Queries       ├── DOMPurify HTML Sanitization
  └── Autocomplete & Suggestions    ├── Leaflet SSR Guard (GeoField)
                                    ├── Resilient Error Boundaries
                                    └── SEO Metadata & Dynamic Sitemap
                                          │
                                          ▼
                                 PUBLIC TOURISM UI
                              (/content/:template/:entry)
```

---

## 3. Canonical Field Types (16 Supported Types)

| Field Type | Description | Frontend Component | Database Representation |
| :--- | :--- | :--- | :--- |
| `TEXT` | Single-line plain text string | `TextField` | JSON string |
| `TEXTAREA` | Multiline text with preserved spacing | `TextAreaField` | JSON string |
| `RICHTEXT` | Formatted HTML content with DOMPurify sanitization | `RichTextField` | Sanitized HTML string |
| `NUMBER` | Numeric values (elevations, counts, fees) | `NumberField` | JSON number |
| `BOOLEAN` | Boolean flag with affirmative/negative badge | `BooleanField` | JSON boolean |
| `DATE` | Localized calendar date string | `DateField` | ISO 8601 date string |
| `DATETIME` | Localized date and timestamp | `DateTimeField` | ISO 8601 datetime string |
| `TIME` | Localized time of day | `TimeField` | Time string |
| `IMAGE` | Single image URL with responsive container | `ImageField` | URL string |
| `GALLERY` | Multiple image URLs with modal lightbox preview | `GalleryField` | Array of URL strings |
| `TAGS` | Array of keyword badge pills | `TagsField` | Array of strings |
| `DROPDOWN` | Single-select categorical choice badge | `DropdownField` | Selected value string |
| `MULTI_SELECT`| Multiple choice pills from configured options | `MultiSelectField` | Array of selected strings |
| `GEO_POINT` | Geographic coordinates with Leaflet map embed | `GeoField` | `{ lat: number, lng: number }` |
| `MAP_REGION` | Regional boundary coordinates / GeoJSON | `GeoField` | GeoJSON polygon / bounds |
| `RELATION` | Foreign reference link to related content entries | `RelationField` | Slug / ID reference object |
| `VIDEO` | Embedded video iframe (YouTube) or HTML5 player | `VideoField` | Video URL string |
| `AUDIO` | HTML5 audio player controls | `AudioField` | Audio URL string |

---

## 4. Subsystem Breakdown

### 4.1 Schema Definition Layer (`packages/template-engine`)
- **Independent Package**: Pure TypeScript package without database or UI framework dependencies.
- **Validators**: `TemplateSchemaValidator` validates field keys, slug uniqueness, and circular relation detection.
- **Serialization**: `TemplateSchemaSerializer` ensures deterministic schema hashing and serialization.

### 4.2 Database & Caching Layer (`apps/backend`)
- **Prisma Schema Models**:
  - `ContentTemplate`: Versioned template definitions with status lifecycle (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
  - `TemplateField`: Dynamic field specifications with `fieldType`, `order`, `required`, `helpText`, and `options`.
  - `ContentEntry`: Dynamic entry payload (`data Json`), coordinates (`lat`, `lng`, `location geography(Point, 4326)`), administrative geography (`region`, `division`, `district`), and review status (`DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`).
  - `ContentAuditLog`: Immutable history of state changes and reviewer notes.
  - `ContentSearchIndex`: Denormalized full-text and geo discovery index table.
- **PostGIS Integration**: Spatial queries with `ST_DWithin` and `ST_Distance`.
- **Redis Caching**: Cache invalidation on template and entry lifecycle transitions.

### 4.3 Discovery & Indexing Engine (`apps/backend/src/modules/discovery`)
- **`DiscoveryIndexerService`**: Aggregates entry text into searchable vectors, extracts tags, and synchronizes spatial coordinates.
- **`RankingService`**: Deterministic match scoring: exact title match (+100), prefix match (+75), substring (+50), text match (+25), tag match (+40).
- **`SuggestionService`**: Autocomplete suggestion engine for interactive search bars.
- **`PublicContentController`**: Double-gated retrieval (`entry.status === 'PUBLISHED'` and `template.status === 'PUBLISHED'`).

### 4.4 Frontend Experience Layer (`apps/web`)
- **`ContentRenderer`**: Schema-agnostic public renderer sorting fields, filtering empty values, rendering hero image banners, and embedding interactive maps.
- **`DynamicEntryForm`**: Form generator providing client-side validation and responsive inputs for creators.
- **`TemplatePreview`**: Real-time dual preview for administrators (Desktop / Mobile viewports with form & public experience tabs).
- **`RendererErrorBoundary`**: Error boundaries isolating individual field errors to preserve page availability.
- **`buildMetadata` & `sitemap.ts`**: Automatic SEO metadata and dynamic XML sitemap generation.

---

## 5. Verification & Testing

The engine includes 103 test suites (576 tests) passing cleanly across the monorepo:
- **Backend Tests**: 76 suites, 454 tests passing.
- **Web Tests**: 27 suites, 122 tests passing.
- **Schema Engine**: 28 unit tests passing.
- **TypeScript**: 0 compilation errors with strict type checking.
