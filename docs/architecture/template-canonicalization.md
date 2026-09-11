# Template Canonicalization

## Canonical Backend

`apps/backend/src/modules/content-template/` (Production NestJS Kernel)  
`backend/app/modules/content_template/` (P1 Reference Architecture)

## Canonical Contract

`packages/template-contract/` (`@cg-tourism/template-contract`)

## Canonical UI

`packages/ui/src/template/` (`@cg-tourism/ui`)

## Canonical Renderer

`packages/ui/src/content-renderer/` (`@cg-tourism/ui`)  
`apps/web/src/components/content/GenericRenderer.tsx` (Production App Router Renderer)

## Rules

1. **No duplicate Template contracts:** All consumers must derive types from `@cg-tourism/template-contract`.
2. **No direct database access from frontend:** UI components interface with the Admin API Gateway only.
3. **Template mutations go through application services:** Validation and business rules execute server-side within the domain boundary.
4. **Historical versions are immutable:** Template versions are never mutated; rollbacks move the live version pointer.
5. **Destructive deletion requires an explicit migration:** Automated scanners audit and fingerprint dependencies before deprecation.
6. **Deprecated modules must not receive new functionality:** Decommissioned routes and files are locked and removed cleanly.
