# Template & Render Engine — Implementation Selection Matrix

This matrix documents the candidate implementations discovered across the repository, the canonical choices selected for production, the rationale, and the decommissioning status.

---

## Capability Selection Matrix

| # | Capability | Candidate A | Candidate B | Canonical Selection | Rationale | Status |
|---|---|---|---|---|---|---|
| **1** | **Schema & Types** | Ad-hoc TypeScript interfaces in `apps/backend/src/modules/content-templates/` | Modular Zod schemas in `@cg-tourism/template-engine/schema` | **`@cg-tourism/template-engine/schema`** | Provides runtime validation, static inference, and cross-tier code reuse across backend and frontend. | **Canonical** |
| **2** | **Template Builder** | `apps/web/src/components/template-builder/` | `apps/web/src/components/templates/TemplateBuilder.tsx` | **`components/templates/TemplateBuilder.tsx`** | Fully integrated with drag-and-drop field sorting, live JSON preview, validation rule editing, and version creation. | **Canonical** (Candidate A deleted) |
| **3** | **Dynamic Entry Form** | Hardcoded forms (`PlaceForm`, `FolkloreForm`) | `apps/web/src/components/content/DynamicEntryForm.tsx` | **`components/content/DynamicEntryForm.tsx`** | Purely data-driven form generated from template fields; supports 12+ field types including geo coordinates, gallery, and rich text. | **Canonical** |
| **4** | **Public Entry Renderer** | Hardcoded pages (`/places/[slug]`, `/folklore/[slug]`) & `components/renderer/` | `apps/web/src/components/content/DynamicEntryPage.tsx` | **`components/content/DynamicEntryPage.tsx`** | Standardized layout with hero imagery, responsive galleries, interactive maps, audio guide playback, and metadata grids. | **Canonical** (Legacy paths redirect 301) |
| **5** | **Live Preview** | Standalone iframe previewer | Inline responsive drawer in `DynamicEntryForm` / `TemplateBuilder` | **Inline Responsive Drawer** | Zero network latency, instant client-side state reflection, mobile/tablet/desktop viewport toggles. | **Canonical** |
| **6** | **Backend API Routes** | Split between `/admin/templates`, `/templates`, `/content-entries`, and `/content` | Consolidated `apps/backend/src/modules/content-template/` | **`modules/content-template/`** | Mounts all canonical routes under single controller with RBAC guards, unified DTO validation, and transaction isolation. | **Canonical** (Obsolete modules deleted) |
| **7** | **Versioning & Snapshots**| Mutable in-place updates | Immutable `TemplateVersion` records on publish with SemVer | **`TemplateVersion` Immutable Records** | Guarantees existing entries never break when template author updates field rules; enables pointer rollback. | **Canonical** |
| **8** | **Drift Detection** | Manual inspection | `TemplateDriftScheduler` (`@cg-tourism/template-engine/versioning`) | **`TemplateDriftScheduler` Cron** | Automated nightly drift audit comparing entries with active template versions, flagging un-migrated records. | **Canonical** |
| **9** | **Access Control (RBAC)**| Ad-hoc controller checks | `TemplateAccessService` with explicit role hierarchy | **`TemplateAccessService`** | Granular permissions (`canEditTemplate`, `canSubmitEntry`, `canReviewEntry`, `canPublishEntry`, `canViewDraft`). | **Canonical** |
| **10**| **Geo & Coordinates** | Inconsistent `lat`/`lng` vs `latitude`/`longitude` | Standardized `latitude`, `longitude`, PostGIS `geography(Point, 4326)` | **Standardized `latitude` / `longitude` + PostGIS** | Eliminates dual-coordinate drift, supports spatial GIST indexing, and allows unified distance/radius discovery. | **Canonical** (`lat`/`lng` removed) |

---

## Decommissioning Plan

1. **`apps/backend/src/modules/content-templates/`**: Fully decommissioned and deleted.
2. **`apps/backend/src/modules/content-entries/`**: Fully decommissioned and deleted.
3. **`apps/web/src/components/template-builder/`**: Fully decommissioned and deleted in favor of `apps/web/src/components/templates/`.
4. **`apps/web/src/components/content-renderer/` & `renderer/`**: Fully decommissioned and deleted in favor of `apps/web/src/components/content/`.
5. **Dual coordinate fields (`lat`, `lng`)**: Removed from `schema.prisma` in favor of `latitude` and `longitude`.
