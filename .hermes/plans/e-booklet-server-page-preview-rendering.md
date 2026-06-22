# E-Booklet Server Page Preview Rendering Plan

## Goal

Replace client-side PDF rendering for e-booklet hotspot editing/viewing with server-generated page preview images, so PDF text renders consistently and hotspot coordinates never drift from the visible page.

## Non-Goals

- Do not change the hotspot coordinate model. Keep `x_percent`, `y_percent`, `width_percent`, and `height_percent` as percentages of a single page.
- Do not remove the original PDF assets. Keep them for archival/admin inspection and future regeneration.
- Do not introduce a full PDF viewer as the placement surface.
- Do not change checkout, access-code, purchase, or invite business rules.

## Current-State Findings

- Admin hotspot editing is in `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletEditorPage.jsx`.
- Admin editor currently stores and places hotspots relative to `pageRef` using percent coordinates from `pageRef.getBoundingClientRect()`.
- The backend file preview endpoint is `GET /admin/e-booklet-files/:assetId/preview` in `kalima-platform/backend/src/apps/store-api/controllers/e-booklet.controller.ts`.
- E-booklet file/preview access is implemented in `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`.
- Current backend single-page PDF extraction uses `extractSinglePagePdf()` with `pdf-lib`, which is not suitable for visual-proof rendering.
- Current Prisma schema is `kalima-platform/prisma/schema.prisma`; obfuscated model aliases map to:
  - `e_booklet_template_versions` = `α1`
  - `e_booklet_file_assets` = `α2`
  - `e_booklet_hotspots` = `α3`
- Existing frontend viewer page `kalima-platform/frontend/src/pages/e-booklets/EBookletViewerPage.jsx` also uses a PDF.js canvas for secured PDF document pages.

## Target Architecture

On PDF upload or version save, generate raster page preview images on the backend. The admin editor and student/teacher viewer render a plain `<img>` inside a fixed-ratio page wrapper. Hotspots remain absolutely positioned as percentages over the same wrapper.

Data flow:

1. Admin or teacher uploads a PDF e-booklet document.
2. Backend stores the original PDF as an `e_booklet_file_assets` row.
3. Backend rasterizes each PDF page into WebP or PNG previews at one or more sizes.
4. Backend stores preview metadata linked to the document asset and page number.
5. Frontend fetches page preview URL plus dimensions.
6. Frontend renders the preview image inside `pageRef` and overlays hotspots in percent coordinates.

Recommended renderer:

- Prefer Poppler CLI (`pdfinfo`, `pdftoppm`) or MuPDF (`mutool draw`) on the backend.
- Output WebP when possible; otherwise PNG fallback.
- Use deterministic dimensions from the raster output as preview dimensions.

## Data Model

Add a new Prisma model/table, proposed name `e_booklet_page_previews`.

Fields:

- `id` primary key
- `document_file_id` foreign key to `e_booklet_file_assets.id`
- `template_version_id` nullable foreign key to `e_booklet_template_versions.id`
- `page_number` integer
- `width_px` integer
- `height_px` integer
- `image_file_id` foreign key to `e_booklet_file_assets.id`, or `storage_key` string if previews should not be represented as normal file assets
- `format` string, e.g. `webp` or `png`
- `size_key` string, e.g. `default`, `mobile`, `large` if responsive variants are implemented
- `created_at`, `updated_at`

Indexes and constraints:

- Unique on `[document_file_id, page_number, size_key]`
- Index on `[template_version_id, page_number]`
- Cascade/delete previews when the original document asset is deleted if supported by current data lifecycle.

Implementation choice:

- Prefer reusing `e_booklet_file_assets` for each generated image if the app already depends on centralized file serving and permissions.
- If preview files should be internal implementation details, store `storage_key` directly in `e_booklet_page_previews` and serve only through explicit e-booklet preview endpoints.

## API Contract

Admin editor endpoint:

- `GET /admin/e-booklet-files/:assetId/page-previews/:pageNumber`
- Auth: admin route auth, same as existing admin file preview.
- Response: image bytes, `Content-Type: image/webp` or `image/png`.
- Headers: private/no-store for draft/private documents.

Metadata endpoint option:

- Extend template version responses to include page preview metadata, or add:
- `GET /admin/e-booklet-files/:assetId/page-previews`
- Response includes `page_number`, `width_px`, `height_px`, `format`, and image URL.

Viewer endpoint:

- `GET /e-booklet-instances/:instanceId/document/page-previews/:pageNumber`
- `GET /admin/e-booklet-instances/:instanceId/document/page-previews/:pageNumber` for admin preview mode.
- Auth/token behavior should mirror current viewer document page access.
- Preserve device/access enforcement before returning image bytes.

## Compatibility Strategy

- Keep current PDF document serving endpoints during rollout.
- For existing PDFs without generated previews, frontend shows a clear “preview is being generated” state or backend lazily generates previews on first request.
- Backfill existing e-booklet document assets before removing the old PDF rendering path.
- Do not mark the old renderer removed until admin editor and viewer page both use image previews successfully.

## Risks

- Server dependencies may not be present in Docker/VPS images. Dockerfile and deployment must install Poppler or MuPDF.
- Large PDFs can create long upload latency. Prefer queue/background generation if uploads become slow.
- Preview images can increase disk usage. Add cleanup rules when document assets or template versions are replaced.
- Very high-resolution previews can increase mobile bandwidth. Generate responsive sizes or cap default preview width.
- If image `object-fit` or padding is wrong, hotspots can drift. The page wrapper must be sized to the same aspect ratio and the image must fill it exactly.

## Acceptance Criteria

- Admin editor page displays PDF content as a generated image, not a client PDF canvas/viewer.
- Hotspot placement and drag/resize remain percentage-based relative to the visible page image box.
- Student/teacher viewer displays the same generated page image under hotspots.
- The problematic PDF no longer shows scrambled letters in the admin editor.
- Existing hotspot coordinates align before and after the renderer change for at least one known e-booklet.
- Older mobile devices load only image previews, not PDF parsing/rendering code for e-booklet pages.
- Backend build/tests and frontend build pass.

## Task Order

### Task 1 — Add Page Preview Schema

Files: `kalima-platform/prisma/schema.prisma`, generated Prisma client files as required by repo workflow.

Goal: Persist page preview metadata linked to original e-booklet document assets.

Steps:

- Add `e_booklet_page_previews` model with fields from the Data Model section.
- Add relations to `e_booklet_file_assets` and optionally `e_booklet_template_versions`.
- Add unique/index constraints.
- Generate and commit the Prisma migration according to this repo’s Prisma setup.

Verification:

- Run backend Prisma generation/migration validation command used in this repo.
- Run `npm run build` in `kalima-platform/backend`.

Acceptance:

- Prisma client exposes the new preview model.
- Migration applies cleanly on a local/dev database.

### Task 2 — Add Server Rasterization Service

Files: `kalima-platform/backend/src/apps/store-api/services/e-booklet-page-preview.service.ts` (new), `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`.

Goal: Generate deterministic image previews for every PDF page.

Steps:

- Add a service that accepts `{ documentAssetId, templateVersionId?, absolutePdfPath }`.
- Use Poppler or MuPDF via `child_process` with safe argument arrays, not shell string interpolation.
- Render each page to a temporary directory, then move generated images into the e-booklet upload directory.
- Store `width_px`, `height_px`, `format`, and storage reference rows.
- Make generation idempotent: delete/replace previews for the same `document_file_id` before regenerating.
- Validate PDF page count matches existing metadata where available.

Verification:

- Add a narrow unit/integration test around command construction and preview row creation with mocked renderer execution.
- Run backend test target for e-booklet tests.

Acceptance:

- Given a PDF asset, the service creates one preview row per page.
- Re-running generation replaces stale previews without duplicate rows.

### Task 3 — Wire Preview Generation Into Upload/Version Save

Files: `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`, related DTO/controller files if needed.

Goal: Ensure new PDFs have previews ready for editor/viewer use.

Steps:

- Locate document upload flow in `e-booklet.service.ts` where page count and dimensions are detected.
- Trigger preview generation after a successful document upload or after template version save with `base_document_file_id`.
- For teacher/custom documents, trigger generation for the delivered custom document as well.
- Decide sync vs async:
  - Phase 1: synchronous generation is acceptable for smaller PDFs if upload remains tolerable.
  - Phase 2: background queue if generation time becomes a production issue.
- Add status handling if async is chosen: `pending`, `ready`, `failed`.

Verification:

- Upload a test PDF in local/dev and confirm preview rows/files exist.
- Backend e-booklet tests pass.

Acceptance:

- New e-booklet document uploads create page previews without manual intervention.

### Task 4 — Add Preview Serving APIs

Files: `kalima-platform/backend/src/apps/store-api/routes/e-booklet.routes.ts`, `kalima-platform/backend/src/apps/store-api/controllers/e-booklet.controller.ts`, `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`.

Goal: Serve generated page preview images with existing e-booklet authorization semantics.

Steps:

- Add admin route for direct document asset page preview.
- Add viewer route for student/teacher/admin instance page preview.
- Reuse current access checks from `getAuthorizedViewerDocument()` / `getAdminAuthorizedViewerDocument()`.
- Return `404` or a structured “not ready” error when previews are missing.
- Set correct `Content-Type`, `Content-Disposition: inline`, and private cache headers.

Verification:

- Add route tests for unauthorized access, valid access, missing preview, and valid image response.
- Run backend e-booklet route tests.

Acceptance:

- Authorized users can fetch only page previews they are allowed to view.
- Unauthorized users cannot fetch previews by guessing IDs.

### Task 5 — Replace Admin Editor PDF Surface With Image Surface

Files: `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletEditorPage.jsx`, `kalima-platform/frontend/src/hooks/admin/useAdminEBooklets.js`.

Goal: Admin editor displays generated page image under hotspots with zero drift.

Steps:

- Add hook method for preview image URL retrieval.
- Replace PDF renderer component with an `<img>` for selected page preview.
- Keep `pageRef` as the single coordinate container.
- Ensure wrapper uses `aspectRatio` from preview metadata or existing `page_dimensions_json`.
- Set image CSS: `position:absolute; inset:0; width:100%; height:100%; object-fit:fill; display:block;`.
- Keep click, drag, resize, and draft preview calculations unchanged.
- Add loading/error/not-ready states.

Verification:

- Run `npm run build` in `kalima-platform/frontend`.
- Browser smoke: open `/admin/e-booklets/:id/edit`, select hotspot step, verify page image fills container and hotspot click lands where clicked.

Acceptance:

- The editor no longer imports or uses PDF.js/EmbedPDF for the hotspot page surface.
- Hotspots visually align with page content while zooming and changing pages.

### Task 6 — Replace Viewer PDF Surface With Image Surface

Files: `kalima-platform/frontend/src/pages/e-booklets/EBookletViewerPage.jsx`, `kalima-platform/frontend/src/hooks/useEBookletAccess.js` or current viewer hook file.

Goal: Student/teacher/admin viewer uses the same generated image page surface.

Steps:

- Add viewer hook method to fetch authorized page preview URL.
- Replace `PdfDocumentPageCanvas` usage with `<img>` preview.
- Preserve access/device/page-token behavior before image URL fetch.
- Keep hotspot overlay coordinates unchanged.
- Preserve watermark and interaction overlays.

Verification:

- Run `npm run build` in `kalima-platform/frontend`.
- Browser smoke with student/teacher/admin viewer paths.

Acceptance:

- Viewer no longer parses/renders PDF client-side for e-booklet document pages.
- Hotspots align with the visible image page.

### Task 7 — Backfill Existing E-Booklet PDFs

Files: `kalima-platform/backend/src/apps/store-api/scripts/backfill-e-booklet-page-previews.ts` (new) or `kalima-platform/backend/scripts/backfillEBookletPagePreviews.js` depending repo script conventions.

Goal: Generate previews for existing e-booklet documents.

Steps:

- Query `e_booklet_template_versions` with `base_document_file_id` and `rendered_document_file_id`.
- Query `e_booklet_instances` with `custom_document_file_id`.
- Deduplicate document asset IDs.
- For each asset, generate previews if missing or if `--force` is passed.
- Log counts: skipped, generated, failed.
- Do not expose secrets or full filesystem paths in normal logs.

Verification:

- Run dry-run mode locally/dev.
- Run against a small subset with `--limit 1` or explicit asset ID.

Acceptance:

- Existing PDFs can be migrated without touching hotspot coordinate data.

### Task 8 — Add Operational Dependencies

Files: `kalima-platform/backend/Dockerfile`, `kalima-platform/docker-compose*.yml` if needed, deployment docs.

Goal: Ensure the PDF rasterizer exists wherever backend runs.

Steps:

- Install Poppler or MuPDF in the backend Docker image.
- Add startup health/check command or service function that verifies renderer availability.
- Document required package and local dev setup.
- Fail gracefully with a clear admin-facing error if renderer is missing.

Verification:

- Build backend Docker image locally if feasible.
- Run renderer availability check in dev container/server.

Acceptance:

- Production deploy has the binary required to generate previews.

### Task 9 — Add Cleanup and Regeneration Rules

Files: `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`, preview service file, optional cleanup script.

Goal: Avoid stale previews and uncontrolled disk growth.

Steps:

- When replacing a document file on a version, mark old previews orphaned or delete old preview files if no other version uses the document asset.
- Add regeneration method for admins/support.
- Add logs/audit entries for preview generation failures.

Verification:

- Test replacing a version document and confirm old preview rows do not remain active for the new document.

Acceptance:

- Preview files match the current document asset and stale rows are not served.

### Task 10 — Final Visual and Coordinate Verification

Files: no required code files unless defects are found.

Goal: Prove the solution fixes the reported PDF and preserves hotspot alignment.

Steps:

- Use the problematic PDF from `/admin/e-booklets/31/edit`.
- Compare original PDF visually against generated preview for page 1.
- Place a test hotspot at a known visual location.
- Reload page and confirm hotspot remains on the same visual point.
- Change zoom and page, then return and confirm alignment.
- Verify on a mobile viewport and desktop viewport.
- Verify student/teacher viewer path for the same document.

Verification:

- Frontend: `npm run build`.
- Backend: `npm run build` and targeted e-booklet tests.
- Browser screenshots for admin editor and viewer showing non-scrambled text and aligned hotspot.

Acceptance:

- The original reported scrambled text is gone.
- No visible hotspot drift on desktop or mobile.
- No client-side PDF rendering is required for e-booklet pages.

## Rollback Plan

- Keep original PDF assets and existing PDF endpoints unchanged during rollout.
- If generated previews fail in production, frontend can temporarily fall back to the previous PDF rendering path behind a feature flag.
- Disable preview generation by environment flag if renderer binary causes deployment issues.
- Since hotspot coordinates remain unchanged, rollback does not require data migration for hotspots.

## Recommended Build Order

1. Tasks 1-2: schema and generation service.
2. Tasks 3-4: upload wiring and secure serving APIs.
3. Task 5: admin editor image surface.
4. Task 6: viewer image surface.
5. Task 7: backfill existing documents.
6. Tasks 8-9: deployment dependencies and cleanup hardening.
7. Task 10: final proof.

## Done Definition

The work is done only when the problematic PDF renders correctly as a server-generated image in the admin editor, hotspots align in admin and viewer flows, existing e-booklets have previews generated or a safe not-ready state, and backend/frontend verification gates pass.
