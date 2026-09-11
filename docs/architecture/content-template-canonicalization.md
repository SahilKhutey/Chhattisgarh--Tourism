# Content Template Architecture — Canonicalization Audit & Decision Record

**Status:** CANONICALIZED  
**Scope:** Elimination of competing backend content modules and duplicate frontend components. This document records the authoritative decision matrix, file-level actions, and architectural rationale.

---

## 1. Executive Decision Matrix

| Candidate Domain | Canonical Target | Retained Features & Rationale | Deprecated / Deleted Candidates |
| :--- | :--- | :--- | :--- |
| **Backend Core** | `modules/content-template` (singular) | Full lifecycle management (`ContentTemplateService`, `ContentEntryService`), fine-grained RBAC (`template-access.service.ts`), scheduled drift detection (`template-drift.scheduler.ts`), snapshot versioning, dual admin & public routing, registered in `app.module.ts`. | `modules/content-templates`<br>`modules/content`<br>`modules/content-entries`<br>`modules/templates` |
| **Frontend Builder** | `components/templates/` | Connected to App Router (`useRouter`), API integration (`src/lib/template.ts`), field configuration drawer (`FieldSettings.tsx`), palette (`FieldPalette.tsx`), live preview (`TemplatePreview.tsx`). Tested by `tests/template-builder.spec.ts`. | `components/template-builder/`<br>`components/template/` |
| **Frontend Renderer** | `components/content/GenericRenderer.tsx` | Active public & moderation renderer (`/content/[templateSlug]/[id]`, `/content/[templateSlug]/[entrySlug]`), supports `onReview` moderation callbacks, dynamic SSR-safe `GenericMap`, typed to canonical `ContentEntry`. Exports `ContentRenderer` and `RendererErrorBoundary`. | `components/content-renderer/`<br>`components/renderer/` |
| **Frontend Form** | `components/content/DynamicEntryForm.tsx` | Drives `/creator/entries/new`, `/creator/entries/new/[templateId]`, `/creator/entries/[id]`. Evaluated by `creator-entry.spec.ts`, `dynamic-entry.spec.ts`, and `template-engine-e2e.spec.ts`. | `components/template/DynamicEntryForm.tsx`<br>`components/dynamic-form/` |

---

## 2. Backend Inventory & Audit

### Candidate 1: `modules/content-template` (CANONICAL)
- **Source files:**
  - `content-template.controller.ts`: routes `/admin/templates` and `/templates`
  - `content-template.service.ts`: CRUD, version snapshotting, rollback, drift scanning integration
  - `content-entry.controller.ts`: routes `/content-entries` and `/entries`
  - `content-entry.service.ts`: CRUD, submission, moderation review, spatial bounding queries
  - `template-access.service.ts`: granular role-action authorization (ADMIN, MODERATOR, CREATOR)
  - `template-drift.scheduler.ts`: `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)` automated drift auditor
  - `template-types.ts`: typed status and field models
  - `dto/`: DTOs for templates and entries
- **Prisma Entities:** `ContentTemplate`, `TemplateField`, `TemplateVersion`, `ContentEntry`, `ContentAuditLog`, `ContentSearchIndex`
- **Imports / Integrations:** Integrated in `app.module.ts` as the sole content template provider.
- **Action:** **RETAIN & ENHANCE**.

### Candidate 2: `modules/content-templates` (DELETE)
- **Source files:** `content-templates.controller.ts`, `content-templates.module.ts`, `content-templates.service.ts`, `template-definition.validator.ts`, `template-validator.service.ts`
- **Audit:** Not registered in `app.module.ts`. Lacks versioning, rollback, and drift scheduler. Validation rules are superseded by `@cg-tourism/template-engine/schema`.
- **Action:** **DELETE**.

### Candidate 3: `modules/content` (DELETE)
- **Source files:** `content.controller.ts`, `content.module.ts`, `content.service.ts`, `public-content.controller.ts`, `slug/slug.service.ts`, `validators/entry-validator.service.ts`
- **Audit:** Not registered in `app.module.ts`. Referenced only by `discovery-lifecycle.spec.ts`.
- **Action:** Migrate `discovery-lifecycle.spec.ts` to canonical `ContentEntryService`, then **DELETE**.

### Candidate 4: `modules/content-entries` (DELETE)
- **Source files:** `content-entries.controller.ts`, `content-entries.module.ts`, `content-entries.service.ts`
- **Audit:** Not registered in `app.module.ts`. Direct duplicate of `content-template/content-entry.*`.
- **Action:** **DELETE**.

### Candidate 5: `modules/templates` (DELETE)
- **Source files:** `types/template.types.ts`
- **Audit:** Obsolete placeholder stub.
- **Action:** **DELETE**.

---

## 3. Frontend Inventory & Audit

### Builder Candidates
- **`components/templates/` (CANONICAL):** Full builder system featuring `TemplateBuilder.tsx`, `FieldPalette.tsx`, `FieldSettings.tsx`, and `TemplatePreview.tsx`. Consumed by `/admin/templates/new` and `/admin/templates/[id]/builder`.
- **`components/template-builder/` (DELETE):** Disconnected mock with isolated types and no router or API connection.
- **Action:** Keep `components/templates/`. Remove `components/template-builder/`.

### Renderer Candidates
- **`components/content/GenericRenderer.tsx` (CANONICAL):** Canonical dynamic renderer consumed across App Router routes with moderation and GIS map support. Exports `ContentRenderer` and `RendererErrorBoundary`.
- **`components/content-renderer/` (DELETE):** Disconnected mock renderer.
- **`components/renderer/` (DELETE):** Unused plugin-style renderer experiment.
- **Action:** Standardize on `components/content/GenericRenderer.tsx`. Remove `components/content-renderer/` and `components/renderer/`.

### Entry Form Candidates
- **`components/content/DynamicEntryForm.tsx` (CANONICAL):** Production dynamic form backed by `DynamicFieldRenderer.tsx` and `DynamicField.tsx`. Consumed across creator routes.
- **`components/template/DynamicEntryForm.tsx` (DELETE):** Prototype coupled to dead `renderer/field-registry.ts`.
- **`components/dynamic-form/` (DELETE):** Orphaned duplicate.
- **Action:** Keep `components/content/DynamicEntryForm.tsx`. Remove `components/template/` and `components/dynamic-form/`.

---

## 4. Verification & Zero-Error Build Standards

All deprecations and removals must satisfy:
1. `pnpm --filter backend test` (100% pass)
2. `pnpm --filter web test` (100% pass)
3. `pnpm typecheck` (zero TypeScript errors across all 5 workspace projects)
4. `pnpm build` (zero-error production build)
